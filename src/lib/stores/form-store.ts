import { writable } from 'svelte/store';
import { ChartType } from '../models/chart-type.enum';
import type { FormStoreState } from '../models/form-store.model';
import { GroupByAggregate } from '../models/group-by-average.enum';
import { GroupByType } from '../models/group-by-type.enum';

export const formStore = writable<FormStoreState>({
  attribute1: 'percent_high_blood_pressure' ?? null,
  attribute2: 'number_of_hospitals' ?? null,
  groupBy: GroupByType.County,
  groupByAggregate: GroupByAggregate.Avg,
  chartType: ChartType.Bar,
});
