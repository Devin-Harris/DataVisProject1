<script lang="ts">
  import type { DSVRowArray } from 'd3';
  import { csv } from 'd3-fetch';
  import { onMount } from 'svelte';
  import ChartContainer from './components/charts/ChartContainer.svelte';
  import Form from './components/form/Form.svelte';
  import { groupData } from './components/utils/group-data';
  import type { FormStoreState } from './models/form-store.model';
  import type { LegendStoreState } from './models/legend-store.model';
  import type {
    NationalHealthDataModel,
    NationalHealthProcessedDataModel,
  } from './models/nationalHealthData.model';
  import { formStore } from './stores/form-store';
  import { legendStore } from './stores/legend-store';

  let data: NationalHealthProcessedDataModel[] | null = null;

  $: groupedData = groupData(formData, data ?? []);

  onMount(async () => {
    data = await getData();
  });

  let formData: FormStoreState;
  formStore.subscribe((s) => {
    formData = { ...s };
  });

  let legendData: LegendStoreState;
  legendStore.subscribe((s) => {
    legendData = { ...s };
  });

  async function getData() {
    const data = await csv<keyof NationalHealthDataModel>(
      './data/national_health_data.csv',
    );
    return processData(data);
  }

  function processData(
    data: DSVRowArray<keyof NationalHealthDataModel>,
  ): NationalHealthProcessedDataModel[] {
    return data.map((d) => {
      const regex = /\(([^)]+)\)/;
      const match = d.display_name.match(regex);

      let state: string | null = null;
      if (match) {
        state = match[1];
      }

      return {
        // Number casting
        air_quality: +d.air_quality,
        education_less_than_high_school_percent:
          +d.education_less_than_high_school_percent,
        elderly_percentage: +d.elderly_percentage,
        median_household_income: +d.median_household_income,
        number_of_hospitals: +d.number_of_hospitals,
        number_of_primary_care_physicians: +d.number_of_primary_care_physicians,
        park_access: +d.park_access,
        percent_coronary_heart_disease: +d.percent_coronary_heart_disease,
        percent_high_blood_pressure: +d.percent_high_blood_pressure,
        percent_high_cholesterol: +d.percent_high_cholesterol,
        percent_inactive: +d.percent_inactive,
        percent_no_heath_insurance: +d.percent_no_heath_insurance,
        percent_smoking: +d.percent_smoking,
        percent_stroke: +d.percent_stroke,
        poverty_perc: +d.poverty_perc,

        // One to one mapped
        cnty_fips: d.cnty_fips,
        display_name: d.display_name,
        urban_rural_status: d.urban_rural_status,

        // Computed fields
        state,
      };
    });
  }
</script>

<div class="main-container">
  {#if data}
    <div class="lhs">
      <Form />

      <fieldset class="legend">
        <legend>Legend </legend>
        <div class="legend-colors">
          {#each legendData.colorPalette.domain() as domain}
            <p>
              <span style="background: {legendData.colorPalette(domain)}"
              ></span>
              {domain}
            </p>
          {/each}
        </div>
      </fieldset>
    </div>

    <div class="rhs">
      <ChartContainer data={groupedData} />
    </div>
  {/if}
</div>

<style lang="scss">
  .main-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100vh;
    overflow: hidden;

    .lhs {
      padding: 1em;
      width: 25em;
      max-width: 25em;
      height: 100%;
      overflow: auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;

      :global(.form-container) {
        width: 100%;
      }

      .legend {
        padding: 1em;
        height: 100%;
        width: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .legend-colors {
          width: 100%;
          overflow: auto;
          display: flex;
          flex-wrap: wrap;
          // grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          p {
            margin-bottom: 0.5em;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-right: 0.5em;
            min-width: 50px;
            span {
              height: 1em;
              width: 1em;
              margin-right: 0.25em;
              display: block;
            }
          }
        }
      }
    }
    .rhs {
      padding: 1em;
      flex-grow: 1;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
