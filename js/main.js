// Wait for DOM to load to start javascript logic
window.addEventListener('DOMContentLoaded', () => {
   main();
});

async function main() {
   const data = await getData();

   timelineCircles = new TimelineCircles(
      {
         parentElement: '#timeline',
         containerHeight: 1100,
         containerWidth: 1000,
      },
      data
   );
}

async function getData() {
   const data = await d3.csv('data/disasters.csv');
   processData(data);
   return data;
}

function processData(data) {
   data.forEach((d) => {
      d.cost = +d.cost;
      d.daysFromYrStart = computeDays(d.start);
      let tokens = d.start.split('-');
      d.year = +tokens[0];
   });
}

function computeDays(disasterDate) {
   let tokens = disasterDate.split('-');
   let year = +tokens[0];
   let month = +tokens[1];
   let day = +tokens[2];
   return (
      (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) /
      24 /
      60 /
      60 /
      1000
   );
}
