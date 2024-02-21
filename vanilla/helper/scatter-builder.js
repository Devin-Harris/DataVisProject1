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
    // Initialize linear and ordinal scales (input domain and output range)
    const att1Values = this.data.map((d) => d[formData.attribute1]);
    const att2Values = this.data.map((d) => d[formData.attribute2]);

    // Set the scale input domains
    this.xScale
      .domain([Math.min(...att1Values), Math.max(...att1Values)])
      .range([0, this.width])
      .nice();

    this.yScale
      .domain([Math.max(...att2Values), Math.min(...att2Values)])
      .range([0, this.height])
      .nice();

    this.colorScale.domain(
      this.data
        .map((d) =>
          getGroupByValue(
            // Color by state if showing data for each county to prevent duplicate coloring from so many counties
            formData.groupBy === 'County' ? 'State' : formData.groupBy,
            d
          )
        )
        .sort()
    );
    legendBuilder.setScatterColorScale(this.colorScale);

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
      .attr('class', 'data-point')
      .transition()
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
      .attr('cx', (d) =>
        formData.attribute1
          ? this.xScale(d[formData.attribute1])
          : this.width + 100
      )
      .transition()
      .attr('cy', (d) =>
        formData.attribute2
          ? this.yScale(d[formData.attribute2])
          : this.height + 100
      )
      .transition()
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

    // Tooltip event listeners
    // this.circles
    //   .on('mouseover', (event, d) => {
    //     d3
    //       .select('#tooltip')
    //       .style('display', 'block')
    //       .style('opacity', 1)
    //       .style('left', event.pageX + this.config.tooltipPadding + 'px')
    //       .style('top', event.pageY + this.config.tooltipPadding + 'px').html(`
    //           <div class="tooltip-title">${d.trail}</div>
    //           <div><i>${d.region}</i></div>
    //           <ul>
    //             <li>${d.distance} km, ~${d.time} hours</li>
    //             <li>${d.difficulty}</li>
    //             <li>${d.season}</li>
    //           </ul>
    //         `);
    //   })
    //   .on('mouseleave', () => {
    //     d3.select('#tooltip').style('display', 'block').style('opacity', 0);
    //   });

    // Update the axes/gridlines
    this.xAxisG.call(this.xAxis);
    this.yAxisG.call(this.yAxis);
  }
}
