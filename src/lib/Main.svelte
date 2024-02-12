<script lang="ts">
  import type { DSVRowArray } from 'd3';
  import { csv } from 'd3-fetch';
  import { onMount } from 'svelte';
  import ChartContainer from './components/charts/ChartContainer.svelte';
  import Form from './components/form/Form.svelte';
  import type {
    NationalHealthDataModel,
    NationalHealthProcessedDataModel,
  } from './models/nationalHealthData.model';

  let data: NationalHealthProcessedDataModel[] | null = null;

  onMount(async () => {
    data = await getData();
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
    </div>

    <div class="rhs">
      <ChartContainer {data} />
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
