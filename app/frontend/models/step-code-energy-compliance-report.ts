import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { EEnergyStep } from "../types/enums"

export const StepCodeEnergyComplianceReportModel = types
  .model("StepCodeEnergyComplianceReportModel", {
    dwellingUnitsCount: types.maybeNull(types.number),
    proposedStep: types.maybeNull(types.enumeration<EEnergyStep[]>(Object.values(EEnergyStep))),
    requiredStep: types.maybeNull(types.enumeration<EEnergyStep[]>(Object.values(EEnergyStep))),
    minStep: types.maybeNull(types.enumeration<EEnergyStep[]>(Object.values(EEnergyStep))),
    maxStep: types.maybeNull(types.enumeration<EEnergyStep[]>(Object.values(EEnergyStep))),
    meuiPassed: types.maybeNull(types.boolean),
    meui: types.maybeNull(types.string),
    meuiRequirement: types.maybeNull(types.string),
    meuiPercentImprovement: types.maybeNull(types.string),
    meuiPercentImprovementRequirement: types.maybeNull(types.string),
    conditionedPercent: types.maybeNull(types.string),
    energyTarget: types.maybeNull(types.string),
    refEnergyTarget: types.maybeNull(types.string),
    tediPassed: types.maybeNull(types.boolean),
    tedi: types.maybeNull(types.string),
    tediRequirement: types.maybeNull(types.string),
    tediHlrPercent: types.maybeNull(types.string),
    tediHlrPercentRequired: types.maybeNull(types.string),
    airtightnessPassed: types.maybeNull(types.boolean),
    ach: types.maybeNull(types.string),
    achRequirement: types.maybeNull(types.string),
    nla: types.maybeNull(types.string),
    nlaRequirement: types.maybeNull(types.string),
    nlr: types.maybeNull(types.string),
    nlrRequirement: types.maybeNull(types.string),
    surfaceArea: types.maybeNull(types.string),
    volume: types.maybeNull(types.string),
    totalHeatedFloorArea: types.maybeNull(types.string),
    fwdr: types.maybeNull(types.string),
    location: types.maybeNull(types.string),
    heatingDegreeDays: types.maybeNull(types.string),
    softwareName: types.maybeNull(types.string),
    softwareVersion: types.maybeNull(types.string),
  })
  .extend(withEnvironment())
  .views((self) => ({
    get requirementsPassed() {
      return self.meuiPassed && self.tediPassed && self.airtightnessPassed
    },
    get numberOfSteps() {
      return parseInt(self.maxStep) - parseInt(self.minStep) + 1
    },
  }))

export interface IStepCodeEnergyComplianceReport extends Instance<typeof StepCodeEnergyComplianceReportModel> {}
