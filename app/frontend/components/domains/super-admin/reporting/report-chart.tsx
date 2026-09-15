import { Box, Text, useToken } from "@chakra-ui/react"
import React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { IReportChart } from "../../../types/report"

const SERIES_COLORS = ["theme.blue", "theme.blueAlt", "theme.yellow", "success", "semantic.info"]

interface IProps {
  chart: IReportChart
}

export function ReportChart({ chart }: IProps) {
  const colors = useToken("colors", SERIES_COLORS)
  const ChartComponent = chart.type === "line" ? LineChart : BarChart
  const stacked = chart.type === "stacked_bar"

  return (
    <Box w="full" minH="280px" overflow="hidden">
      <Text fontWeight="bold" mb={2}>
        {chart.series.map((s) => s.label).join(", ")}
      </Text>
      <ResponsiveContainer width="100%" height={280}>
        <ChartComponent data={chart.data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={chart.xKey} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {chart.series.map((series, index) =>
            chart.type === "line" ? (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
              />
            ) : (
              <Bar
                key={series.key}
                dataKey={series.key}
                name={series.label}
                fill={colors[index % colors.length]}
                stackId={stacked ? "stack" : undefined}
              />
            )
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </Box>
  )
}
