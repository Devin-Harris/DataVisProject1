<script lang="ts">
  import { Formly, type IField } from 'svelte-formly';
  import { attributesMap } from '../../models/attributes.model';
  import { ChartType } from '../../models/chart-type.enum';
  import type { FormStoreState } from '../../models/form-store.model';
  import { GroupByAggregate } from '../../models/group-by-average.enum';
  import { GroupByType } from '../../models/group-by-type.enum';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { formStore, initialFormStore } from '../../stores/form-store';

  const attributesToExclude: (keyof NationalHealthProcessedDataModel)[] = [
    'cnty_fips',
    'display_name',
    'urban_rural_status',
    'state',
  ];

  const form_name = 'form';

  const fields: IField[] = [
    {
      type: 'select', // required
      name: 'chartType', // required
      attributes: {
        id: 'chartType', // required
        classes: ['form-control'], // optional
        label: 'Chart Type',
      },
      value: initialFormStore.chartType,
      extra: {
        options: [
          { value: ChartType.Scatter, title: ChartType.Scatter },
          { value: ChartType.Bar, title: ChartType.Bar },
          {
            value: ChartType.Choropleth,
            title: ChartType.Choropleth,
          },
        ],
      },
    },
    {
      type: 'select', // required
      name: 'attribute1', // required
      attributes: {
        id: 'attribute1', // required
        classes: ['form-control'], // optional
        label: 'Attribute 1',
      },
      value: initialFormStore.attribute1,
      extra: {
        options: Object.keys(attributesMap)
          .filter(
            (a) =>
              !attributesToExclude.includes(
                a as keyof NationalHealthProcessedDataModel,
              ),
          )
          .map((a) => {
            return {
              value: a,
              title: attributesMap[a as keyof NationalHealthProcessedDataModel],
            };
          }),
      },
    },
    {
      type: 'select', // required
      name: 'attribute2', // required
      attributes: {
        id: 'attribute2', // required
        classes: ['form-control'], // optional
        label: 'Attribute 2',
      },
      value: initialFormStore.attribute2,
      extra: {
        options: Object.keys(attributesMap)
          .filter(
            (a) =>
              !attributesToExclude.includes(
                a as keyof NationalHealthProcessedDataModel,
              ),
          )
          .map((a) => {
            return {
              value: a,
              title: attributesMap[a as keyof NationalHealthProcessedDataModel],
            };
          }),
      },
    },
    {
      type: 'select', // required
      name: 'groupBy', // required
      attributes: {
        id: 'groupBy', // required
        classes: ['form-control'], // optional
        label: 'Group by',
      },
      value: initialFormStore.groupBy,
      extra: {
        options: [
          { value: GroupByType.County, title: GroupByType.County },
          { value: GroupByType.State, title: GroupByType.State },
          {
            value: GroupByType.UrbanRuralStatus,
            title: GroupByType.UrbanRuralStatus,
          },
        ],
      },
    },
    {
      type: 'select', // required
      name: 'groupByAggregate', // required
      attributes: {
        id: 'groupByAggregate', // required
        classes: ['form-control'], // optional
        label: 'Group by Aggregate',
        disabled: true,
      },
      value: initialFormStore.groupByAggregate,
      extra: {
        options: [
          { value: GroupByAggregate.Avg, title: GroupByAggregate.Avg },
          { value: GroupByAggregate.Min, title: GroupByAggregate.Min },
          {
            value: GroupByAggregate.Max,
            title: GroupByAggregate.Max,
          },
          {
            value: GroupByAggregate.Sum,
            title: GroupByAggregate.Sum,
          },
          {
            value: GroupByAggregate.Count,
            title: GroupByAggregate.Count,
          },
        ],
      },
    },
  ];

  const onChange = (event: { detail: FormStoreState }) => {
    formStore.update((e) => {
      return { ...e, ...event.detail };
    });
  };

  formStore.subscribe((formData) => {
    fields[3].attributes.disabled = formData.chartType === ChartType.Choropleth;
    fields[4].attributes.disabled =
      formData.groupBy === GroupByType.County ||
      formData.chartType === ChartType.Choropleth;
  });
</script>

<div class="form-container">
  <Formly realtime {fields} {form_name} on:update={onChange} />
</div>

<style lang="scss">
  .form-container {
    :global(button) {
      display: none;
    }
    :global(label) {
      display: block;
      font-weight: bold;
      font-size: small;
    }
    :global(select) {
      display: block;
      margin-bottom: 1em;
      width: 100%;
      padding: 0.5em;
      border: 1px solid #d1d1d1;
      border-radius: 0.25em;
    }
  }
</style>
