import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportBlock, ReportMetric, ReportPanel, ReportText } from "../../../../components/step-code-layout"
import { BaselineEnergyPdf } from "./baseline-energy"
import { BaselineZeroCarbonPdf } from "./baseline-zero-carbon"
import { i18nPrefix } from "./i18n-prefix"
import { MixedUseEnergyPdf } from "./mixed-use-energy"
import { MixedUseZeroCarbonPdf } from "./mixed-use-zero-carbon"
import { StepCodeEnergyPdf } from "./step-code-energy"
import { StepCodeZeroCarbonPdf } from "./step-code-zero-carbon"
interface IProps {
  checklist: IPart3StepCodeChecklist
}
export const StepCodePerformanceSummary = function StepCodePart3ChecklistPDFStepCodePerformanceSummary({
  checklist,
}: IProps) {
  const stepCodeOccs = Array.isArray(checklist?.stepCodeOccupancies) ? checklist.stepCodeOccupancies : []
  const baselineOccs = Array.isArray(checklist?.baselineOccupancies) ? checklist.baselineOccupancies : []
  if (!stepCodeOccs.length && !baselineOccs.length)
    return (
      <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
        <ReportMetric
          label={t(`${i18nPrefix}.compliancePath`)}
          value={t(`stepCode.part3.projectDetails.buildingCodeVersions.${checklist.buildingCodeVersion}`)}
        />
        <p>No occupancy data is saved for this checklist.</p>
      </ReportPanel>
    )
  const isMixedUse = stepCodeOccs.length + baselineOccs.length > 1
  const isBaseline = stepCodeOccs.length === 0
  let occupancyName: string
  if (!isMixedUse) {
    if (isBaseline) {
      occupancyName = t(`stepCode.part3.baselineOccupancyKeys.${baselineOccs?.[0]?.key}`)
    } else {
      occupancyName = t(`stepCode.part3.stepCodeOccupancyKeys.${stepCodeOccs?.[0]?.key}`)
    }
  }
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ReportMetric
        label={t(`${i18nPrefix}.compliancePath`)}
        value={t(`stepCode.part3.projectDetails.buildingCodeVersions.${checklist.buildingCodeVersion}`)}
      />
      <ReportMetric
        label={t(`${i18nPrefix}.stepCodeOccupancy.label`)}
        value={occupancyName || t(`${i18nPrefix}.stepCodeOccupancy.mixedUse`)}
      />

      {/* Performance Details - Mimic HStack */}
      <ReportBlock className="report-columns">
        {/* Energy Column */}
        <ReportBlock className="report-summary">
          <ReportText className="report-subheading">{t(`${i18nPrefix}.energy.title`)}</ReportText>
          {isBaseline ? (
            <BaselineEnergyPdf checklist={checklist} />
          ) : isMixedUse ? (
            <MixedUseEnergyPdf />
          ) : (
            <StepCodeEnergyPdf checklist={checklist} />
          )}
        </ReportBlock>

        {/* Zero Carbon Column */}
        <ReportBlock className="report-summary">
          <ReportText className="report-subheading">{t(`${i18nPrefix}.zeroCarbon.title`)}</ReportText>
          {isBaseline ? (
            <BaselineZeroCarbonPdf />
          ) : isMixedUse ? (
            <MixedUseZeroCarbonPdf />
          ) : (
            <StepCodeZeroCarbonPdf checklist={checklist} />
          )}
        </ReportBlock>
      </ReportBlock>
    </ReportPanel>
  )
}
