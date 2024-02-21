class Choropleth {
  width = 0;
  height = 0;
  config = {};
  data = [];
  colorScale = null;
  xScale = null;
  yScale = null;

  constructor(_config, _data, _attribute) {
    this.config = {
      parentElement: document.querySelector(_config.parentElementSelector),
      parentElementSelector: _config.parentElementSelector,
      margin: _config.margin || { top: 40, right: 50, bottom: 40, left: 50 },
    };
    this.data = _data;
    this.attribute = _attribute;
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
    this.colorScale = d3
      .scaleLinear()
      .range(
        this.attribute === 'attribute1'
          ? ['#e2f2cf', '#306b0d']
          : ['#cfe2f2', '#0d306b']
      )
      .interpolate(d3.interpolateHcl);

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
    this.colorScale.domain(
      d3.extent(this.data.objects.counties.geometries, (d) =>
        d.properties.data &&
        d.properties.data[formData[this.attribute]] !== undefined
          ? Math.max(d.properties.data[formData[this.attribute]], 0)
          : 0
      )
    );
    legendBuilder.setChoroplethColorScale(this.attribute, this.colorScale);

    const dataGroup = this.chart
      .append('g')
      .attr('class', 'data-group')
      .attr('id', 'counties');

    const counties = dataGroup
      .selectAll('path')
      .data(topojson.feature(this.data, this.data.objects.counties).features)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', (d) => {
        return `county-boundary county-${d.properties.data?.cnty_fips}`;
      })
      .attr('fill', (d) => {
        if (
          d.properties.data &&
          d.properties.data[formData[this.attribute]] !== undefined &&
          d.properties.data[formData[this.attribute]] >= 0
        ) {
          return this.colorScale(d.properties.data[formData[this.attribute]]);
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
        // choroplethStore.update((s) => ({
        //   selectedData: s.selectedData.some(
        //     (sd) =>
        //       sd.properties.data.cnty_fips === d.properties.data.cnty_fips,
        //   )
        //     ? s.selectedData.filter(
        //         (sd) =>
        //           sd.properties.data.cnty_fips !== d.properties.data.cnty_fips,
        //       )
        //     : [...s.selectedData, d],
        // })),
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
            <i>(${formData.groupByAggregate})</i> 
            </p>
          <p>${d[formData.attribute1]}</p>
              
          <p>
            <strong>${attributesMap[formData.attribute2]}</strong>
            <i>(${formData.groupByAggregate})</i> 
            </p>
          <p>${d[formData.attribute2]}</p>
        `);
  }
  mouseLeaveTooltipCB(event) {
    d3.select('#tooltip').style('opacity', '0').style('pointer-events', 'none');
  }
}
