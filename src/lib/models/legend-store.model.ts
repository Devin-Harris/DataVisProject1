export interface LegendStoreState {
  colorPalette:
    | d3.ScaleOrdinal<string, string, null>
    | d3.ScaleLinear<number, number, never>;
  colorPalette2?:
    | d3.ScaleOrdinal<string, string, null>
    | d3.ScaleLinear<number, number, never>;
}
