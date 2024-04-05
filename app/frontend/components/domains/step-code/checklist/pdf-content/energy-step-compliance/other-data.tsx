import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../styles/theme"
import { i18nPrefix } from "../../energy-step-code-compliance/i18n-prefix"
import { GridItem } from "../shared/grid-item"
import { HStack } from "../shared/h-stack"
import { VStack } from "../shared/v-stack"

interface IProps {
  checklist: IStepCodeChecklist
}
export function OtherData({ checklist }: IProps) {
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

      <Row label={t(`${i18nPrefix}.otherData.software`)} value={checklist.softwareName} />
      <Row label={t(`${i18nPrefix}.otherData.softwareVersion`)} value={checklist.softwareVersion} />
      <Row label={t(`${i18nPrefix}.otherData.heatedFloorArea`)} value={checklist.totalHeatedFloorArea} />
      <Row label={t(`${i18nPrefix}.otherData.volume`)} value={checklist.volume} />
      <Row label={t(`${i18nPrefix}.otherData.surfaceArea`)} value={checklist.surfaceArea} />
      <Row label={t(`${i18nPrefix}.otherData.fwdr`)} value={checklist.fwdr} />
      <Row label={t(`${i18nPrefix}.otherData.climateLocation`)} value={checklist.location} />
      <Row label={t(`${i18nPrefix}.otherData.hdd`)} value={checklist.heatingDegreeDays} />
      <Row label={t(`${i18nPrefix}.otherData.spaceCooled`)} value={checklist.conditionedPercent} isLast />
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
