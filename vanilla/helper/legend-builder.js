class LegendBuilder {
  legend = null;

  constructor() {
    this.legend = document.getElementById('legend');
    if (!this.legend) {
      console.error('Legend element does not exist');
    }
    if (this.legend.children.length === 0) {
      this.buildLegend();
    }
  }

  buildLegend() {
    const legendElm = document.createElement('legend');
    legendElm.innerText = 'Legend';

    this.fieldSetElm = document.createElement('fieldset');
    this.fieldSetElm.append(legendElm);
    this.fieldSetElm.classList.add('legend');

    this.legend.append(this.fieldSetElm);
  }

  setScatterColorScale(colorScale) {
    chartLegends[chartType.Scatter] = colorScale;

    this.removeFieldSet();

    const legendColors = document.createElement('div');
    legendColors.classList.add('legend-colors');

    colorScale.domain().forEach((d) => {
      const p = document.createElement('p');
      const span = document.createElement('span');
      span.style.background = colorScale(d);
      p.append(span);
      p.append(d);
      legendColors.append(p);
    });

    this.fieldSetElm.append(legendColors);
  }

  setBarColorScale(colorScale) {
    chartLegends[chartType.Bar] = colorScale;

    this.removeFieldSet();

    const legendColors = document.createElement('div');
    legendColors.classList.add('legend-colors');

    colorScale.domain().forEach((d) => {
      const p = document.createElement('p');
      const span = document.createElement('span');
      span.style.background = colorScale(d);
      p.append(span);
      p.append(d);
      legendColors.append(p);
    });

    this.fieldSetElm.append(legendColors);
  }

  setChoroplethColorScale(attribute, colorScale) {
    chartLegends[chartType.Choropleth][attribute] = colorScale;

    this.removeFieldSet();

    const container = document.createElement('div');
    container.classList.add('choro-legend-container');

    const att1Scheme = chartLegends[chartType.Choropleth]?.attribute1;
    const att2Scheme = chartLegends[chartType.Choropleth]?.attribute2;
    if (att1Scheme && att2Scheme) {
      container.append(this.buildMapLegend('attribute1', att1Scheme));
      container.append(this.buildMapLegend('attribute2', att2Scheme));
      this.fieldSetElm.append(container);
    }
  }

  removeFieldSet() {
    // this.fieldSetElm.children.removeChild(1);
    // console.log(this.fieldSetElm.children.length);
    Array.from(this.fieldSetElm.children).forEach((element, i) => {
      if (i !== 0) element.remove();
    });
  }

  buildMapLegend(attribute, scale) {
    const choro = document.createElement('div');
    choro.classList.add(`legend-${attribute}`);
    choro.classList.add('choro-legend');

    const choroLabel = document.createElement('p');
    choroLabel.innerText = attributesMap[formData[attribute]];

    const choroScale = document.createElement('div');
    choroScale.classList.add('gradient');
    choroScale.style.background = `linear-gradient(to right, ${
      scale.range()[0]
    }, ${scale.range()[1]})`;

    const lower = document.createElement('div');
    lower.classList.add('lower');
    const lowerText = document.createElement('small');
    lowerText.innerText = scale.domain()[0];

    const higher = document.createElement('div');
    higher.classList.add('higher');
    const higherText = document.createElement('small');
    higherText.innerText = scale.domain()[1];

    choroScale.append(lower);
    choroScale.append(higher);
    choro.append(choroLabel);
    choro.append(choroScale);

    return choro;
  }
}
