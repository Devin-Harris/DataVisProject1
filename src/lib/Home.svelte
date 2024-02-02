<script lang="ts">
  import { csv } from 'd3-fetch';
  import { onMount } from 'svelte';
  import TimelineCircles from './TimelineCircles.svelte';

  let data: any | null = null;
  onMount(async () => {
    data = await getData();
  });

  async function getData() {
    const data = await csv('./data/disasters.csv');
    processData(data);
    return data;
  }

  function processData(data: any[]) {
    data.forEach((d) => {
      d.cost = +d.cost;
      d.daysFromYrStart = computeDays(d.start);
      let tokens = d.start.split('-');
      d.year = +tokens[0];
    });
  }

  function computeDays(disasterDate: string) {
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
</script>

{#if data}
  <TimelineCircles {data} />
{/if}
