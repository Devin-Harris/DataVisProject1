import type { FormStoreState } from '../../models/form-store.model';
import { GroupByAggregate } from '../../models/group-by-average.enum';
import { GroupByType } from '../../models/group-by-type.enum';
import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
import { stateAbbreviationsMap } from '../../models/state-abbreviations.model';

export function getGroupByValue(
  groupBy: GroupByType,
  d: NationalHealthProcessedDataModel
) {
  return groupBy === GroupByType.State
    ? d.state ?? ''
    : groupBy === GroupByType.UrbanRuralStatus
    ? d.urban_rural_status
    : d.cnty_fips;
}

function buildAggregateValue(
  formData: FormStoreState,
  values: Partial<NationalHealthProcessedDataModel>[],
  attribute: keyof Pick<FormStoreState, 'attribute1' | 'attribute2'>
) {
  let value = 0;
  if (formData.groupByAggregate === GroupByAggregate.Avg) {
    let sum = values.reduce((acc, curr) => {
      let v = curr[formData[attribute]] as number;
      if (v >= 0) {
        acc += v;
      }
      return acc;
    }, 0);
    let count = values.length;
    value = count > 0 ? sum / count : 0;
  } else if (formData.groupByAggregate === GroupByAggregate.Max) {
    value = Math.max(...values.map((g) => g[formData[attribute]!] as number));
  } else if (formData.groupByAggregate === GroupByAggregate.Min) {
    value = Math.min(...values.map((g) => g[formData[attribute]!] as number));
  } else if (formData.groupByAggregate === GroupByAggregate.Sum) {
    value = values.reduce((acc, curr) => {
      let v = curr[formData[attribute]] as number;
      if (v >= 0) {
        acc += v;
      }
      return acc;
    }, 0);
  } else if (formData.groupByAggregate === GroupByAggregate.Count) {
    value = values.length;
  }
  return value;
}

export function groupData(
  formData: FormStoreState,
  data: NationalHealthProcessedDataModel[]
) {
  let groupAggregates: {
    [key: string]: Partial<NationalHealthProcessedDataModel>[];
  } = {};
  data.forEach((d) => {
    const key = getGroupByValue(formData.groupBy, d);
    if (!groupAggregates[key]) {
      groupAggregates[key] = [];
    }
    groupAggregates[key].push(d);
  });

  return Object.keys(groupAggregates).map((k) => {
    let obj = { ...groupAggregates[k][0] } as NationalHealthProcessedDataModel;

    if (
      formData.attribute1 &&
      groupAggregates[k] &&
      groupAggregates[k].length > 0
    ) {
      if (formData.attribute1) {
        // @ts-ignore
        obj[formData.attribute1] = Math.max(
          buildAggregateValue(formData, groupAggregates[k], 'attribute1'),
          0
        );
      }
      if (formData.attribute2) {
        // @ts-ignore
        obj[formData.attribute2] = Math.max(
          buildAggregateValue(formData, groupAggregates[k], 'attribute2'),
          0
        );
      }
    }

    if (formData.groupBy === GroupByType.State) {
      obj.state = k;
      obj.display_name =
        stateAbbreviationsMap[k as keyof typeof stateAbbreviationsMap] ?? k;
    } else if (formData.groupBy === GroupByType.UrbanRuralStatus) {
      obj.urban_rural_status = k;
      obj.display_name = k;
    } else {
      obj.cnty_fips = k;
      obj.display_name = data.find((d) => d.cnty_fips === k)?.display_name ?? k;
    }

    return obj;
  });
}
