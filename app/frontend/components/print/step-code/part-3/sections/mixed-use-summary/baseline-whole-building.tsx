import React from "react"
import { IPart3ComplianceReport } from "../../../../../../types/types"
import { ReportTable } from "../../../../components/report-table"
import { reportTranslation as t } from "../../../../components/report-translation"
import { complianceValue, numberValue } from "./table-values"
type Performance = IPart3ComplianceReport["performance"]
export const BaselineWholeBuildingPdf = ({
  requirements,
  compliance,
  adjustedResults,
}: {
  requirements: Performance["requirements"]
  compliance: Performance["complianceSummary"]
  adjustedResults: Performance["adjustedResults"]
}) => {
  const prefix = "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding"
  return (
    <ReportTable
      headers={[
        "",
        `${t("stepCode.part3.metrics.totalEnergy.label")} (${t("stepCode.part3.metrics.totalEnergy.units")})`,
      ]}
      rows={[
        [t(`${prefix}.requirements`), numberValue(requirements?.wholeBuilding?.totalEnergy)],
        [t(`${prefix}.performance`), numberValue(adjustedResults?.totalEnergy)],
        [t(`${prefix}.compliance`), complianceValue(compliance?.totalEnergy)],
      ]}
    />
  )
}
