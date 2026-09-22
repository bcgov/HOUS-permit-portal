import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../models/step-code-energy-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/energy-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { GridItem, HStack, ReportGrid, RequirementsMetTag, Text } from "../../../../../components/step-code-primitives"
import { Airtightness } from "./airtightness"
import { EnergyStep } from "./energy-step"
import { MEUI } from "./meui"
import { TEDI } from "./tedi"

interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export const EnergyComplianceGrid = function EnergyComplianceGrid({ report }: IProps) {
  return (
    <ReportGrid
      headers={[
        t(`${i18nPrefix}.proposedMetrics`),
        t(`${i18nPrefix}.requirement`),
        t(`${i18nPrefix}.results`),
        t(`${i18nPrefix}.passFail`),
      ]}
    >
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
    </ReportGrid>
  )
}
