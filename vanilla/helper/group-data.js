function getGroupByValue(groupBy, d) {
  return groupBy === 'State'
    ? d.state ?? ''
    : groupBy === 'UrbanRuralStatus'
    ? d.urban_rural_status
    : d.county_name + ` (${d.state})`;
}

function buildAggregateValue(formData, allValues, attribute) {
  let value = 0;

  const values = allValues.filter((curr) => curr[formData[attribute]] >= 0);

  if (formData.groupBy === 'County') {
    return allValues[0][formData[attribute]];
  }

  if (formData.groupByAggregate === 'Avg') {
    let sum = values.reduce((acc, curr) => {
      return acc + curr[formData[attribute]];
    }, 0);
    let count = values.length;
    value = count > 0 ? sum / count : 0;
  } else if (formData.groupByAggregate === 'Max') {
    value = Math.max(...values.map((g) => g[formData[attribute]]));
  } else if (formData.groupByAggregate === 'Min') {
    value = Math.min(...values.map((g) => g[formData[attribute]]));
  } else if (formData.groupByAggregate === 'Sum') {
    value = values.reduce((acc, curr) => {
      return acc + curr[formData[attribute]];
    }, 0);
  } else if (formData.groupByAggregate === 'Count') {
    value = values.filter((curr) => curr[formData[attribute]] >= 0).length;
  }
  return value;
}

function groupData(formData, data) {
  let groupAggregates = {};

  data.forEach((d) => {
    const key = getGroupByValue(formData.groupBy, d);
    if (!groupAggregates[key]) {
      groupAggregates[key] = [];
    }
    groupAggregates[key].push(d);
  });

  return Object.keys(groupAggregates).map((k) => {
    let obj = { ...groupAggregates[k][0] };

    if (groupAggregates[k] && groupAggregates[k].length > 0) {
      if (formData.attribute1) {
        obj[formData.attribute1] = Math.max(
          buildAggregateValue(formData, groupAggregates[k], 'attribute1'),
          0
        );
      }
      if (formData.attribute2) {
        obj[formData.attribute2] = Math.max(
          buildAggregateValue(formData, groupAggregates[k], 'attribute2'),
          0
        );
      }
    }

    if (formData.groupBy === 'State') {
      obj.state = k;
      obj.display_name = stateAbbreviationsMap[k] ?? k;
    } else if (formData.groupBy === 'UrbanRuralStatus') {
      obj.urban_rural_status = k;
      obj.display_name = k;
    } else {
      obj.cnty_fips = k;
      obj.display_name = data.find((d) => d.cnty_fips === k)?.display_name ?? k;
    }

    return obj;
  });
}
