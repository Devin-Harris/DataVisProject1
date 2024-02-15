import * as d3 from 'd3';
import { writable } from 'svelte/store';
import type { LegendStoreState } from '../models/legend-store.model';

export const initialLegendStore: LegendStoreState = {
  colorPalette: d3.scaleOrdinal(d3.schemeTableau10),
};

export const legendStore = writable<LegendStoreState>(initialLegendStore);
