<script lang="ts">
  import { ChartType } from '../../models/chart-type.enum';
  import type { FormStoreState } from '../../models/form-store.model';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { formStore } from '../../stores/form-store';
  import { groupData } from '../utils/group-data';
  import BarChart from './BarChart.svelte';

  export let data: NationalHealthProcessedDataModel[] = [];

  $: groupedData = groupData(formData, data);

  let formData: FormStoreState;

  let _chartTypes = ChartType;

  formStore.subscribe((s) => {
    formData = { ...s };
  });
</script>

{#if formData.chartType === _chartTypes.Scatter}
  <p>scatter</p>
{:else if formData.chartType === _chartTypes.Bar}
  <BarChart data={groupedData} />
{:else if formData.chartType === _chartTypes.Choropleth}
  <p>Choropleth</p>
{:else}
  <p>Unknown Chart type selected</p>
{/if}
