class BarChart {
  constructor(_config, _data) {
    this.config = {
      parentElement: document.querySelector(_config.parentElementSelector),
      parentElementSelector: _config.parentElementSelector,
      margin: _config.margin || { top: 40, right: 50, bottom: 40, left: 50 },
    };
    this.data = _data;
    this.initVis();
    window.addEventListener('resize', () => {
      this.setWidthAndHeight();

      this.xScale.range([0, this.width]);
      this.yScale.range([this.height, 0]);

      this.updateVis();
    });
  }

  // Calculate inner chart size. Margin specifies the space around the actual chart.
  setWidthAndHeight() {
    this.width = Math.max(
      this.config.parentElement.getBoundingClientRect().width -
        this.config.margin.left -
        this.config.margin.right
    );
    this.height =
      this.config.parentElement.getBoundingClientRect().height -
      this.config.margin.top -
      this.config.margin.bottom;

    this.zoom
      ?.translateExtent([
        [0, 0],
        [this.width, this.height],
      ])
      .extent([
        [0, 0],
        [this.width, this.height],
      ]);
  }

  removeContent() {
    Array.from(this.config.parentElement.children).forEach((c) => c.remove());
  }

  destroy() {
    this.removeContent();
    delete this;
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    this.removeContent();
    this.setWidthAndHeight();

    // Initialize scales
    this.colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    this.padding = 0.1;
    this.xScale = d3.scaleBand().range([0, this.width]).padding(this.padding);
    this.yScale = d3.scaleLinear().range([this.height, 0]).nice();

    // Initialize axes
    this.xAxis = d3.axisBottom(this.xScale);
    this.yAxis = d3.axisLeft(this.yScale);

    // Define SVG drawing area
    this.svg = d3.select(this.config.parentElementSelector);

    const extent = [
      [0, 0],
      [this.width, this.height],
    ];
    this.zoom = d3
      .zoom()
      .scaleExtent([1, 1000])
      .translateExtent(extent)
      .extent(extent)
      .on('zoom', (event) => this.zoomed(event));

    this.svg.call(this.zoom);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    this.chart = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.config.margin.left},${this.config.margin.top / 2})`
      );
    //  this.brush = d3.brushX();
    //  this.chart.call(
    //    d3.brushX().on('start brush end', (e) => {
    //      let extent = e.selection;
    //      selectedPoints.clear();
    //      formBuilder.storeSelection(e.selection, chartType.Bar);

    //      if (extent) {
    //        this.rectangleGroups.each((d, i, j) => {
    //          let rectGroup = j[i];
    //          // Is the circle in the selection?

    //          const width = +rectGroup.getAttribute('width');
    //          const x = +rectGroup.getAttribute('x');

    //          const cx = x + width / 2;

    //          let isBrushed = extent[0] <= cx && extent[1] >= cx;

    //          if (isBrushed) {
    //            selectedPoints.add(getGroupByValue(formData.groupBy, d));
    //          }
    //        });
    //      }
    //      this.updateVis();
    //    })
    //  );

    // Append empty x-axis group and move it to the bottom of the chart
    this.xAxisG = this.chart
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${this.height})`);

    // Append y-axis group
    this.yAxisG = this.chart.append('g').attr('class', 'axis y-axis');

    // Append both axis titles
    this.xAxisG
      .append('text')
      .attr('class', 'axis-title x-axis-title')
      .attr('x', this.width / 2)
      .attr('y', 30)
      .style('text-anchor', 'middle')
      .attr('fill', '#5D6971')
      .text(formData.groupBy);

    this.yAxisG
      .append('text')
      .attr('class', 'axis-title y-axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -30)
      .attr('x', -1 * (this.height / 2))
      .style('text-anchor', 'middle')
      .attr('fill', '#5D6971')
      .text(
        `${attributesMap[formData.attribute1]} & ${
          attributesMap[formData.attribute2]
        }`
      );

    this.clipPath = this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);
    this.dataGroup = this.chart.append('g').attr('class', 'data-group');

    this.disclaimer = this.svg
      .append('g')
      .attr('class', 'disclaimer')
      .attr(
        'transform',
        `translate(${this.width / 2 + this.config.margin.left}, ${
          this.config.margin.top
        })`
      )
      .attr('text-anchor', 'middle');

    this.disclaimer
      .append('text')
      .attr('fill', 'red')
      .attr('font-size', '.75em')
      .attr('font-weight', 'bold')
      .text(
        `Too many datapoints to show! Try zooming in or grouping your data`
      );

    this.updateVis(false);
    //  if (storedSelection[chartType.Bar]) {
    //    this.chart
    //      .transition()
    //      .call(this.brush.move, storedSelection[chartType.Bar]);
    //  }
    requestAnimationFrame(() => {
      this.updateVis();
    });
  }

  updateData(data, resetZoom = true) {
    this.data = this.sortBarData(data);
    this.updateVis();
    if (resetZoom) {
      this.svg.call(this.zoom.transform, d3.zoomIdentity);
    }
  }

  updateDisclaimer() {
    const firstDp = d3.select('.data-point').node();
    const firstBar = d3.select('.bar').node();

    const firstDpWidth = firstDp?.getBoundingClientRect().width ?? 0;
    const firstBarWidth = firstBar?.getBoundingClientRect().width ?? 0;
    const mult = firstDpWidth * firstBarWidth;

    if (mult < 1 && !(Math.abs(1 - mult) <= this.padding)) {
      this.disclaimer.attr('class', 'disclaimer show');
      this.disclaimer.attr(
        'transform',
        `translate(${this.width / 2 + this.config.margin.left}, ${
          this.config.margin.top
        })`
      );
    } else {
      this.disclaimer.attr('class', 'disclaimer hide');
    }
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis(transition = true) {
    // Initialize linear and ordinal scales (input domain and output range)
    this.colorScale.domain([
      attributesMap[formData.attribute1],
      attributesMap[formData.attribute2],
    ]);
    legendBuilder.setBarColorScale(this.colorScale);

    const att1Values = selectedLegendGroups.has(
      attributesMap[formData.attribute1]
    )
      ? this.data.map((d) => d[formData.attribute1] ?? 0)
      : [];
    const att2Values = selectedLegendGroups.has(
      attributesMap[formData.attribute2]
    )
      ? this.data.map((d) => d[formData.attribute2] ?? 0)
      : [];
    const minAtt = Math.min(...att1Values, ...att2Values);
    const maxAtt = Math.max(...att1Values, ...att2Values);

    // Set the scale input domains
    this.xScale
      .domain(this.data.map((d) => getGroupByValue(formData.groupBy, d)))
      .range([0, this.width]);

    this.yScale.domain([maxAtt, minAtt]).range([0, this.height]).nice();

    this.clipPath.attr('width', this.width).attr('height', this.height);

    // Set axis labels
    d3.select('.x-axis-title')
      .attr('x', this.width / 2)
      .text(formData.groupBy);
    d3.select('.y-axis-title')
      .attr('x', -1 * (this.height / 2))
      .text(
        `${attributesMap[formData.attribute1]} & ${
          attributesMap[formData.attribute2]
        }`
      );

    let bandwidth = this.xScale.bandwidth();
    if (selectedLegendGroups.size > 1) {
      bandwidth /= selectedLegendGroups.size;
      bandwidth -= selectedLegendGroups.size;
    }
    const barWidth = Math.max(bandwidth, 0);
    this.updateDisclaimer();

    this.rectangleGroups = this.dataGroup
      .selectAll('.data-point')
      .data(this.data)
      .join('g')
      .attr('class', (d) => {
        const classes = ['data-point'];
        if (selectedPoints?.has(getGroupByValue(formData.groupBy, d))) {
          classes.push('selected');
        }
        return classes.join(' ');
      })
      .attr('transform', (d) => `translate(${0},0)`)
      .attr('x', (d) => this.xScale(getGroupByValue(formData.groupBy, d)))
      .attr('y', 0)
      .attr('width', this.xScale.bandwidth())
      .attr('height', this.height);

    this.rectangleGroups
      .selectAll('.bar')
      .data((d) => {
        const arr = [];
        if (selectedLegendGroups.has(attributesMap[formData.attribute1])) {
          arr.push({
            data: d,
            value: d[formData.attribute1],
            class: 'attribute1',
          });
        }
        if (selectedLegendGroups.has(attributesMap[formData.attribute2])) {
          arr.push({
            data: d,
            value: d[formData.attribute2],
            class: 'attribute2',
          });
        }
        return arr;
      })
      .join('rect')
      .attr('class', (d) => {
        const classes = ['bar', d.class];
        classes.push(
          selectedLegendGroups.has(attributesMap[formData[d.class]])
            ? 'shown'
            : 'hidden'
        );
        return classes.join(' ');
      })
      .transition()
      .duration(transition ? 250 : 0)
      .attr('width', barWidth)
      .transition()
      .duration(transition ? 250 : 0)
      .attr('height', (d) => {
        return this.height - Math.max(this.yScale(d.value) ?? 0, 0);
      })
      .attr('fill', (d) => this.colorScale(attributesMap[formData[d.class]]))
      .attr('x', (d, i) => {
        let x = this.xScale(getGroupByValue(formData.groupBy, d.data));
        let bandwidth = this.xScale.bandwidth();
        if (selectedLegendGroups.size > 1) {
          bandwidth /= selectedLegendGroups.size;
          x += i * bandwidth;
        }
        return x;
      })
      .attr('y', (d) =>
        formData[d.class] ? this.yScale(d.value) : this.height + 100
      );

    this.rectangleGroups
      .selectAll('.bar.attribute1')
      .on('mouseover', (event, d) =>
        this.mouseOverTooltipCB(event, d.data, 'attribute1')
      )
      .on('mouseleave', () => this.mouseLeaveTooltipCB())
      .on('click', (e, d) => {
        const value = getGroupByValue(formData.groupBy, d.data);
        if (selectedPoints.has(value)) {
          selectedPoints.delete(value);
        } else {
          selectedPoints.add(value);
        }
        this.updateVis();
      });
    this.rectangleGroups
      .selectAll('.bar.attribute2')
      .on('mouseover', (event, d) =>
        this.mouseOverTooltipCB(event, d.data, 'attribute2')
      )
      .on('mouseleave', () => this.mouseLeaveTooltipCB())
      .on('click', (e, d) => {
        const value = getGroupByValue(formData.groupBy, d.data);
        if (selectedPoints.has(value)) {
          selectedPoints.delete(value);
        } else {
          selectedPoints.add(value);
        }
        this.updateVis();
      });

    // Update the axes/gridlines
    this.xAxisG.call(this.xAxis);
    this.yAxisG.call(this.yAxis);

    const tooltip = d3.select('#tooltip');
    tooltip.on('mouseover', () => {
      tooltip.style('opacity', 1).style('pointer-events', 'all');
    });
    tooltip.on('mouseleave', () => {
      tooltip.style('opacity', 0).style('pointer-events', 'none');
    });
  }

  mouseOverTooltipCB(event, d, attribute) {
    const tooltip = d3.select('#tooltip');
    const tooltipElm = tooltip.node();
    const tooltipBounds = tooltipElm.getBoundingClientRect();
    const chartBounds = this.config.parentElement.getBoundingClientRect();
    tooltip
      .style('pointer-events', 'all')
      .style('opacity', '1')
      .style(
        'left',
        Math.min(
          event.pageX,
          chartBounds.x + chartBounds.width - tooltipBounds.width
        ) + 'px'
      )
      .style(
        'top',
        Math.min(
          event.pageY,
          chartBounds.y + chartBounds.height - tooltipBounds.height
        ) + 'px'
      ).html(`
          <small>${d.display_name}</small>
          ${
            attribute === 'attribute1'
              ? `<p>
                <strong>${attributesMap[formData.attribute1]}</strong>
                ${
                  formData.groupBy !== 'County'
                    ? `<i>(${formData.groupByAggregate})</i>`
                    : ''
                }
                </p>
              <p>${d[formData.attribute1]}</p>`
              : `
             <p>
              <strong>${attributesMap[formData.attribute2]}</strong>
              ${
                formData.groupBy !== 'County'
                  ? `<i>(${formData.groupByAggregate})</i>`
                  : ''
              }
              </p>
            <p>${d[formData.attribute2]}</p>`
          }
        `);
  }

  mouseLeaveTooltipCB(event) {
    d3.select('#tooltip').style('opacity', '0').style('pointer-events', 'none');
  }

  zoomed(event) {
    this.xScale.range([0, this.width].map((d) => event.transform.applyX(d)));

    this.rectangleGroups
      .attr('x', (d) => this.xScale(getGroupByValue(formData.groupBy, d)))
      .attr('y', 0)
      .attr('width', this.xScale.bandwidth())
      .attr('height', this.height);

    let bandwidth = this.xScale.bandwidth();
    if (selectedLegendGroups.size > 1) {
      bandwidth /= selectedLegendGroups.size;
      bandwidth -= selectedLegendGroups.size;
    }
    const barWidth = Math.max(bandwidth, 0);

    this.rectangleGroups
      .selectAll('.bar')
      .attr('x', (d, i) => {
        let x = this.xScale(getGroupByValue(formData.groupBy, d.data));
        let bandwidth = this.xScale.bandwidth();
        if (selectedLegendGroups.size > 1) {
          bandwidth /= selectedLegendGroups.size;
          x += i * bandwidth;
        }
        return x;
      })
      .attr('width', barWidth);

    this.svg.selectAll('.x-axis').call(this.xAxis);
    this.updateDisclaimer();
  }

  sortBarData(data) {
    if (formData.barSortDirection === 'None') {
      return data;
    }

    return data.sort((a, b) => {
      if (formData.barSortDirection === 'Alphabetically') {
        return a.display_name > b.display_name ? 1 : -1;
      } else if (formData.barSortDirection === 'ReverseAlphabetically') {
        return a.display_name > b.display_name ? -1 : 1;
      } else if (formData.barSortDirection === 'Attribute1Ascending') {
        if (
          a[formData.attribute1] === null ||
          a[formData.attribute1] === undefined
        )
          return -1;
        if (
          b[formData.attribute1] === null ||
          b[formData.attribute1] === undefined
        )
          return -1;
        return a[formData.attribute1] > b[formData.attribute1] ? 1 : -1;
      } else if (formData.barSortDirection === 'Attribute1Descending') {
        if (
          a[formData.attribute1] === null ||
          a[formData.attribute1] === undefined
        )
          return -1;
        if (
          b[formData.attribute1] === null ||
          b[formData.attribute1] === undefined
        )
          return -1;
        return a[formData.attribute1] < b[formData.attribute1] ? 1 : -1;
      } else if (formData.barSortDirection === 'Attribute2Ascending') {
        if (
          a[formData.attribute1] === null ||
          a[formData.attribute1] === undefined
        )
          return -1;
        if (
          b[formData.attribute1] === null ||
          b[formData.attribute1] === undefined
        )
          return -1;
        return a[formData.attribute2] > b[formData.attribute2] ? 1 : -1;
      } else if (formData.barSortDirection === 'Attribute2Descending') {
        if (
          a[formData.attribute1] === null ||
          a[formData.attribute1] === undefined
        )
          return -1;
        if (
          b[formData.attribute1] === null ||
          b[formData.attribute1] === undefined
        )
          return -1;
        return a[formData.attribute2] < b[formData.attribute2] ? 1 : -1;
      }
      return 1;
    });
  }
}
