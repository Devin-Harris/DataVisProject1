document.addEventListener('DOMContentLoaded', () => {
  main();
});

async function main() {
  data = await getData();
  geoData = await getGeoData();

  legendBuilder = new LegendBuilder();
  formBuilder = new FormBuilder();
  groupedData = groupData(formData, data);
}

async function getData() {
  const data = await d3.csv('./data/national_health_data.csv');
  return processData(data);
}

async function getGeoData() {
  const geoData = await d3.json('./data/counties-10m.json');

  geoData.objects.counties.geometries.forEach((d) => {
    const match = data?.find((d1) => d1.cnty_fips === d.id);
    d.properties.data = match;
  });

  return geoData;
}

function processData(data) {
  return data.map((d) => {
    const regex = /\(([^)]+)\)/;
    const match = d.display_name.match(regex);

    let state = null;
    if (match) {
      state = match[1];
    }

    const nameWithoutQuotes = d.display_name.split('"')[1];
    const nameWithoutQuotesOrState = nameWithoutQuotes.split(', (')[0];
    let county_name = nameWithoutQuotesOrState;

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
