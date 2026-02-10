// Stub module to avoid bundling amCharts in builds that do not use charts.
export class Root {
	static new() {
		return { locale: undefined };
	}
}

export const addLicense = () => {};
export const color = (value: string) => ({
	value,
	toString: () => value,
});

export class ColorSet {}
export class Scrollbar {}
export class Theme {}
export class Tooltip {}
export class XYChart {}
export class ValueAxis {}
export class AxisRendererX {}
export class AxisRendererY {}
export class XYCursor {}
export class LineSeries {}
export class CategoryAxis {}
export class ColumnSeries {}
export class PieChart {}
export class PieSeries {}

export default {};
