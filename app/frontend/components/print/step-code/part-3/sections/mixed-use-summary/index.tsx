import * as R from "ramda"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportBlock, ReportPanel, ReportText } from "../../../../components/step-code-layout"
import { BaselineWholeBuildingPdf } from "./baseline-whole-building"
import { i18nPrefix } from "./i18n-prefix"
import { StepCodeOccupanciesPdf } from "./step-code-occupancies"
import { StepCodePortionsPdf } from "./step-code-portions"
import { StepCodeWholeBuildingPdf } from "./step-code-whole-building"
interface IProps {
  checklist: IPart3StepCodeChecklist
}
export const MixedUseSummary = function StepCodePart3ChecklistPDFMixedUseSummary({ checklist }: IProps) {
  const compliance = checklist.complianceReport?.performance?.complianceSummary
  const requirements = checklist.complianceReport?.performance?.requirements
  const adjustedResults = checklist.complianceReport?.performance?.adjustedResults
  if (!compliance || !requirements || !adjustedResults) {
    // Handle cases where compliance data might not be fully loaded/available
    return (
      <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
        <ReportText>Compliance data not available.</ReportText>
      </ReportPanel>
    )
  }
  const isBaseline = R.isEmpty(checklist.stepCodeOccupancies)
  return (
    <ReportPanel heading={isBaseline ? "Whole-building baseline summary" : t(`${i18nPrefix}.heading`)}>
      {/* Whole Building Performance Section */}
      <ReportBlock className="report-subsection">
        <ReportText className="report-subheading">
          {t("stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding.title")}
        </ReportText>
        {isBaseline ? (
          <BaselineWholeBuildingPdf
            requirements={requirements}
            compliance={compliance}
            adjustedResults={adjustedResults}
          />
        ) : (
          <StepCodeWholeBuildingPdf
            requirements={requirements}
            adjustedResults={adjustedResults}
            complianceSummary={compliance}
          />
        )}
      </ReportBlock>

      {/* Step Code Portions Performance Section (Conditional) */}
      {!R.isEmpty(checklist.stepCodeOccupancies) && (
        <ReportBlock className="report-subsection">
          <ReportText className="report-subheading">
            {t("stepCode.part3.stepCodeSummary.mixedUse.stepCode.title")}
          </ReportText>
          <StepCodePortionsPdf requirements={requirements} adjustedResults={adjustedResults} compliance={compliance} />
        </ReportBlock>
      )}

      {/* Step Code Occupancies Performance Section */}
      <ReportBlock className="report-subsection">
        <ReportText className="report-subheading">
          {isBaseline ? "Baseline occupancies" : t("stepCode.part3.stepCodeSummary.mixedUse.occupancies.title")}
        </ReportText>
        <StepCodeOccupanciesPdf checklist={checklist} />
      </ReportBlock>
    </ReportPanel>
  )
}
