<script lang="ts">
  import { attributesMap } from '../../models/attributes.model';
  import { ChartType } from '../../models/chart-type.enum';
  import type { FormStoreState } from '../../models/form-store.model';
  import type { LegendStoreState } from '../../models/legend-store.model';
  import { formStore } from '../../stores/form-store';
  import { legendStore } from '../../stores/legend-store';

  const _chartTypes = ChartType;

  let formData: FormStoreState;
  formStore.subscribe((s) => {
    formData = { ...s };
  });

  let legendData: LegendStoreState;
  legendStore.subscribe((s) => {
    legendData = { ...s };
  });
</script>

<fieldset class="legend">
  <legend>Legend </legend>
  {#if formData.chartType !== _chartTypes.Choropleth}
    <div class="legend-colors">
      {#each legendData.colorPalette.domain() as domain}
        <p>
          <span style="background: {legendData.colorPalette(domain)}"></span>
          {domain}
        </p>
      {/each}
    </div>
  {:else}
    <div class="choro-legend-container">
      <div class="legend-1 choro-legend">
        <p>{attributesMap[formData.attribute1]}</p>
        <div
          class="gradient"
          style="background: linear-gradient(to right, {legendData.colorPalette.range()[0]}, {legendData.colorPalette.range()[1]})"
        >
          <div class="lower">
            <small>{legendData.colorPalette.domain()[0]}</small>
          </div>
          <div class="higher">
            <small>{legendData.colorPalette.domain()[1]}</small>
          </div>
        </div>
      </div>

      {#if legendData.colorPalette2}
        <div class="legend-2 choro-legend">
          <p>{attributesMap[formData.attribute2]}</p>
          <div
            class="gradient"
            style="background: linear-gradient(to right, {legendData.colorPalette2.range()[0]}, {legendData.colorPalette2.range()[1]})"
          >
            <div class="lower">
              <small>{legendData.colorPalette2.domain()[0]}</small>
            </div>
            <div class="higher">
              <small>{legendData.colorPalette2.domain()[1]}</small>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</fieldset>

<style lang="scss">
  .legend {
    padding: 1em;
    height: 100%;
    width: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .legend-colors {
      width: 100%;
      overflow: auto;
      display: flex;
      flex-wrap: wrap;
      // grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      p {
        margin-bottom: 0.5em;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-right: 0.5em;
        min-width: 50px;
        span {
          height: 1em;
          width: 1em;
          margin-right: 0.25em;
          display: block;
        }
      }
    }

    .choro-legend-container {
      width: 100%;
      .choro-legend {
        margin-bottom: 1.5em;
        width: 100%;
        .gradient {
          height: 1em;
          width: 100%;
          position: relative;
          margin-bottom: 1em;
          .lower {
            position: absolute;
            top: 1em;
            left: 0;
          }
          .higher {
            position: absolute;
            top: 1em;
            right: 0;
          }
        }
      }
    }
  }
</style>
