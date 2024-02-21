class FormBuilder {
  form = null;
  chartType = null;
  attribute1Select = null;
  attribute2Select = null;
  groupBySelect = null;
  groupByAggregateSelect = null;
  barWidthSlider = null;
  sortingSelect = null;
  storedChartType = null;

  attributesToExclude = [
    'cnty_fips',
    'display_name',
    'urban_rural_status',
    'state',
  ];

  constructor() {
    this.form = document.getElementById('form');
    if (!this.form) {
      console.error('Form element does not exist');
    }
    if (this.form.children.length === 0) {
      this.buildForm();
    }
  }

  buildForm() {
    this.appendChartType();
    this.appendAttributeSelects();
    this.appendGroupByFields();
    this.appendSortingSelect();
    // this.appendBarWidthSlider();

    this.registerChangeCallbacks();
    requestAnimationFrame(() => {
      this.handleChange();
    });
  }

  registerChangeCallbacks() {
    this.chartType.addEventListener('change', () => this.handleChange());
    this.attribute1Select.addEventListener('change', () => this.handleChange());
    this.attribute2Select.addEventListener('change', () => this.handleChange());
    this.groupBySelect.addEventListener('change', () => this.handleChange());
    this.groupByAggregateSelect.addEventListener('change', () =>
      this.handleChange()
    );
    // this.barWidthSlider.addEventListener('input', () => this.handleChange());
    this.sortingSelect.addEventListener('change', () => this.handleChange());
  }

  handleChange() {
    const app = document.getElementById('app');
    const attribute1Value = this.attribute1Select.querySelector('select').value;
    const attribute2Value = this.attribute2Select.querySelector('select').value;
    const groupByValue = this.groupBySelect.querySelector('select').value;
    const groupByAggregateValue =
      this.groupByAggregateSelect.querySelector('select').value;
    const chartTypeValue = this.chartType.querySelector('select').value;
    // const barWidthValue = this.barWidthSlider.querySelector('input').value;
    const sortDirectionValue = this.sortingSelect.querySelector('select').value;

    app.classList.remove(...app.classList.values());
    app.classList.add(chartTypeValue);

    this.groupBySelect.querySelector('select').disabled =
      chartTypeValue === 'Choropleth';
    this.groupByAggregateSelect.querySelector('select').disabled =
      groupByValue === 'County' || chartTypeValue === 'Choropleth';

    formData.attribute1 = attribute1Value;
    formData.attribute2 = attribute2Value;
    formData.groupBy = groupByValue;
    formData.groupByAggregate = groupByAggregateValue;
    formData.chartType = chartTypeValue;
    // formData.barWidth = barWid thValue;
    formData.barSortDirection = sortDirectionValue;

    groupedData = groupData(formData, data);

    if (this.storedChartType !== chartTypeValue) {
      scatter?.destroy();
      bar?.destroy();

      if (chartTypeValue === 'Scatter') {
        scatter = new Scatterplot(
          { parentElementSelector: '#scatter' },
          groupedData
        );
      } else if (chartTypeValue === 'Bar') {
        bar = new BarChart({ parentElementSelector: '#bar' }, groupedData);
      } else if (chartTypeValue === 'Choropleth') {
        // scatter?.updateData(groupedData);
      }

      this.storedChartType = chartTypeValue;
    }
    scatter?.updateData(groupedData);
    bar?.updateData(groupedData);
  }

  appendSortingSelect() {
    this.sortingSelect = this.createSelect(sortDirection, 'Sort Direction');
    this.form.append(this.sortingSelect);
  }

  appendBarWidthSlider() {
    this.barWidthSlider = document.createElement('div');
    this.barWidthSlider.classList.add('select-container');
    this.barWidthSlider.id = 'bar-width-slider';

    const input = document.createElement('input');
    input.name = 'bar-width-slider';
    input.type = 'range';
    input.min = 1;
    input.max = 150;
    input.value = 150;

    const label = document.createElement('label');
    label.for = 'bar-width-slider';
    label.innerText = 'Minimum Bar Width';

    this.barWidthSlider.append(label);
    this.barWidthSlider.append(input);

    this.form.append(this.barWidthSlider);
  }

  appendGroupByFields() {
    this.groupBySelect = this.createSelect(groupByType, 'Group By');
    this.form.append(this.groupBySelect);
    this.groupByAggregateSelect = this.createSelect(
      groupByAggregate,
      'Group By Aggregate'
    );
    this.form.append(this.groupByAggregateSelect);
  }

  appendChartType() {
    this.chartType = this.createSelect(chartType, 'Chart Type');
    this.chartType.querySelector('select').value = 'Scatter';
    this.form.append(this.chartType);
  }

  appendAttributeSelects() {
    this.attribute1Select = this.createSelect(
      attributesMap,
      'Attribute 1',
      this.attributesToExclude
    );
    this.attribute1Select.querySelector('select').value =
      'education_less_than_high_school_percent';
    this.attribute2Select = this.createSelect(
      attributesMap,
      'Attribute 2',
      this.attributesToExclude
    );
    this.attribute2Select.querySelector('select').value = 'poverty_perc';

    this.form.append(this.attribute1Select);
    this.form.append(this.attribute2Select);
  }

  createSelect(object, label, keysToExclude = []) {
    const keys = Object.keys(object).filter((a) => !keysToExclude.includes(a));

    const container = document.createElement('div');
    container.classList.add('select-container');
    container.id = label.split(' ').join('');

    const selectElm = document.createElement('select');
    keys.forEach((k) => {
      const option = document.createElement('option');
      option.value = k;
      option.innerText = object[k];
      selectElm.append(option);
    });
    selectElm.name = label;

    const labelElm = document.createElement('label');
    labelElm.for = label;
    labelElm.innerText = label;

    container.append(labelElm);
    container.append(selectElm);
    return container;
  }
}
