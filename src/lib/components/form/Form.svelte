<script lang="ts">
  import { Formly, type IField } from 'svelte-formly';
  import { attributesMap } from '../../models/attributes.model';
  import { ChartType } from '../../models/chart-type.enum';
  import type { FormStoreState } from '../../models/form-store.model';
  import { GroupByAggregate } from '../../models/group-by-average.enum';
  import { GroupByType } from '../../models/group-by-type.enum';
  import type { NationalHealthProcessedDataModel } from '../../models/nationalHealthData.model';
  import { SortDirection } from '../../models/sort-direction.model';
  import { formStore, initialFormStore } from '../../stores/form-store';

  const attributesToExclude: (keyof NationalHealthProcessedDataModel)[] = [
    'cnty_fips',
    'display_name',
    'urban_rural_status',
    'state',
  ];

  const _chartTypes = ChartType;

  let formData: FormStoreState;

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

  const bar_fields: IField[] = [
    {
      type: 'select', // required
      name: 'barSortDirection', // required
      attributes: {
        id: 'barSortDirection', // required
        classes: ['form-control'], // optional
        label: 'Sort Direction',
      },
      value: initialFormStore.barSortDirection,
      extra: {
        options: [
          { value: SortDirection.None, title: SortDirection.None },
          {
            value: SortDirection.Alphabetically,
            title: SortDirection.Alphabetically,
          },
          {
            value: SortDirection.ReverseAlphabetically,
            title: SortDirection.ReverseAlphabetically,
          },
          {
            value: SortDirection.Attribute1Ascending,
            title: SortDirection.Attribute1Ascending,
          },
          {
            value: SortDirection.Attribute1Descending,
            title: SortDirection.Attribute1Descending,
          },
          {
            value: SortDirection.Attribute2Ascending,
            title: SortDirection.Attribute2Ascending,
          },
          {
            value: SortDirection.Attribute2Descending,
            title: SortDirection.Attribute2Descending,
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

  const onChange2 = (event: Event) => {
    formStore.update((e) => {
      return { ...e, barWidth: +(event.target as HTMLInputElement).value };
    });
  };

  formStore.subscribe((fd) => {
    formData = fd;
    fields[3].attributes.disabled = formData.chartType === ChartType.Choropleth;
    fields[4].attributes.disabled =
      formData.groupBy === GroupByType.County ||
      formData.chartType === ChartType.Choropleth;
  });
</script>

<div class="form-container">
  <Formly realtime {fields} form_name="form" on:update={onChange} />

  {#if formData.chartType === _chartTypes.Bar}
    <Formly
      realtime
      fields={bar_fields}
      form_name="bar_form"
      on:update={onChange}
    />
    <label for="bar-width-range">Minimum Bar Width</label>
    <input
      name="bar-width-range"
      type="range"
      min="1"
      max="150"
      bind:value={formData.barWidth}
      on:input={onChange2}
    />
  {/if}
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

    input {
      width: 100%;
    }
  }
</style>
