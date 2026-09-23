import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/compliance-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import {
  ReportBlock,
  ReportDivider,
  ReportMetric,
  ReportPanel,
  ReportText,
  ReportValue,
} from "../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const ComplianceSummary = function StepCodeChecklistPDFComplianceSummary({ checklist }: IProps) {
  const report = checklist.selectedReport
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ReportMetric
        label={t("stepCodeChecklist.edit.projectInfo.dwellingUnits")}
        value={checklist.dwellingUnitsCount}
      />
      <ReportMetric
        label={t(`${i18nPrefix}.compliancePath.label`)}
        value={t(`${i18nPrefix}.compliancePath.options.${checklist.compliancePath}`)}
      />
      <ReportBlock className="report-columns">
        <ComplianceBox
          heading={t(`${i18nPrefix}.energyStepCode.heading`)}
          stepRequiredLabel={t(`${i18nPrefix}.energyStepCode.stepRequired`) + ": "}
          stepRequired={report?.energy?.requiredStep}
          stepProposedLabel={t(`${i18nPrefix}.energyStepCode.stepProposed`) + ": "}
          stepProposed={report?.energy?.proposedStep}
        />

        <ComplianceBox
          heading={t(`${i18nPrefix}.zeroCarbonStepCode.heading`)}
          stepRequiredLabel={t(`${i18nPrefix}.zeroCarbonStepCode.stepRequired`) + ": "}
          stepRequired={report?.zeroCarbon?.requiredStep}
          stepProposedLabel={t(`${i18nPrefix}.zeroCarbonStepCode.stepProposed`) + ": "}
          stepProposed={report?.zeroCarbon?.proposedStep}
        />
      </ReportBlock>

      <ReportDivider />

      {(checklist.planAuthor || checklist.planVersion || checklist.planDate) && (
        <ReportBlock className="report-keep">
          <ReportText className="report-strong">{t(`${i18nPrefix}.planInfo.title`)}</ReportText>
          <ReportBlock className="report-columns">
            <ReportMetric label={t(`${i18nPrefix}.planInfo.author`)} value={checklist.planAuthor} />
            <ReportMetric label={t(`${i18nPrefix}.planInfo.version`)} value={checklist.planVersion} />
            <ReportMetric label={t(`${i18nPrefix}.planInfo.date`)} value={checklist.planDate} />
          </ReportBlock>
        </ReportBlock>
      )}
    </ReportPanel>
  )
}
function ComplianceBox({ heading, stepRequired, stepRequiredLabel, stepProposed, stepProposedLabel }) {
  return (
    <ReportBlock>
      <ReportText className="report-strong">{heading}</ReportText>
      <ReportBlock>
        <ReportText>{stepRequiredLabel}</ReportText>
        <ReportBlock className="report-strong">
          <ReportText>{stepRequired}</ReportText>
        </ReportBlock>
      </ReportBlock>

      <ReportBlock>
        <ReportText>{stepProposedLabel}</ReportText>
        <ReportValue value={stepProposed} />
      </ReportBlock>
    </ReportBlock>
  )
}
