import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { EEnergyStep, EStepCodeType, EZeroCarbonStep } from "../types/enums"
import { Part3StepCodeChecklistModel } from "./part-3-step-code-checklist"
import { StepCodeBaseFields } from "./step-code-base"

export const Part3StepCodeModel = types
  .compose(
    "Part3StepCodeModel",
    StepCodeBaseFields,
    types.model({
      id: types.identifier,
      type: types.literal(EStepCodeType.part3StepCode),
      checklist: types.maybeNull(types.late(() => Part3StepCodeChecklistModel)),
      zeroCarbonSteps: types.array(types.enumeration(Object.values(EZeroCarbonStep))),
      energySteps: types.array(types.enumeration(Object.values(EEnergyStep))),
    })
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get primaryChecklist() {
      return self.checklist
    },
    get checklistForPdf() {
      return self.checklist
    },
    get isComplete() {
      return self.checklist?.isAllComplete
    },
  }))
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IPart3StepCode extends Instance<typeof Part3StepCodeModel> {}
