<script lang="ts">
  import * as d3 from 'd3';

  type ConfigType = {
    parentElement: string;
    containerWidth: number;
    containerHeight: number;
    margin: { top: number; right: number; bottom: number; left: number };
    tooltipPadding: number;
  };

  type DataType = any;

  class TimelineCircles {
    config: ConfigType;

    data: DataType[];

    width: number;

    height: number;

    chart: any;

    svg: any;

    xScale: any;
    yScale: any;
    rScale: any;
    colorPalette: any;
    xAxis: any;
    yAxis: any;
    xAxisGroup: any;
    yAxisGroup: any;
    circles: any;

    constructor(_config: Partial<ConfigType>, _data: DataType[]) {
      this.config = {
        parentElement: _config.parentElement ?? 'body',
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 140,
        margin: { top: 40, right: 50, bottom: 10, left: 50 },
        tooltipPadding: _config.tooltipPadding || 15,
      };

      this.data = _data;

      this.width =
        this.config.containerWidth -
        this.config.margin.left -
        this.config.margin.right;
      this.height =
        this.config.containerHeight -
        this.config.margin.top -
        this.config.margin.bottom;

      this.initVis();
    }

    initVis() {
      // Width and height as the inner dimensions of the chart area- as before

      this.svg = d3
        .select(this.config.parentElement)
        .attr('width', this.config.containerWidth)
        .attr('height', this.config.containerHeight);

      this.chart = this.svg
        .append('g')
        .attr(
          'transform',
          `translate(${this.config.margin.left}, ${this.config.margin.top})`,
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
        .domain(d3.extent(this.data, (d) => d.cost) as [number, number])
        .range([5, 100]);

      // Construct a new ordinal scale with a range of ten categorical colours
      this.colorPalette = d3.scaleOrdinal(d3.schemeTableau10);
      this.colorPalette.domain(
        'tropical-cyclone',
        'drought-wildfire',
        'severe-storm',
        'flooding',
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
        .attr('fill', (d: DataType) => this.colorPalette(d.category))
        .attr('opacity', 0.8)
        .attr('stroke', 'gray')
        .attr('stroke-width', 2)
        .attr('r', (d: DataType) => this.rScale(d.cost))
        .attr('cy', (d: DataType) => this.yScale(d.year))
        .attr('cx', (d: DataType) => this.xScale(d.daysFromYrStart));

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

  export let data: DataType[];
  console.log(data);
  let timelineCircles = new TimelineCircles(
    {
      parentElement: '#timeline',
      containerHeight: 1100,
      containerWidth: 1000,
    },
    data,
  );
</script>

<svg id="timeline"></svg>
