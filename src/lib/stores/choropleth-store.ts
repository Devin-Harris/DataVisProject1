import { writable } from 'svelte/store';
import type { ChoroplethStoreState } from '../models/choropleth-store.model';

export const initialChoroplethStore: ChoroplethStoreState = {
  selectedData: [],
};

export const choroplethStore = writable<ChoroplethStoreState>(
  initialChoroplethStore
);
