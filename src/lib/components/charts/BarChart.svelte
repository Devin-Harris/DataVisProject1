<script lang="ts">
  import * as d3 from 'd3';
  import { onMount, tick } from 'svelte';
  import { attributesMap } from '../../models/attributes.model';
  import {
    defaultChartConfig,
    type ChartConfig,
  } from '../../models/chart-config.model';
  import type { FormStoreState } from '../../models/form-store.model';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { formStore } from '../../stores/form-store';
  import { legendStore } from '../../stores/legend-store';
  import { getGroupByValue } from '../utils/group-data';

  // Props
  export let configOverrides: Partial<ChartConfig> = {};

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
    width = Math.max(
      (chartContainer?.getBoundingClientRect().width ?? 0) -
        config.margin.left -
        config.margin.right,
      (config.minBarWidth ?? 0) * data.length,
    );

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
    const minAtt = Math.min(...att1Values, ...att2Values);
    const maxAtt = Math.max(...att1Values, ...att2Values);

    xScale = d3
      .scaleBand()
      .domain(
        data.map((d: NationalHealthProcessedDataModel) =>
          getGroupByValue(formData.groupBy, d),
        ),
      )
      .range([0, width])
      .padding(0.1);

    yScale = d3.scaleLinear().domain([maxAtt, minAtt]).range([0, height]);
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
      .text(formData.groupBy);

    yAxisGroup = chart.append('g').attr('class', 'axis y-axis').call(yAxis);
    yAxisGroup
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -25)
      .attr('x', -1 * (height / 2))
      .style('text-anchor', 'middle')
      .attr('fill', '#5D6971')
      .text(
        `${attributesMap[formData.attribute1]} & ${
          attributesMap[formData.attribute2]
        }`,
      );
  }

  function buildColorPalette() {
    colorPalette = d3.scaleOrdinal(d3.schemeTableau10);
    colorPalette.domain([
      attributesMap[formData.attribute1],
      attributesMap[formData.attribute2],
    ]);
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
    drawAxises();
    drawData();

    tick().then(() => {
      if (svg && chartContainer && chartContainer.children[0]) {
        const bbox = (chartContainer.children[0] as any).getBBox();
        svg.attr('width', Math.ceil(bbox.width));
      }
    });
  }

  function drawData() {
    if (!chart) {
      return;
    }

    const dataGroup = chart.append('g').attr('class', 'data-group');
    const rectangleGroups = dataGroup
      .selectAll('g')
      .data(data)
      .join('g')
      .attr('class', 'rectangle-group')
      .attr('x', (d: NationalHealthProcessedDataModel) =>
        xScale(getGroupByValue(formData.groupBy, d)),
      )
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', height);

    const buildRects = (
      attribute: keyof Pick<FormStoreState, 'attribute1' | 'attribute2'>,
    ) => {
      return rectangleGroups
        .append('rect')
        .attr('fill', (d: NationalHealthProcessedDataModel) =>
          colorPalette(attributesMap[formData[attribute]]),
        )
        .attr(
          'x',
          (d: NationalHealthProcessedDataModel) =>
            xScale(getGroupByValue(formData.groupBy, d)) +
            (attribute === 'attribute2' ? xScale.bandwidth() / 2 + 1 : 0),
        )
        .attr('y', (d: NationalHealthProcessedDataModel) =>
          formData[attribute] ? yScale(d[formData[attribute]]) : height + 100,
        )
        .attr('width', Math.max(xScale.bandwidth() / 2 - 1, 0))
        .attr('height', (d: NationalHealthProcessedDataModel) => {
          return height - Math.max(yScale(d[formData[attribute]]) ?? 0, 0);
        });
    };
    let att1Rects = buildRects('attribute1');
    let att2Rects = buildRects('attribute2');

    att1Rects
      .on(
        'mouseover',
        (event: MouseEvent, d: NationalHealthProcessedDataModel) =>
          mouseOverTooltipCB(event, d, 'attribute1'),
      )
      .on('mouseleave', mouseLeaveTooltipCB);
    att2Rects
      .on(
        'mouseover',
        (event: MouseEvent, d: NationalHealthProcessedDataModel) =>
          mouseOverTooltipCB(event, d, 'attribute2'),
      )
      .on('mouseleave', mouseLeaveTooltipCB);

    const tooltip = d3.select('.bar-chart-container .tooltip');
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
    attribute: keyof Pick<FormStoreState, 'attribute1' | 'attribute2'>,
  ) {
    const tooltip = d3.select('.bar-chart-container .tooltip');
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
          ${
            attribute === 'attribute1'
              ? `<p>
                <strong>${attributesMap[formData.attribute1]}</strong>
                <i>(${formData.groupByAggregate})</i> 
                </p>
              <p>${d[formData.attribute1]}</p>`
              : `
             <p>
              <strong>${attributesMap[formData.attribute2]}</strong>
              <i>(${formData.groupByAggregate})</i> 
              </p>
            <p>${d[formData.attribute2]}</p>`
          }
        `);
  }

  function mouseLeaveTooltipCB(event: MouseEvent) {
    d3.select('.bar-chart-container .tooltip')
      .style('opacity', '0')
      .style('pointer-events', 'none');
  }
</script>

<div class="bar-chart-container" bind:this={chartContainer}>
  <svg></svg>

  <div class="tooltip"></div>
</div>

<style lang="scss">
  .bar-chart-container {
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
