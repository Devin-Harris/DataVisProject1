<script lang="ts">
  import { ChartType } from '../../models/chart-type.enum';
  import type { FormStoreState } from '../../models/form-store.model';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { formStore } from '../../stores/form-store';
  import BarChart from './BarChart.svelte';
  import ScatterChart from './ScatterChart.svelte';

  export let data: NationalHealthProcessedDataModel[] = [];

  let _chartTypes = ChartType;

  let formData: FormStoreState;
  formStore.subscribe((s) => {
    formData = s;
  });
</script>

{#if formData.chartType === _chartTypes.Scatter}
  <ScatterChart {data} />
{:else if formData.chartType === _chartTypes.Bar}
  <BarChart {data} />
{:else if formData.chartType === _chartTypes.Choropleth}
  <p>Choropleth</p>
{:else}
  <p>Unknown Chart type selected</p>
{/if}
