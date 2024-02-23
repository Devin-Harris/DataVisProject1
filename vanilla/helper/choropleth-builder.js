class Choropleth {
  width = 0;
  height = 0;
  config = {};
  data = [];
  colorScale = null;
  xScale = null;
  yScale = null;

  attribute1Range = ['#e2f2cf', '#306b0d'];
  attribute2Range = ['#cfe2f2', '#0d306b'];

  constructor(_config, _data) {
    this.config = {
      parentElement: document.querySelector(_config.parentElementSelector),
      parentElementSelector: _config.parentElementSelector,
      margin: _config.margin || { top: 40, right: 50, bottom: 40, left: 50 },
    };
    this.data = _data;
    this.initVis();
    window.addEventListener('resize', () => {
      // Reinitialize because projection needs to be scaled to new width and height, but doing so auto appends map again causing layered maps when page resizes
      this.initVis();
    });
  }

  // Calculate inner chart size. Margin specifies the space around the actual chart.
  setWidthAndHeight() {
    this.width =
      this.config.parentElement.getBoundingClientRect().width -
      this.config.margin.left -
      this.config.margin.right;
    this.height =
      this.config.parentElement.getBoundingClientRect().height -
      this.config.margin.top -
      this.config.margin.bottom;
  }

  removeContent() {
    Array.from(this.config.parentElement.children).forEach((c) => c.remove());
  }

  destroy() {
    this.removeContent();
    delete this;
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    this.removeContent();
    this.setWidthAndHeight();

    // Initialize scales
    this.colorScale = d3.scaleLinear().interpolate(d3.interpolateHcl);

    // Initialize Projection and Path
    this.projection = d3
      .geoAlbersUsa()
      .translate([this.width / 2, this.height / 2])
      .scale(this.width + this.config.margin.left + this.config.margin.right);

    this.path = d3.geoPath().projection(this.projection);

    // Define SVG drawing area
    this.svg = d3.select(this.config.parentElementSelector);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    this.chart = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.config.margin.left},${this.config.margin.top / 2})`
      );

    this.updateVis();
  }

  updateData(data) {
    this.data = data;
    this.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    this.colorScale
      .range(
        formData.mapSelectedAttribute === 'attribute1'
          ? this.attribute1Range
          : this.attribute2Range
      )
      .domain(
        d3.extent(this.data.objects.counties.geometries, (d) =>
          d.properties.data &&
          d.properties.data[formData[formData.mapSelectedAttribute]] !==
            undefined
            ? Math.max(
                d.properties.data[formData[formData.mapSelectedAttribute]],
                0
              )
            : 0
        )
      );
    legendBuilder.setChoroplethColorScale(
      this.attribute1Range,
      this.attribute2Range,
      this.colorScale,
      this.data.objects.counties.geometries
    );

    const dataGroup = this.chart
      .append('g')
      .attr('class', 'data-group')
      .attr('id', 'counties');

    const counties = dataGroup
      .selectAll('path')
      .data(topojson.feature(this.data, this.data.objects.counties).features)
      .enter()
      .append('path');

    counties
      .attr('d', this.path)
      .attr('class', (d) => {
        const data = d.properties.data;
        if (!data) {
          return '';
        }

        const classes = ['county-boundary', `county-${data?.cnty_fips}`];

        if (selectedPoints?.has(getGroupByValue(formData.groupBy, data))) {
          classes.push('selected');
        }

        return classes.join(' ');
      })
      .transition()
      .attr('fill', (d) => {
        if (
          d.properties.data &&
          d.properties.data[formData[formData.mapSelectedAttribute]] !==
            undefined &&
          d.properties.data[formData[formData.mapSelectedAttribute]] >= 0
        ) {
          return this.colorScale(
            d.properties.data[formData[formData.mapSelectedAttribute]]
          );
        } else {
          return 'url(#lightstripe)';
        }
      });

    const stateBorders = this.chart
      .append('path')
      .datum(
        topojson.mesh(this.data, this.data.objects.states, function (a, b) {
          return a !== b;
        })
      )
      .attr('id', 'state-borders')
      .attr('d', this.path);

    counties
      .on('mouseover', (event, d) =>
        this.mouseOverTooltipCB(event, d.properties.data)
      )
      .on('mouseleave', () => this.mouseLeaveTooltipCB())
      .on('click', (e, d) => {
        const data = d.properties.data;
        const value = getGroupByValue(formData.groupBy, data);

        if (selectedPoints.has(value)) {
          selectedPoints.delete(value);
        } else {
          selectedPoints.add(value);
        }
        this.updateVis();
      });

    const tooltip = d3.select('#tooltip');
    tooltip.on('mouseover', () => {
      tooltip.style('opacity', 1).style('pointer-events', 'all');
    });
    tooltip.on('mouseleave', () => {
      tooltip.style('opacity', 0).style('pointer-events', 'none');
    });
  }

  mouseOverTooltipCB(event, d) {
    const tooltip = d3.select('#tooltip');
    const tooltipElm = tooltip.node();
    const tooltipBounds = tooltipElm.getBoundingClientRect();
    const chartBounds = this.config.parentElement.getBoundingClientRect();
    tooltip
      .style('pointer-events', 'all')
      .style('opacity', '1')
      .style(
        'left',
        Math.min(
          event.pageX,
          chartBounds.x + chartBounds.width - tooltipBounds.width
        ) + 'px'
      )
      .style(
        'top',
        Math.min(
          event.pageY,
          chartBounds.y + chartBounds.height - tooltipBounds.height
        ) + 'px'
      ).html(`
          <small>${d.display_name}</small>
          <p>
            <strong>${attributesMap[formData.attribute1]}</strong>
            </p>
          <p>${d[formData.attribute1]}</p>
              
          <p>
            <strong>${attributesMap[formData.attribute2]}</strong>
            </p>
          <p>${d[formData.attribute2]}</p>
        `);
  }
  mouseLeaveTooltipCB(event) {
    d3.select('#tooltip').style('opacity', '0').style('pointer-events', 'none');
  }
}
