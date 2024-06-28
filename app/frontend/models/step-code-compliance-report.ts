import { Instance, types } from "mobx-state-tree"
import { StepCodeEnergyComplianceReportModel } from "./step-code-energy-compliance-report"
import { StepCodeZeroCarbonComplianceReportModel } from "./step-code-zero-carbon-compliance-report"

export const StepCodeComplianceReportModel = types.model("StepCodeComplianceReportModel", {
  requirementId: types.identifier,
  energy: StepCodeEnergyComplianceReportModel,
  zeroCarbon: StepCodeZeroCarbonComplianceReportModel,
})

export interface IStepCodeComplianceReport extends Instance<typeof StepCodeComplianceReportModel> {}
