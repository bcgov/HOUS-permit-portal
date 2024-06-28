import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { EStepCodePrescriptiveValue, EZeroCarbonStep } from "../types/enums"

export const StepCodeZeroCarbonComplianceReportModel = types
  .model("StepCodeZeroCarbonComplianceReportModel", {
    proposedStep: types.maybeNull(types.enumeration<EZeroCarbonStep[]>(Object.values(EZeroCarbonStep))),
    requiredStep: types.maybeNull(types.enumeration<EZeroCarbonStep[]>(Object.values(EZeroCarbonStep))),
    minStep: types.maybeNull(types.enumeration<EZeroCarbonStep[]>(Object.values(EZeroCarbonStep))),
    maxStep: types.maybeNull(types.enumeration<EZeroCarbonStep[]>(Object.values(EZeroCarbonStep))),
    co2Passed: types.maybeNull(types.boolean),
    co2: types.maybeNull(types.string),
    co2Requirement: types.maybeNull(types.string),
    co2MaxRequirement: types.maybeNull(types.string),
    ghgPassed: types.maybeNull(types.boolean),
    totalGhg: types.maybeNull(types.string),
    totalGhgRequirement: types.maybeNull(types.string),
    prescriptivePassed: types.maybeNull(types.boolean),
    prescriptiveHeating: types.maybeNull(
      types.enumeration<EStepCodePrescriptiveValue[]>(Object.values(EStepCodePrescriptiveValue))
    ),
    prescriptiveHeatingRequirement: types.maybeNull(
      types.enumeration<EStepCodePrescriptiveValue[]>(Object.values(EStepCodePrescriptiveValue))
    ),
    prescriptiveHotWater: types.maybeNull(
      types.enumeration<EStepCodePrescriptiveValue[]>(Object.values(EStepCodePrescriptiveValue))
    ),
    prescriptiveHotWaterRequirement: types.maybeNull(
      types.enumeration<EStepCodePrescriptiveValue[]>(Object.values(EStepCodePrescriptiveValue))
    ),
    prescriptiveOther: types.maybeNull(
      types.enumeration<EStepCodePrescriptiveValue[]>(Object.values(EStepCodePrescriptiveValue))
    ),
    prescriptiveOtherRequirement: types.maybeNull(
      types.enumeration<EStepCodePrescriptiveValue[]>(Object.values(EStepCodePrescriptiveValue))
    ),
  })
  .extend(withEnvironment())
  .views((self) => ({
    get requirementsPassed() {
      return self.co2Passed && self.ghgPassed && self.prescriptivePassed
    },
    get numberOfSteps() {
      return parseInt(self.maxStep) - parseInt(self.minStep) + 1
    },
  }))

export interface IStepCodeZeroCarbonComplianceReport extends Instance<typeof StepCodeZeroCarbonComplianceReportModel> {}
