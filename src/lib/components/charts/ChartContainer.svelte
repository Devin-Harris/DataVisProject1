<script lang="ts">
  import { ChartType } from '../../models/chart-type.enum';
  import type { FormStoreState } from '../../models/form-store.model';
  import type { GeoData } from '../../models/geo-data.model';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { SortDirection } from '../../models/sort-direction.model';
  import { formStore } from '../../stores/form-store';
  import BarChart from './BarChart.svelte';
  import ChoroplethMaps from './ChoroplethMaps.svelte';
  import ScatterChart from './ScatterChart.svelte';

  export let data: NationalHealthProcessedDataModel[] = [];

  export let geoData: GeoData;

  $: data && formData.chartType === ChartType.Bar && sortBarData();

  let _chartTypes = ChartType;

  let storedBarSort: SortDirection | undefined = undefined;

  let sortedData: NationalHealthProcessedDataModel[] = [];

  let formData: FormStoreState;
  formStore.subscribe((s) => {
    formData = s;
    const sortDirection = formData.barSortDirection;
    if (storedBarSort !== sortDirection) {
      storedBarSort = sortDirection;
      sortBarData();
    }
  });

  function sortBarData() {
    if (storedBarSort === SortDirection.None) {
      sortedData = data;
    } else {
      sortedData = data.sort((a, b) => {
        if (storedBarSort === SortDirection.Alphabetically) {
          return a.display_name > b.display_name ? 1 : -1;
        } else if (storedBarSort === SortDirection.ReverseAlphabetically) {
          return a.display_name > b.display_name ? -1 : 1;
        } else if (storedBarSort === SortDirection.Attribute1Ascending) {
          if (
            a[formData.attribute1] === null ||
            a[formData.attribute1] === undefined
          )
            return -1;
          if (
            b[formData.attribute1] === null ||
            b[formData.attribute1] === undefined
          )
            return -1;
          return a[formData.attribute1]! > b[formData.attribute1]! ? 1 : -1;
        } else if (storedBarSort === SortDirection.Attribute1Descending) {
          if (
            a[formData.attribute1] === null ||
            a[formData.attribute1] === undefined
          )
            return -1;
          if (
            b[formData.attribute1] === null ||
            b[formData.attribute1] === undefined
          )
            return -1;
          return a[formData.attribute1]! < b[formData.attribute1]! ? 1 : -1;
        } else if (storedBarSort === SortDirection.Attribute2Ascending) {
          if (
            a[formData.attribute1] === null ||
            a[formData.attribute1] === undefined
          )
            return -1;
          if (
            b[formData.attribute1] === null ||
            b[formData.attribute1] === undefined
          )
            return -1;
          return a[formData.attribute2]! > b[formData.attribute2]! ? 1 : -1;
        } else if (storedBarSort === SortDirection.Attribute2Descending) {
          if (
            a[formData.attribute1] === null ||
            a[formData.attribute1] === undefined
          )
            return -1;
          if (
            b[formData.attribute1] === null ||
            b[formData.attribute1] === undefined
          )
            return -1;
          return a[formData.attribute2]! < b[formData.attribute2]! ? 1 : -1;
        }
        return 1;
      });
    }
  }
</script>

{#if formData.chartType === _chartTypes.Scatter}
  <ScatterChart {data} />
{:else if formData.chartType === _chartTypes.Bar}
  <BarChart
    data={sortedData}
    configOverrides={{ minBarWidth: formData.barWidth }}
  />
{:else if formData.chartType === _chartTypes.Choropleth}
  <ChoroplethMaps data={geoData} />
{:else}
  <p>Unknown Chart type selected</p>
{/if}
