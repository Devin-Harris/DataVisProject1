export type ChartConfig = {
  parentElement: string;
  containerWidth: number;
  containerHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  tooltipPadding: number;
};

export const defaultChartConfig: ChartConfig = {
  parentElement: 'body',
  containerWidth: 500,
  containerHeight: 140,
  margin: { top: 40, right: 50, bottom: 10, left: 50 },
  tooltipPadding: 15,
};
