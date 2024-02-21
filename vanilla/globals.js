let data = null;

let groupedData = null;

let geoData = null;

let formBuilder = null;

let legendBuilder = null;

let scatter = null;

let bar = null;

let choro1 = null;

let choro2 = null;

const sortDirection = {
  None: 'None',
  Attribute1Ascending: 'Attribute 1 Ascending',
  Attribute1Descending: 'Attribute 1 Descending',
  Attribute2Ascending: 'Attribute 2 Ascending',
  Attribute2Descending: 'Attribute 2 Descending',
  Alphabetically: 'Alphabetically',
  ReverseAlphabetically: 'Reverse Alphabetically',
};

const groupByType = {
  County: 'County',
  State: 'State',
  UrbanRuralStatus: 'Urban Rural Status',
};

const groupByAggregate = {
  Avg: 'Average',
  Min: 'Minimum',
  Max: 'Maximum',
  Sum: 'Sum',
  Count: 'Count',
};

const attributesMap = {
  air_quality: 'Air Quality',
  cnty_fips: 'County Code',
  display_name: 'Display Name',
  education_less_than_high_school_percent: 'Education < Highschool %',
  elderly_percentage: 'Elderly %',
  median_household_income: 'Median Household Income',
  number_of_hospitals: '# of Hospitals',
  number_of_primary_care_physicians: '# of Primary Care Physicians',
  park_access: 'Park Access',
  percent_coronary_heart_disease: '% Coronary Heart Disease',
  percent_high_blood_pressure: '% High Blood Pressure',
  percent_high_cholesterol: '% High Cholesterol',
  percent_inactive: '% Inactive',
  percent_no_heath_insurance: '% No Heath Insurance',
  percent_smoking: '% Smoking',
  percent_stroke: '% Stroke',
  poverty_perc: '% Poverty',
  urban_rural_status: 'Urban Rural Status',
  state: 'State',
};

const chartType = {
  Scatter: 'Scatterplot Chart',
  Bar: 'Bar Chart',
  Choropleth: 'Choropleth Maps',
};

const formData = {
  attribute1: 'education_less_than_high_school_percent' ?? null,
  attribute2: 'poverty_perc' ?? null,
  groupBy: 'County',
  groupByAggregate: 'Avg',
  chartType: 'Scatter',
  barWidth: 150,
  barSortDirection: 'None',
  mapSelectedAttribute: 'attribute1',
};

const stateAbbreviationsMap = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  AS: 'American Samoa',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  GU: 'Guam',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  MP: 'Northern Mariana Islands',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  TT: 'Trust Territories',
  UT: 'Utah',
  VT: 'Vermont',
  VI: 'Virgin Islands',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

const chartLegends = {
  [chartType.Scatter]: null,
  [chartType.Bar]: null,
  [chartType.Choropleth]: {
    attribute1: null,
    attribute2: null,
  },
};

const selectedLegendGroups = new Set();

const selectedPoints = new Set();
const storedSelection = {
  [chartType.Scatter]: null,
  [chartType.Bar]: null,
  [chartType.Choropleth]: {
    attribute1: null,
    attribute2: null,
  },
};
