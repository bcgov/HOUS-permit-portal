import {
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
import { ArrowFatLinesRight } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EFlashMessageStatus } from "../../../../types/enums"
import { IReportNote, IReportPayload } from "../../../../types/report"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
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
    return <CustomMessageBox status={EFlashMessageStatus.error} title={t("reporting.shell.unavailableTitle")} />
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
              {formatHeadline(figure.value, figure.approximate ? t("reporting.shell.approximate") : null)}
            </StatNumber>
            <StatHelpText>{figure.helpText}</StatHelpText>
          </Stat>
        ))}
      </SimpleGrid>

      {payload.empty ? (
        <CustomMessageBox
          status={EFlashMessageStatus.info}
          title={t("reporting.shell.emptyTitle")}
          description={t("reporting.shell.emptyBody")}
          data-testid="report-empty"
        />
      ) : (
        <>
          {tableLeads &&
            payload.tables.map((table) => (
              <Box key={`lead-${table.key}`}>
                <Heading as="h2" size="md" mb={3}>
                  {t(`reporting.shell.tables.${table.key}`, {
                    defaultValue: t("reporting.shell.tableHeading"),
                  })}
                </Heading>
                <ReportTable table={table} />
              </Box>
            ))}

          {payload.charts.map((chart) =>
            chart.suppressed ? (
              <CustomMessageBox
                key={chart.key}
                status={EFlashMessageStatus.warning}
                description={chart.suppressionReason ?? undefined}
              />
            ) : (
              <Box key={chart.key} borderWidth="1px" borderColor="border.light" borderRadius="md" p={4}>
                <Heading as="h2" size="md" mb={3}>
                  {t(`reporting.shell.charts.${chart.key}`, {
                    defaultValue: t("reporting.shell.chartHeading"),
                  })}
                </Heading>
                <ReportChart chart={chart} />
              </Box>
            )
          )}

          {!tableLeads &&
            payload.tables.map((table) => (
              <Box key={table.key}>
                <Heading as="h2" size="md" mb={3}>
                  {t(`reporting.shell.tables.${table.key}`, {
                    defaultValue: t("reporting.shell.tableHeading"),
                  })}
                </Heading>
                <ReportTable table={table} />
              </Box>
            ))}
        </>
      )}

      <ReportNotes notes={payload.notes} />
    </VStack>
  )
}

function formatHeadline(value: string | number | null, approximate: string | null) {
  if (value === null || value === undefined || value === "") return "—"

  const suffix = approximate ? ` ${approximate}` : ""
  if (typeof value !== "string" || !value.includes(" -> ")) return `${value}${suffix}`

  const parts = value.split(" -> ")
  if (parts.length !== 2) return `${value}${suffix}`

  return (
    <>
      {parts[0]}
      <Box as="span" display="inline-block" mx={1} verticalAlign="-0.15em" lineHeight={0}>
        <ArrowFatLinesRight size="0.85em" weight="fill" aria-hidden />
      </Box>
      {parts[1]}
      {suffix}
    </>
  )
}

const NOTE_GROUPS = [
  { kind: "definition", status: EFlashMessageStatus.info, titleKey: "reporting.shell.notesTitle" },
  { kind: "caveat", status: EFlashMessageStatus.warning, titleKey: "reporting.shell.caveatsTitle" },
  { kind: "not_measured", status: EFlashMessageStatus.warning, titleKey: "reporting.shell.notMeasuredTitle" },
] as const

function ReportNotes({ notes }: { notes: IReportNote[] }) {
  const { t } = useTranslation()
  if (notes.length === 0) return null

  return (
    <Stack spacing={3}>
      {NOTE_GROUPS.map((group) => {
        const items = notes.filter((note) => note.kind === group.kind)
        if (items.length === 0) return null
        return (
          <CustomMessageBox
            key={group.kind}
            status={group.status}
            title={t(group.titleKey)}
            description={items.map((note) => note.text).join("\n\n")}
          />
        )
      })}
    </Stack>
  )
}
