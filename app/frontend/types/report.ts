export type TReportRangePreset = "3_months" | "6_months" | "12_months" | "all_time"

export interface IReportRange {
  preset: TReportRangePreset
  startDate: string | null
  endDate: string
}

export interface IReportHeadlineFigure {
  key: string
  label: string
  value: string | number | null
  helpText: string
  approximate?: boolean
  direction?: "up" | "down" | "flat" | "suppressed"
}

export interface IReportChartSeries {
  key: string
  label: string
}

export interface IReportChart {
  key: string
  type: "bar" | "line" | "stacked_bar"
  xKey: string
  series: IReportChartSeries[]
  data: Record<string, string | number>[]
  suppressed: boolean
  suppressionReason?: string | null
  recordCount: number
}

export interface IReportTableColumn {
  key: string
  label: string
}

export interface IReportSort {
  key: string
  direction: "asc" | "desc"
}

export interface IReportTable {
  key: string
  columns: IReportTableColumn[]
  rows: Record<string, string | number | null>[]
  sortable?: boolean
  defaultSort?: IReportSort
}

export interface IReportNote {
  key: string
  kind: string
  text: string
}

export interface IReportPayload {
  key: string
  title: string
  description: string
  range: IReportRange
  computedAt: string
  headlineFigures: IReportHeadlineFigure[]
  charts: IReportChart[]
  tables: IReportTable[]
  notes: IReportNote[]
  empty: boolean
  refreshFailed?: boolean
}

export interface IReportSummary {
  key: string
  title: string
  description: string
}
