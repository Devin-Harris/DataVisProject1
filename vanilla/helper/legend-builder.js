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

  removeFieldSet() {
    Array.from(this.fieldSetElm.children).forEach((element, i) => {
      if (i !== 0) element.remove();
    });
  }
}
