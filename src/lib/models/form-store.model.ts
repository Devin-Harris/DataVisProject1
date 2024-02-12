import type { ChartType } from './chart-type.enum';
import type { GroupByAggregate } from './group-by-average.enum';
import type { GroupByType } from './group-by-type.enum';
import type { NationalHealthProcessedDataModel } from './nationalHealthData.model';

export interface FormStoreState {
  attribute1: keyof NationalHealthProcessedDataModel;
  attribute2: keyof NationalHealthProcessedDataModel;
  groupBy: GroupByType;
  groupByAggregate: GroupByAggregate;
  chartType: ChartType;
}
