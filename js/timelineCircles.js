class TimelineCircles {
   constructor(_config, _data) {
      this.config = {
         parentElement: _config.parentElement,
         containerWidth: _config.containerWidth || 500,
         containerHeight: _config.containerHeight || 140,
         margin: { top: 40, right: 50, bottom: 10, left: 50 },
         tooltipPadding: _config.tooltipPadding || 15,
      };

      this.data = _data;

      this.initVis();
   }

   initVis() {
      // Width and height as the inner dimensions of the chart area- as before
      this.width =
         this.config.containerWidth -
         this.config.margin.left -
         this.config.margin.right;
      this.height =
         this.config.containerHeight -
         this.config.margin.top -
         this.config.margin.bottom;

      this.svg = d3
         .select(this.config.parentElement)
         .attr('width', this.config.containerWidth)
         .attr('height', this.config.containerHeight);

      this.chart = this.svg
         .append('g')
         .attr(
            'transform',
            `translate(${this.config.margin.left}, ${this.config.margin.top})`
         );

      // Initialize linear and ordinal scales (input domain and output range)
      this.xScale = d3.scaleLinear().domain([0, 365]).range([0, this.width]);

      this.yScale = d3
         .scaleLinear()
         .domain([
            d3.max(this.data, (d) => d.year),
            d3.min(this.data, (d) => d.year),
         ])
         .range([0, this.height]);

      this.rScale = d3
         .scaleLinear()
         .domain(d3.extent(this.data, (d) => d.cost))
         .range([5, 100]);

      // Construct a new ordinal scale with a range of ten categorical colours
      this.colorPalette = d3.scaleOrdinal(d3.schemeTableau10);
      this.colorPalette.domain(
         'tropical-cyclone',
         'drought-wildfire',
         'severe-storm',
         'flooding'
      );

      // Initialize axes
      this.xAxis = d3.axisTop(this.xScale);
      this.yAxis = d3.axisLeft(this.yScale);

      // Draw the axis
      this.xAxisGroup = this.chart
         .append('g')
         .attr('class', 'axis x-axis')
         .call(this.xAxis);

      this.yAxisGroup = this.chart
         .append('g')
         .attr('class', 'axis y-axis')
         .call(this.yAxis);

      this.updateVis();
   }

   updateVis() {
      this.circles = this.chart
         .selectAll('circle')
         .data(this.data)
         .join('circle')
         .attr('fill', (d) => this.colorPalette(d.category))
         .attr('opacity', 0.8)
         .attr('stroke', 'gray')
         .attr('stroke-width', 2)
         .attr('r', (d) => this.rScale(d.cost))
         .attr('cy', (d) => this.yScale(d.year))
         .attr('cx', (d) => this.xScale(d.daysFromYrStart));

      // this.circles
      //    .on('mouseover', (event, d) => {
      //       d3
      //          .select('#tooltip')
      //          .style('display', 'block')
      //          .style('left', event.pageX + this.config.tooltipPadding + 'px')
      //          .style('top', event.pageY + this.config.tooltipPadding + 'px')
      //          .html(`
      //         Hello I am a tooltip.  Do better than this.
      //       `);
      //    })
      //    .on('mouseleave', () => {
      //       d3.select('#tooltip').style('display', 'none');
      //    });
   }

   renderVis() {}
}
