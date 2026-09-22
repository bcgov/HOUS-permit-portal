import React from "react"
import { IPart3ComplianceReport } from "../../../../../../types/types"
import { ReportTable } from "../../../../components/report-table"
import { reportTranslation as t } from "../../../../components/report-translation"
import { complianceValue, numberValue } from "./table-values"
type Performance = IPart3ComplianceReport["performance"]
export const StepCodeWholeBuildingPdf = ({
  requirements,
  adjustedResults,
  complianceSummary,
}: {
  requirements: Performance["requirements"]
  adjustedResults: Performance["adjustedResults"]
  complianceSummary: Performance["complianceSummary"]
}) => {
  const prefix = "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding"
  return (
    <ReportTable
      headers={[
        "",
        <>
          TEUI
          <br />
          kWh/m²/year
        </>,
        <>
          TEDI
          <br />
          kWh/m²/year
        </>,
        <>
          GHGI
          <br />
          kgCO₂/m²/year
        </>,
      ]}
      rows={[
        [
          t(`${prefix}.requirements`),
          numberValue(requirements?.wholeBuilding?.teui),
          numberValue(requirements?.wholeBuilding?.tedi),
          numberValue(requirements?.wholeBuilding?.ghgi),
        ],
        [
          t(`${prefix}.performance`),
          numberValue(adjustedResults?.teui),
          numberValue(adjustedResults?.tedi?.wholeBuilding),
          numberValue(adjustedResults?.ghgi),
        ],
        [
          t(`${prefix}.compliance`),
          complianceValue(complianceSummary?.teui),
          complianceValue(complianceSummary?.tedi?.wholeBuilding),
          requirements?.wholeBuilding?.ghgi == null ? "Not applicable" : complianceValue(complianceSummary?.ghgi),
        ],
      ]}
    />
  )
}
