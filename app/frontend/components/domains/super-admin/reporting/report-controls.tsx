import { Button, Flex, FormControl, FormLabel, HStack, Select, Spinner, Text, Wrap, WrapItem } from "@chakra-ui/react"
import { ArrowsClockwise, DownloadSimple } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { TReportRangePreset } from "../../../../types/report"

interface IProps {
  reportKey: string
}

export const ReportControls = observer(({ reportKey }: IProps) => {
  const { t } = useTranslation()
  const { reportStore } = useMst()
  const { rangePreset, setRangePreset, rangePresets, isRefreshing, currentPayload, refreshReport, downloadExport } =
    reportStore

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      align={{ base: "stretch", md: "flex-end" }}
      gap={4}
      w="full"
      wrap="wrap"
    >
      <FormControl maxW={{ base: "full", md: "240px" }}>
        <FormLabel htmlFor="report-range">{t("reporting.controls.range")}</FormLabel>
        <Select
          id="report-range"
          value={rangePreset}
          onChange={(e) => setRangePreset(e.target.value as TReportRangePreset)}
          bg="white"
        >
          {rangePresets.map((preset) => (
            <option key={preset} value={preset}>
              {t(`reporting.controls.ranges.${preset}`)}
            </option>
          ))}
        </Select>
      </FormControl>
      <Wrap spacing={3} align="center">
        <WrapItem>
          <Text fontSize="sm" color="text.secondary">
            {t("reporting.controls.dataAsOf")}{" "}
            {currentPayload?.computedAt ? formatTimestamp(currentPayload.computedAt) : "—"}
          </Text>
        </WrapItem>
        <WrapItem>
          <HStack>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={isRefreshing ? <Spinner size="sm" /> : <ArrowsClockwise />}
              onClick={() => refreshReport(reportKey)}
              isDisabled={isRefreshing}
            >
              {isRefreshing ? t("reporting.controls.refreshing") : t("reporting.controls.refresh")}
            </Button>
            <Button size="sm" variant="primary" leftIcon={<DownloadSimple />} onClick={() => downloadExport(reportKey)}>
              {t("reporting.controls.exportCsv")}
            </Button>
          </HStack>
        </WrapItem>
      </Wrap>
    </Flex>
  )
})

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return format(date, "d MMM yyyy, HH:mm")
}
