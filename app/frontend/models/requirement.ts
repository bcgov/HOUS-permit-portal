import { Instance, types } from "mobx-state-tree"
import { ENumberUnit, ERequirementType } from "../types/enums"
import { IOption, IRequirementOptions } from "../types/types"

export const RequirementModel = types
  .model("RequirementModel", {
    id: types.identifier,
    label: types.string,
    hint: types.maybeNull(types.string),
    inputType: types.enumeration<ERequirementType[]>(Object.values(ERequirementType)),
    inputOptions: types.frozen<IRequirementOptions>({}),
    elective: types.boolean,
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
  }))

export interface IRequirement extends Instance<typeof RequirementModel> {}
