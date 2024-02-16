<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import * as topojson from 'topojson';
  import { attributesMap } from '../../models/attributes.model';
  import {
    defaultChartConfig,
    type ChartConfig,
  } from '../../models/chart-config.model';
  import type { ChoroplethStoreState } from '../../models/choropleth-store.model';
  import type { FormStoreState } from '../../models/form-store.model';
  import type { GeoData } from '../../models/geo-data.model';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { choroplethStore } from '../../stores/choropleth-store';
  import { formStore } from '../../stores/form-store';
  import { legendStore } from '../../stores/legend-store';

  // Props
  export const configOverrides: Partial<ChartConfig> = {};

  export let data: GeoData;

  export let attribute: keyof Pick<FormStoreState, 'attribute1' | 'attribute2'>;

  // Computed
  $: config = { ..._config, ...configOverrides };
  $: config && initVis();
  $: chartContainer && initVis();
  $: data && initVis();
  $: attribute && initVis();

  // Private
  let height: number;
  let width: number;
  let _config: ChartConfig = defaultChartConfig;
  let chartContainer: HTMLElement;
  let chart: any;
  let svg: any;
  let colorPalette: any;
  let path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  let formData: FormStoreState;
  let choroplethData: ChoroplethStoreState;

  // Lifecycle methods
  onMount(async () => {
    initVis();
    window.addEventListener('resize', initVis);
  });

  formStore.subscribe((s) => {
    formData = s;
    initVis();
  });

  choroplethStore.subscribe((s) => {
    choroplethData = s;
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

      let projection = d3
        .geoAlbersUsa()
        // .fitSize([width, height], data.objects.geometries)
        .translate([width / 2, height / 2])
        .scale(width);

      path = d3.geoPath().projection(projection);
    }
  }

  function buildColorPalette() {
    colorPalette = d3
      .scaleLinear()
      .domain(
        // @ts-ignore
        d3.extent(data.objects.counties.geometries, (d: any) =>
          d.properties.data &&
          d.properties.data[formData[attribute]] !== undefined
            ? Math.max(d.properties.data[formData[attribute]] as number, 0)
            : 0,
        ),
      )
      .range(
        // @ts-ignore
        attribute === 'attribute1'
          ? ['#e2f2cf', '#306b0d']
          : ['#cfe2f2', '#0d306b'],
      )
      // @ts-ignore
      .interpolate(d3.interpolateHcl);

    if (attribute === 'attribute2') {
      legendStore.update((c) => ({ ...c, colorPalette2: colorPalette }));
    } else {
      legendStore.update((c) => ({ ...c, colorPalette }));
    }
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
    buildColorPalette();
    drawData();
  }

  function drawData() {
    if (!chart) {
      return;
    }

    const dataGroup = chart
      .append('g')
      .attr('class', 'data-group')
      .attr('id', 'counties');

    const counties = dataGroup
      .selectAll('path')
      .data((topojson.feature(data, data.objects.counties) as any).features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', (d) => {
        return `county-boundary county-${d.properties.data?.cnty_fips} ${
          choroplethData.selectedData &&
          choroplethData.selectedData.some(
            (sd) => sd.properties.cnty_fips === d.properties.data?.cnty_fips,
          )
            ? 'selected'
            : ''
        }`;
      })
      .attr('fill', (d) => {
        if (
          d.properties.data &&
          d.properties.data[formData[attribute]] !== undefined &&
          d.properties.data[formData[attribute]] >= 0
        ) {
          return colorPalette(d.properties.data[formData[attribute]]);
        } else {
          return 'url(#lightstripe)';
        }
      });

    const stateBorders = chart
      .append('path')
      .datum(
        topojson.mesh(data, data.objects.states, function (a, b) {
          return a !== b;
        }),
      )
      .attr('id', 'state-borders')
      .attr('d', path);

    counties
      .on('mouseover', (event: MouseEvent, d) =>
        mouseOverTooltipCB(event, d.properties.data),
      )
      .on('mouseleave', mouseLeaveTooltipCB)
      .on('click', (e: MouseEvent, d) =>
        choroplethStore.update((s) => ({
          selectedData: s.selectedData.some(
            (sd) =>
              sd.properties.data.cnty_fips === d.properties.data.cnty_fips,
          )
            ? s.selectedData.filter(
                (sd) =>
                  sd.properties.data.cnty_fips !== d.properties.data.cnty_fips,
              )
            : [...s.selectedData, d],
        })),
      );

    const tooltip = d3.select('.choropleth-chart-container .tooltip');
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
    const tooltip = d3.select('.choropleth-chart-container .tooltip');
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
            <strong>${attributesMap[formData[attribute]]}</strong> 
            </p>
          <p>${d[formData[attribute]]}</p>
        `);
  }

  function mouseLeaveTooltipCB(event: MouseEvent) {
    d3.select('.choropleth-chart-container .tooltip')
      .style('opacity', '0')
      .style('pointer-events', 'none');
  }
</script>

<div class="choropleth-chart-container" bind:this={chartContainer}>
  <svg></svg>

  <div class="tooltip"></div>

  <svg height="5" width="5" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <defs>
      <pattern
        id="lightstripe"
        patternUnits="userSpaceOnUse"
        width="5"
        height="5"
      >
        <image
          xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1JyBoZWlnaHQ9JzUnPgogIDxyZWN0IHdpZHRoPSc1JyBoZWlnaHQ9JzUnIGZpbGw9J3doaXRlJy8+CiAgPHBhdGggZD0nTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVonIHN0cm9rZT0nIzg4OCcgc3Ryb2tlLXdpZHRoPScxJy8+Cjwvc3ZnPg=="
          x="0"
          y="0"
          width="5"
          height="5"
        >
        </image>
      </pattern>
    </defs>
  </svg>
</div>

<style lang="scss">
  .choropleth-chart-container {
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

    :global(.county-boundary) {
      stroke: #fff;
      stroke-width: 0.125px;
    }
    :global(.county-boundary.selected) {
      stroke: orange;
      stroke-width: 2px;
    }

    :global(.county-boundary:hover),
    :global(.state:hover) {
      fill: orange;
    }
  }
  :global(#state-borders) {
    fill: none;
    stroke: #fff;
    stroke-width: 0.5px;
    stroke-linejoin: round;
    stroke-linecap: round;
    pointer-events: none;
  }
</style>
