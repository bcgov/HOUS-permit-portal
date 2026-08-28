import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Heading,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IReportPayload } from "../../../types/report"
import { ReportChart } from "./report-chart"
import { ReportTable } from "./report-table"

interface IProps {
  payload: IReportPayload | null
  isLoading: boolean
  controls?: React.ReactNode
}

export function ReportShell({ payload, isLoading, controls }: IProps) {
  const { t } = useTranslation()

  if (isLoading && !payload) {
    return (
      <VStack align="stretch" spacing={6} w="full" data-testid="report-loading">
        {controls}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height="112px" borderRadius="md" />
          ))}
        </SimpleGrid>
        <Skeleton height="280px" borderRadius="md" />
        <Skeleton height="160px" borderRadius="md" />
      </VStack>
    )
  }

  if (!payload) {
    return (
      <Alert status="error" variant="subtle">
        <AlertIcon />
        <AlertTitle>{t("reporting.shell.unavailableTitle")}</AlertTitle>
      </Alert>
    )
  }

  const tableLeads = payload.charts.some((chart) => chart.suppressed) || payload.empty

  return (
    <VStack align="stretch" spacing={8} w="full">
      <Box>
        <Heading as="h1" size="lg">
          {payload.title}
        </Heading>
        <Text color="text.secondary" mt={1}>
          {payload.description}
        </Text>
      </Box>
      {controls}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {payload.headlineFigures.map((figure) => (
          <Stat key={figure.key} borderWidth="1px" borderColor="border.light" borderRadius="md" p={4} bg="greys.white">
            <StatLabel>{figure.label}</StatLabel>
            <StatNumber>
              {formatValue(figure.value)}
              {figure.approximate ? ` ${t("reporting.shell.approximate")}` : ""}
            </StatNumber>
            <StatHelpText>{figure.helpText}</StatHelpText>
          </Stat>
        ))}
      </SimpleGrid>

      {payload.empty ? (
        <Alert status="info" variant="subtle" data-testid="report-empty">
          <AlertIcon />
          <Box>
            <AlertTitle>{t("reporting.shell.emptyTitle")}</AlertTitle>
            <AlertDescription>{t("reporting.shell.emptyBody")}</AlertDescription>
          </Box>
        </Alert>
      ) : (
        <>
          {tableLeads &&
            payload.tables.map((table) => (
              <Box key={`lead-${table.key}`}>
                <Heading as="h2" size="md" mb={3}>
                  {t("reporting.shell.tableHeading")}
                </Heading>
                <ReportTable table={table} />
              </Box>
            ))}

          {payload.charts.map((chart) =>
            chart.suppressed ? (
              <Alert key={chart.key} status="warning" variant="subtle">
                <AlertIcon />
                <AlertDescription>{chart.suppressionReason}</AlertDescription>
              </Alert>
            ) : (
              <Box key={chart.key} borderWidth="1px" borderColor="border.light" borderRadius="md" p={4}>
                <Heading as="h2" size="md" mb={3}>
                  {t("reporting.shell.chartHeading")}
                </Heading>
                <ReportChart chart={chart} />
              </Box>
            )
          )}

          {!tableLeads &&
            payload.tables.map((table) => (
              <Box key={table.key}>
                <Heading as="h2" size="md" mb={3}>
                  {t("reporting.shell.tableHeading")}
                </Heading>
                <ReportTable table={table} />
              </Box>
            ))}
        </>
      )}

      {payload.notes.length > 0 && (
        <Stack spacing={2}>
          {payload.notes.map((note) => (
            <Text key={note.key} fontSize="sm" color="text.secondary">
              {note.text}
            </Text>
          ))}
        </Stack>
      )}
    </VStack>
  )
}

function formatValue(value: string | number | null) {
  if (value === null || value === undefined || value === "") return "—"
  return value
}
