import React from "react"
import { IPart3ComplianceReport } from "../../../../../../types/types"
import { ReportTable } from "../../../../components/report-table"
import { reportTranslation as t } from "../../../../components/report-translation"
import { complianceValue, numberValue } from "./table-values"
type Performance = IPart3ComplianceReport["performance"]
export const StepCodePortionsPdf = ({
  requirements,
  adjustedResults,
  compliance,
}: {
  requirements: Performance["requirements"]
  adjustedResults: Performance["adjustedResults"]
  compliance: Performance["complianceSummary"]
}) => {
  const prefix = "stepCode.part3.stepCodeSummary.mixedUse.stepCode"
  return (
    <ReportTable
      layout="metrics"
      headers={["", "TEUI", "TEDI", "GHGI"]}
      rows={[
        [t(`${prefix}.requirement`), "—", numberValue(requirements?.stepCodePortions?.areaWeightedTotals?.tedi), "—"],
        [t(`${prefix}.performance`), "—", numberValue(adjustedResults?.tedi?.stepCodePortion), "—"],
        [t(`${prefix}.compliance`), "—", complianceValue(compliance?.tedi?.stepCodePortion), "—"],
      ]}
    />
  )
}
