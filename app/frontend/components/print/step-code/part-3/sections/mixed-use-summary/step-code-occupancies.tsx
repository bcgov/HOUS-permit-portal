import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { ReportTable } from "../../../../components/report-table"
import { reportTranslation as t } from "../../../../components/report-translation"
const prefix = "stepCode.part3.stepCodeSummary.mixedUse.occupancies"
export const StepCodeOccupanciesPdf = ({ checklist }: { checklist: IPart3StepCodeChecklist }) => (
  <ReportTable
    headers={[t(`${prefix}.occupancy`), t(`${prefix}.energy`), t(`${prefix}.ghgi`)]}
    rows={[
      ...(checklist.stepCodeOccupancies || []).map((oc) => [
        t(`stepCode.part3.stepCodeOccupancyKeys.${oc.key}`),
        t(`stepCodeChecklist.edit.codeComplianceSummary.energyStepCode.steps.${oc.energyStepRequired}`),
        t(`stepCodeChecklist.edit.codeComplianceSummary.zeroCarbonStepCode.steps.${oc.zeroCarbonStepRequired}`),
      ]),
      ...(checklist.baselineOccupancies || []).map((oc) => [
        t(`stepCode.part3.baselineOccupancyKeys.${oc.key}`),
        t(`stepCode.part3.performanceRequirements.${oc.performanceRequirement}`),
        "Not applicable",
      ]),
    ]}
  />
)
