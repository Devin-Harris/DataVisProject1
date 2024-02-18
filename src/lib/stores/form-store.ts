import { writable } from 'svelte/store';
import { ChartType } from '../models/chart-type.enum';
import type { FormStoreState } from '../models/form-store.model';
import { GroupByAggregate } from '../models/group-by-average.enum';
import { GroupByType } from '../models/group-by-type.enum';
import { SortDirection } from '../models/sort-direction.model';

export const initialFormStore: FormStoreState = {
  attribute1: 'education_less_than_high_school_percent' ?? null,
  attribute2: 'poverty_perc' ?? null,
  groupBy: GroupByType.County,
  groupByAggregate: GroupByAggregate.Avg,
  chartType: ChartType.Scatter,
  barWidth: 150,
  barSortDirection: SortDirection.None,
};

export const formStore = writable<FormStoreState>(initialFormStore);
