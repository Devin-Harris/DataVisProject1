<script lang="ts">
  import type { ChartConfig } from '../../models/chart-config.model';
  import { ChartType } from '../../models/chart-type.enum';
  import type { FormStoreState } from '../../models/form-store.model';
  import type { GeoData } from '../../models/geo-data.model';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { formStore } from '../../stores/form-store';
  import BarChart from './BarChart.svelte';
  import ChoroplethMaps from './ChoroplethMaps.svelte';
  import ScatterChart from './ScatterChart.svelte';

  export let data: NationalHealthProcessedDataModel[] = [];

  export let geoData: GeoData;

  let configOverrides: Partial<ChartConfig> = {
    minBarWidth: 150,
  };

  let _chartTypes = ChartType;

  let formData: FormStoreState;
  formStore.subscribe((s) => {
    formData = s;
  });
</script>

{#if formData.chartType === _chartTypes.Scatter}
  <ScatterChart {data} />
{:else if formData.chartType === _chartTypes.Bar}
  <BarChart {data} {configOverrides} />
{:else if formData.chartType === _chartTypes.Choropleth}
  <ChoroplethMaps data={geoData} />
{:else}
  <p>Unknown Chart type selected</p>
{/if}
