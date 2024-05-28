import { Instance, types } from "mobx-state-tree"
import { ENumberUnit, ERequirementType } from "../types/enums"
import { IFormIORequirement, IOption, IRequirementOptions, TComputedCompliance, TConditional } from "../types/types"

export const RequirementModel = types
  .model("RequirementModel", {
    id: types.identifier,
    label: types.string,
    requirementCode: types.string,
    hint: types.maybeNull(types.string),
    formJson: types.maybeNull(types.frozen<IFormIORequirement>()),
    inputType: types.enumeration<ERequirementType[]>(Object.values(ERequirementType)),
    inputOptions: types.frozen<IRequirementOptions>({}),
    diffSectionLabel: types.maybeNull(types.string),
    elective: types.boolean,
    required: types.boolean,
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .views((self) => ({
    get valueOptions(): IOption[] | undefined {
      return self.inputOptions?.valueOptions
    },
    get numberUnit(): ENumberUnit | undefined {
      return self.inputOptions?.numberUnit
    },
    get conditional(): TConditional | undefined {
      return self.inputOptions?.conditional
    },
    get computedCompliance(): TComputedCompliance | undefined {
      return self.inputOptions?.computedCompliance
    },
    get dataValidation(): Object | undefined {
      return self.inputOptions?.dataValidation
    },
  }))

export interface IRequirement extends Instance<typeof RequirementModel> {}
