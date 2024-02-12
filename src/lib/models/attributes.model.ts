import type { NationalHealthProcessedDataModel } from './nationalHealthData.model';

export const attributesMap: {
  [x in keyof NationalHealthProcessedDataModel]: string;
} = {
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
