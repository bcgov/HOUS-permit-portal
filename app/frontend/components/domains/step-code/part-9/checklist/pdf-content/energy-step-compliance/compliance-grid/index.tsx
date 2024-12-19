import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../../models/step-code-energy-compliance-report"
import { theme } from "../../../../../../../../styles/theme"
import { GridItem } from "../../../../../step-generic/pdf-content/shared/grid-item"
import { HStack } from "../../../../../step-generic/pdf-content/shared/h-stack"
import { RequirementsMetTag } from "../../../../../step-generic/pdf-content/shared/requirements-met-tag"
import { VStack } from "../../../../../step-generic/pdf-content/shared/v-stack"
import { i18nPrefix } from "../../../energy-step-code-compliance/i18n-prefix"
import { Airtightness } from "./airtightness"
import { EnergyStep } from "./energy-step"
import { MEUI } from "./meui"
import { TEDI } from "./tedi"

interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export const EnergyComplianceGrid = function EnergyComplianceGrid({ report }: IProps) {
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
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.proposedMetrics`)}</Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.requirement`)}</Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.results`)}</Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center", borderRightWidth: 0 }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.passFail`)}</Text>
        </GridItem>
      </HStack>

      <EnergyStep report={report} />
      <MEUI report={report} />
      <TEDI report={report} />
      <Airtightness report={report} />

      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          gap: 0,
        }}
      >
        <GridItem style={{ flexBasis: "75%", minWidth: "75%" }}>
          <Text style={{ fontWeight: 700, fontSize: 10.5 }}>{t(`${i18nPrefix}.requirementsMet`)}</Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", justifyContent: "center" }}>
          <RequirementsMetTag success={report.meuiPassed && report.tediPassed && report.airtightnessPassed} />
        </GridItem>
      </HStack>
    </VStack>
  )
}
