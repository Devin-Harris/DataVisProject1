class Scatterplot {
  width = 0;
  height = 0;
  config = {};
  data = [];
  colorScale = null;
  xScale = null;
  yScale = null;

  constructor(_config, _data) {
    this.config = {
      parentElement: document.querySelector(_config.parentElementSelector),
      parentElementSelector: _config.parentElementSelector,
      margin: _config.margin || { top: 40, right: 50, bottom: 40, left: 50 },
    };
    this.data = _data;
    this.initVis();
    window.addEventListener('resize', () => {
      this.setWidthAndHeight();
      this.updateVis();
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
    this.colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    this.xScale = d3.scaleLinear().range([0, this.width]).nice();
    this.yScale = d3.scaleLinear().range([0, this.height]).nice();

    // Initialize axes
    this.xAxis = d3.axisBottom(this.xScale);
    this.yAxis = d3.axisLeft(this.yScale);

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

    // Append empty x-axis group and move it to the bottom of the chart
    this.xAxisG = this.chart
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${this.height})`);

    // Append y-axis group
    this.yAxisG = this.chart.append('g').attr('class', 'axis y-axis');

    // Append both axis titles
    this.xAxisG
      .append('text')
      .attr('class', 'axis-title x-axis-title')
      .attr('x', this.width / 2)
      .attr('y', 30)
      .style('text-anchor', 'middle')
      .attr('fill', '#5D6971')
      .text(attributesMap[formData.attribute1]);

    this.yAxisG
      .append('text')
      .attr('class', 'axis-title y-axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -30)
      .attr('x', -1 * (this.height / 2))
      .style('text-anchor', 'middle')
      .attr('fill', '#5D6971')
      .text(attributesMap[formData.attribute2]);

    this.brush = d3.brush();
    this.chart.call(
      d3.brush().on('start brush end', (e) => {
        let extent = e.selection;
        selectedPoints.clear();

        formBuilder.storeSelection(e.selection, chartType.Scatter);

        if (extent && extent[0] && extent[1]) {
          this.circles.each((d, i, j) => {
            let circle = j[i];
            // Is the circle in the selection?
            let isBrushed =
              extent[0][0] <= +circle.getAttribute('cx') &&
              extent[1][0] >= +circle.getAttribute('cx') &&
              extent[0][1] <= +circle.getAttribute('cy') &&
              extent[1][1] >= +circle.getAttribute('cy');

            if (isBrushed) {
              selectedPoints.add(getGroupByValue(formData.groupBy, d));
            }
          });
        }
        this.updateVis();
      })
    );

    this.updateVis(false);

    if (storedSelection[chartType.Scatter]) {
      this.chart
        .transition()
        .call(this.brush.move, storedSelection[chartType.Scatter]);
    }
  }

  updateData(data) {
    this.data = data;
    console.log(data);
    this.updateVis();
  }

  updateScales() {
    // Initialize linear and ordinal scales (input domain and output range)
    this.colorScale.domain(
      this.data
        .map((d) =>
          getGroupByValue(
            // Color by state if showing data for each county to limit duplicate coloring from so many counties
            formData.groupBy === 'County' ? 'State' : formData.groupBy,
            d
          )
        )
        .sort()
    );
    legendBuilder.setScatterColorScale(this.colorScale);

    const att1Values = this.data
      .filter((d) => {
        if (formData.groupBy === 'County') {
          return selectedLegendGroups.has(d.state);
        } else if (formData.groupBy === 'State') {
          return selectedLegendGroups.has(d.state);
        } else {
          return selectedLegendGroups.has(d.urban_rural_status);
        }
      })
      .map((d) => d[formData.attribute1]);
    const att2Values = this.data
      .filter((d) => {
        if (formData.groupBy === 'County') {
          return selectedLegendGroups.has(d.state);
        } else if (formData.groupBy === 'State') {
          return selectedLegendGroups.has(d.state);
        } else {
          return selectedLegendGroups.has(d.urban_rural_status);
        }
      })
      .map((d) => d[formData.attribute2]);

    // Set the scale input domains
    this.xScale
      .domain([Math.min(...att1Values), Math.max(...att1Values)])
      .range([0, this.width])
      .nice();

    this.yScale
      .domain([Math.max(...att2Values), Math.min(...att2Values)])
      .range([0, this.height])
      .nice();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis(transition = true) {
    this.updateScales();

    // Set axis labels
    d3.select('.x-axis-title')
      .attr('x', this.width / 2)
      .text(attributesMap[formData.attribute1]);
    d3.select('.y-axis-title')
      .attr('x', -1 * (this.height / 2))
      .text(attributesMap[formData.attribute2]);

    // Add circles
    this.circles = this.chart
      .selectAll('circle')
      .data(this.data)
      .join('circle')
      .attr('class', (d) => {
        const classes = ['data-point'];

        if (formData.groupBy === 'County') {
          classes.push(selectedLegendGroups.has(d.state) ? 'shown' : 'hidden');
        } else if (formData.groupBy === 'State') {
          classes.push(selectedLegendGroups.has(d.state) ? 'shown' : 'hidden');
        } else {
          classes.push(
            selectedLegendGroups.has(d.urban_rural_status) ? 'shown' : 'hidden'
          );
        }

        if (selectedPoints?.has(getGroupByValue(formData.groupBy, d))) {
          classes.push('selected');
        }

        return classes.join(' ');
      });

    this.circles
      .transition()
      .duration(transition ? 250 : 0)
      .attr('fill', (d) =>
        this.colorScale(
          getGroupByValue(
            // Color by state if showing data for each county to prevent duplicate coloring from so many counties
            formData.groupBy === 'County' ? 'State' : formData.groupBy,
            d
          )
        )
      )
      .transition()
      .duration(transition ? 250 : 0)
      .attr('cx', (d) => {
        let scaleVal = this.xScale(d[formData.attribute1]);
        return isNaN(scaleVal) ? 0 : scaleVal;
      })
      .transition()
      .duration(transition ? 250 : 0)
      .attr('cy', (d) => {
        let scaleVal = this.yScale(d[formData.attribute2]);
        return isNaN(scaleVal) ? 0 : scaleVal;
      })
      .transition()
      .duration(transition ? 250 : 0)
      .attr(
        'r',
        formData.groupBy === 'State'
          ? 20
          : formData.groupBy === 'UrbanRuralStatus'
          ? 40
          : 5
      )
      .attr('opacity', 0.8)
      .attr('stroke', 'gray')
      .attr('stroke-width', 1);

    this.circles
      .on('mouseover', (event, d) => this.mouseOverTooltipCB(event, d))
      .on('mouseleave', () => this.mouseLeaveTooltipCB());

    const tooltip = d3.select('#tooltip');
    tooltip.on('mouseover', () => {
      tooltip.style('opacity', 1).style('pointer-events', 'all');
    });
    tooltip.on('mouseleave', () => {
      tooltip.style('opacity', 0).style('pointer-events', 'none');
    });

    // Update the axes/gridlines
    this.xAxisG.call(this.xAxis);
    this.yAxisG.call(this.yAxis);
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
