import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../../models/step-code-zero-carbon-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/zero-carbon-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { GridItem, HStack, ReportGrid, RequirementsMetTag, Text } from "../../../../../components/step-code-primitives"
import { CO2 } from "./co2"
import { Prescriptive } from "./prescriptive"
import { TotalGHG } from "./total-ghg"
import { ZeroCarbonStep } from "./zero-carbon-step"

interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}

export const ZeroCarbonComplianceGrid = function ZeroCarbonComplianceGrid({ report }: IProps) {
  return (
    <ReportGrid
      headers={[
        t(`${i18nPrefix}.proposedMetrics`),
        t(`${i18nPrefix}.stepRequirement`),
        t(`${i18nPrefix}.result`),
        t(`${i18nPrefix}.passFail`),
      ]}
    >
      <ZeroCarbonStep report={report} />
      <TotalGHG report={report} />
      <CO2 report={report} />
      <Prescriptive report={report} />

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
          <RequirementsMetTag success={report.co2Passed && report.ghgPassed && report.prescriptivePassed} />
        </GridItem>
      </HStack>
    </ReportGrid>
  )
}
