<script lang="ts">
  import type { DSVRowArray } from 'd3';
  import { csv, json } from 'd3-fetch';
  import { onMount } from 'svelte';
  import ChartContainer from './components/charts/ChartContainer.svelte';
  import Form from './components/form/Form.svelte';
  import Legend from './components/form/Legend.svelte';
  import { groupData } from './components/utils/group-data';
  import type { FormStoreState } from './models/form-store.model';
  import type { GeoData } from './models/geo-data.model';
  import type {
    NationalHealthDataModel,
    NationalHealthProcessedDataModel,
  } from './models/nationalHealthData.model';
  import { formStore } from './stores/form-store';

  let data: NationalHealthProcessedDataModel[] | null = null;

  let geoData: GeoData | null = null;

  $: groupedData = groupData(formData, data ?? []);

  onMount(async () => {
    data = await getData();
    geoData = await getGeoData();
  });

  let formData: FormStoreState;
  formStore.subscribe((s) => {
    formData = { ...s };
  });

  async function getData() {
    const data = await csv<keyof NationalHealthDataModel>(
      './data/national_health_data.csv',
    );
    return processData(data);
  }

  async function getGeoData() {
    const geoData: any = await json('./data/counties-10m.json');

    geoData.objects.counties.geometries.forEach((d) => {
      const match = data?.find((d1) => d1.cnty_fips === d.id);
      d.properties.data = match;
    });

    return geoData;
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

      const nameWithoutQuotes = d.display_name.split('"')[1];
      const nameWithoutQuotesOrState = nameWithoutQuotes.split(', (')[0];
      let county_name: string = nameWithoutQuotesOrState;

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
        county_name,
      };
    });
  }
</script>

<div class="title">
  <div class="lhs">
    <h1>Project 1 - Health in the USA</h1>
    <h4>By Devin Harris</h4>
  </div>
  <div class="rhs">
    <small
      >Data from <a href="https://www.cdc.gov/dhdsp/maps/atlas/index.htm"
        >https://www.cdc.gov/dhdsp/maps/atlas/index.htm</a
      ></small
    >
  </div>
</div>

<div class="main-container">
  {#if groupedData && geoData}
    <div class="lhs">
      <Form />
      <Legend></Legend>
    </div>

    <div class="rhs">
      <ChartContainer data={groupedData} {geoData} />
    </div>
  {/if}
</div>

<style lang="scss">
  .title {
    padding: 0.5em;
    border-bottom: 1px solid #eee;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: flex-start;
    h4 {
      font-weight: 400;
    }
  }
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
