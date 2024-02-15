<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { attributesMap } from '../../models/attributes.model';
  import {
    defaultChartConfig,
    type ChartConfig,
  } from '../../models/chart-config.model';
  import type { FormStoreState } from '../../models/form-store.model';
  import { GroupByType } from '../../models/group-by-type.enum';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { formStore } from '../../stores/form-store';
  import { legendStore } from '../../stores/legend-store';
  import { getGroupByValue } from '../utils/group-data';

  // Props
  export const configOverrides: Partial<ChartConfig> = {};

  export let data: NationalHealthProcessedDataModel[] = [];

  // Computed
  $: config = { ..._config, ...configOverrides };
  $: config && initVis();
  $: chartContainer && initVis();
  $: data && initVis();

  // Private
  let height: number;
  let width: number;
  let _config: ChartConfig = defaultChartConfig;
  let chartContainer: HTMLElement;
  let chart: any;
  let svg: any;
  let xScale: any;
  let yScale: any;
  let colorPalette: any;
  let xAxis: any;
  let yAxis: any;
  let xAxisGroup: any;
  let yAxisGroup: any;
  let formData: FormStoreState;

  // Lifecycle methods
  onMount(() => {
    initVis();
    window.addEventListener('resize', initVis);
  });

  formStore.subscribe((s) => {
    formData = s;
    initVis();
  });

  // Methods
  function setWidthAndHeight() {
    width =
      (chartContainer?.getBoundingClientRect().width ?? 0) -
      config.margin.left -
      config.margin.right;
    height =
      (chartContainer?.getBoundingClientRect().height ?? 0) -
      config.margin.top -
      config.margin.bottom;
  }

  function removeChildrenFromContainer() {
    if (
      chartContainer &&
      chartContainer.children &&
      chartContainer.children.length > 0 &&
      chartContainer.children[0].children
    ) {
      (
        Array.from(chartContainer.children[0].children) as HTMLElement[]
      ).forEach((element) => {
        element.remove();
      });
    }
  }

  function drawSvgContainers() {
    if (
      chartContainer &&
      chartContainer.children &&
      chartContainer.children.length > 0
    ) {
      svg = d3
        .select(chartContainer.children[0])
        .attr('width', '100%')
        .attr('height', '100%');

      chart = svg
        .append('g')
        .attr(
          'transform',
          `translate(${config.margin.left}, ${config.margin.top / 2})`,
        );
    }
  }

  function buildScales() {
    // Initialize linear and ordinal scales (input domain and output range)
    const att1Values = data.map((d) => d[formData.attribute1] as number);
    const att2Values = data.map((d) => d[formData.attribute2] as number);

    xScale = d3
      .scaleLinear()
      .domain([Math.min(...att1Values), Math.max(...att1Values)])
      .range([0, width])
      .nice();

    yScale = d3
      .scaleLinear()
      .domain([Math.max(...att2Values), Math.min(...att2Values)])
      .range([0, height])
      .nice();
  }

  function drawAxises() {
    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);

    xAxisGroup = chart
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);
    xAxisGroup
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', width / 2)
      .attr('y', 25)
      .style('text-anchor', 'middle')
      .attr('fill', '#5D6971')
      .text(attributesMap[formData.attribute1]);

    yAxisGroup = chart.append('g').attr('class', 'axis y-axis').call(yAxis);
    yAxisGroup
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -25)
      .attr('x', -1 * (height / 2))
      .style('text-anchor', 'middle')
      .attr('fill', '#5D6971')
      .text(attributesMap[formData.attribute2]);
  }

  function buildColorPalette() {
    // Construct a new ordinal scale with a range of ten categorical colours
    colorPalette = d3.scaleOrdinal(d3.schemeTableau10);
    colorPalette.domain(
      data
        .map((d) =>
          getGroupByValue(
            // Color by state if showing data for each county to prevent duplicate coloring from so many counties
            formData.groupBy === GroupByType.County
              ? GroupByType.State
              : formData.groupBy,
            d,
          ),
        )
        .sort(),
    );
    legendStore.set({ colorPalette });
  }

  function initVis() {
    if (
      !(
        chartContainer &&
        chartContainer.children &&
        chartContainer.children.length > 0
      )
    ) {
      return;
    }

    setWidthAndHeight();
    removeChildrenFromContainer();
    drawSvgContainers();
    buildScales();
    buildColorPalette();
    drawData();
    drawAxises();
  }

  function drawData() {
    if (!chart) {
      return;
    }

    const dataGroup = chart.append('g').attr('class', 'data-group');
    const circles = dataGroup
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('class', 'data-circle')
      .attr('cx', (d: NationalHealthProcessedDataModel) =>
        formData.attribute1 ? xScale(d[formData.attribute1]) : width + 100,
      )
      .attr('cy', (d: NationalHealthProcessedDataModel) =>
        formData.attribute2 ? yScale(d[formData.attribute2]) : height + 100,
      )
      .attr(
        'r',
        formData.groupBy === GroupByType.State
          ? 20
          : formData.groupBy === GroupByType.UrbanRuralStatus
            ? 40
            : 5,
      )
      .attr('fill', (d: NationalHealthProcessedDataModel) =>
        colorPalette(
          getGroupByValue(
            // Color by state if showing data for each county to prevent duplicate coloring from so many counties
            formData.groupBy === GroupByType.County
              ? GroupByType.State
              : formData.groupBy,
            d,
          ),
        ),
      )
      .attr('opacity', 0.8)
      .attr('stroke', 'gray')
      .attr('stroke-width', 1);

    circles
      .on(
        'mouseover',
        (event: MouseEvent, d: NationalHealthProcessedDataModel) =>
          mouseOverTooltipCB(event, d),
      )
      .on('mouseleave', mouseLeaveTooltipCB);

    const tooltip = d3.select('.scatter-chart-container .tooltip');
    tooltip.on('mouseover', () => {
      tooltip.style('opacity', 1).style('pointer-events', 'all');
    });
    tooltip.on('mouseleave', () => {
      tooltip.style('opacity', 0).style('pointer-events', 'none');
    });
  }

  function mouseOverTooltipCB(
    event: MouseEvent,
    d: NationalHealthProcessedDataModel,
  ) {
    const tooltip = d3.select('.scatter-chart-container .tooltip');
    const tooltipElm = tooltip.node() as HTMLElement;
    const tooltipBounds = tooltipElm.getBoundingClientRect();
    const chartBounds = chartContainer.getBoundingClientRect();
    tooltip
      .style('pointer-events', 'all')
      .style('opacity', '1')
      .style(
        'left',
        Math.min(
          event.pageX,
          chartBounds.x + chartBounds.width - tooltipBounds.width,
        ) + 'px',
      )
      .style(
        'top',
        Math.min(
          event.pageY,
          chartBounds.y + chartBounds.height - tooltipBounds.height,
        ) + 'px',
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
  function mouseLeaveTooltipCB(event: MouseEvent) {
    d3.select('.scatter-chart-container .tooltip')
      .style('opacity', '0')
      .style('pointer-events', 'none');
  }
</script>

<div class="scatter-chart-container" bind:this={chartContainer}>
  <svg></svg>

  <div class="tooltip"></div>
</div>

<style lang="scss">
  .scatter-chart-container {
    height: 100%;
    width: 100%;
    position: relative;

    .tooltip {
      position: fixed;
      opacity: 0;
      transition: 1s;
      background: #fff;
      box-shadow: 3px 3px 3px 0px rgb(92 92 92 / 0.5);
      border: 1px solid #ddd;
      padding: 8px;
      min-width: 160px;
      color: #333;
      border-radius: 0.5em;
      font-size: large;
    }
  }
</style>
