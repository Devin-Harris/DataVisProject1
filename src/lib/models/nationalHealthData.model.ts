export interface NationalHealthProcessedDataModel {
  air_quality: number;
  cnty_fips: string;
  display_name: string;
  education_less_than_high_school_percent: number;
  elderly_percentage: number;
  median_household_income: number;
  number_of_hospitals: number;
  number_of_primary_care_physicians: number;
  park_access: number;
  percent_coronary_heart_disease: number;
  percent_high_blood_pressure: number;
  percent_high_cholesterol: number;
  percent_inactive: number;
  percent_no_heath_insurance: number;
  percent_smoking: number;
  percent_stroke: number;
  poverty_perc: number;
  urban_rural_status: string;
  state: string | null;
  county_name: string;
}

export interface NationalHealthDataModel {
  air_quality: string;
  cnty_fips: string;
  display_name: string;
  education_less_than_high_school_percent: string;
  elderly_percentage: string;
  median_household_income: string;
  number_of_hospitals: string;
  number_of_primary_care_physicians: string;
  park_access: string;
  percent_coronary_heart_disease: string;
  percent_high_blood_pressure: string;
  percent_high_cholesterol: string;
  percent_inactive: string;
  percent_no_heath_insurance: string;
  percent_smoking: string;
  percent_stroke: string;
  poverty_perc: string;
  urban_rural_status: string;
}
