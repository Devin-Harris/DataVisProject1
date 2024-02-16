<script lang="ts">
  import { onMount } from 'svelte';
  import { attributesMap } from '../../models/attributes.model';
  import type { ChoroplethStoreState } from '../../models/choropleth-store.model';
  import type { FormStoreState } from '../../models/form-store.model';
  import type { GeoData } from '../../models/geo-data.model';
  import { choroplethStore } from '../../stores/choropleth-store';
  import { formStore } from '../../stores/form-store';
  import ChoroplethChart from './ChoroplethChart.svelte';

  export let data: GeoData;

  let mapsContainer: HTMLElement;
  let map1Container: HTMLElement;
  let map2Container: HTMLElement;

  let selectedAttribute: keyof Pick<
    FormStoreState,
    'attribute1' | 'attribute2'
  > = 'attribute1';

  let choroplethData: ChoroplethStoreState;

  let formData: FormStoreState;

  onMount(() => {
    resize();
    window.addEventListener('resize', resize);
  });

  choroplethStore.subscribe((s) => {
    choroplethData = s;
    if (choroplethData && choroplethData.selectedData) {
      document
        .querySelectorAll(`.county-boundary`)
        .forEach((c) => c.classList.remove('selected'));

      choroplethData.selectedData.forEach((d) => {
        const match: NodeListOf<HTMLElement> = document.querySelectorAll(
          `.county-boundary.county-${d.properties.data.cnty_fips}`,
        );

        if (match) {
          match.forEach((m: HTMLElement) => {
            m.classList.add('selected');
          });
        }
      });
    }
  });

  formStore.subscribe((s) => {
    formData = s;
  });

  function resize() {
    if (mapsContainer) {
      const bounds = mapsContainer.getBoundingClientRect();
      map1Container.style.width = bounds.width + 'px';
      map1Container.style.height = bounds.height + 'px';
      map2Container.style.width = bounds.width + 'px';
    }
  }

  function toggleAttribute() {
    selectedAttribute =
      selectedAttribute === 'attribute1' ? 'attribute2' : 'attribute1';
  }
</script>

<div class="choro-container" bind:this={mapsContainer}>
  <div class="choro">
    <div
      class:shown={selectedAttribute === 'attribute1'}
      class="choro1"
      bind:this={map1Container}
    >
      <ChoroplethChart {data} attribute="attribute1" />
    </div>
    <div
      class:shown={selectedAttribute === 'attribute2'}
      class="choro2"
      bind:this={map2Container}
    >
      <ChoroplethChart {data} attribute="attribute2" />
    </div>
  </div>
</div>

<div class="controls">
  <button on:click={toggleAttribute}>Toggle Chart Attribute</button>

  <div class="selected-content">
    {#if choroplethData && choroplethData.selectedData}
      {#each choroplethData.selectedData as d}
        <br />
        <div class="content">
          <p>{d.properties.data.display_name}</p>
          <p>
            <strong>{attributesMap[formData.attribute1]}</strong>
            <span>{d.properties.data[formData.attribute1]}</span>
          </p>
          <p>
            <strong>{attributesMap[formData.attribute2]}</strong>
            <span>{d.properties.data[formData.attribute2]}</span>
          </p>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style lang="scss">
  .choro-container {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    display: flex;
    .choro {
      width: 100%;
      height: 100%;
      position: relative;
      overflow-x: auto;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      .choro1,
      .choro2 {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        opacity: 0;
        transition: 0.3s;
        pointer-events: none;
        &.shown {
          opacity: 1;
          pointer-events: all;
        }
      }
    }
  }

  .controls {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 20em;
    height: 100%;
    padding: 1em;

    .selected-content {
      width: 100%;
      .content {
        border: 1px solid gray;
        padding: 0.5em;
        border-radius: 0.5em;
        strong,
        span {
          font-size: smaller;
        }
        p {
          font-size: medium;
        }
      }
    }

    button {
      width: 100%;
      border: 1px solid gray;
      padding: 0.5em;
      border-radius: 0.25em;
    }
  }
</style>
