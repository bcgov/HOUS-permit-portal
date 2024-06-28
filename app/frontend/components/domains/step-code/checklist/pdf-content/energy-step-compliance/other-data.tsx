import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../models/step-code-energy-compliance-report"
import { theme } from "../../../../../../styles/theme"
import { i18nPrefix } from "../../energy-step-code-compliance/i18n-prefix"
import { GridItem } from "../shared/grid-item"
import { HStack } from "../shared/h-stack"
import { VStack } from "../shared/v-stack"

interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export function OtherData({ report }: IProps) {
  return (
    <VStack style={{ width: "100%", borderWidth: 0.75, borderColor: theme.colors.border.light, gap: 0 }} wrap={false}>
      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          backgroundColor: theme.colors.greys.grey03,
          borderBottomWidth: 0.75,
          borderColor: theme.colors.border.light,
          gap: 0,
        }}
      >
        <GridItem style={{ flexBasis: "100%", minWidth: "100%" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.otherData.header`)}</Text>
        </GridItem>
      </HStack>

      <Row label={t(`${i18nPrefix}.otherData.software`)} value={report.softwareName} />
      <Row label={t(`${i18nPrefix}.otherData.softwareVersion`)} value={report.softwareVersion} />
      <Row label={t(`${i18nPrefix}.otherData.heatedFloorArea`)} value={report.totalHeatedFloorArea} />
      <Row label={t(`${i18nPrefix}.otherData.volume`)} value={report.volume} />
      <Row label={t(`${i18nPrefix}.otherData.surfaceArea`)} value={report.surfaceArea} />
      <Row label={t(`${i18nPrefix}.otherData.fwdr`)} value={report.fwdr} />
      <Row label={t(`${i18nPrefix}.otherData.climateLocation`)} value={report.location} />
      <Row label={t(`${i18nPrefix}.otherData.hdd`)} value={report.heatingDegreeDays} />
      <Row label={t(`${i18nPrefix}.otherData.spaceCooled`)} value={report.conditionedPercent} isLast />
    </VStack>
  )
}

function Row({ label, value, isLast = false }) {
  return (
    <HStack
      style={{
        width: "100%",
        alignItems: "stretch",
        borderBottomWidth: isLast ? 0 : 0.75,
        borderColor: theme.colors.border.light,
        gap: 0,
      }}
    >
      <GridItem style={{ flexBasis: "50%", minWidth: "50%" }}>
        <Text style={{ fontSize: 10.5 }}>{label}</Text>
      </GridItem>
      <GridItem style={{ flexBasis: "50%", minWidth: "50%" }}>
        <Text style={{ fontSize: 10.5 }}>{value}</Text>
      </GridItem>
    </HStack>
  )
}
