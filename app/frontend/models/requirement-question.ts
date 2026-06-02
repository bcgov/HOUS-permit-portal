import { Instance, types } from "mobx-state-tree"
import { ERequirementType } from "../types/enums"
import { IRequirementOptions } from "../types/types"

export const RequirementQuestionModel = types.model("RequirementQuestionModel", {
  id: types.identifier,
  requirementCode: types.string,
  label: types.string,
  inputType: types.enumeration<ERequirementType[]>(Object.values(ERequirementType)),
  inputOptions: types.frozen<IRequirementOptions>({}),
  hint: types.maybeNull(types.string),
  instructions: types.maybeNull(types.string),
  shared: types.optional(types.boolean, false),
  discardedAt: types.maybeNull(types.Date),
  usageCount: types.optional(types.number, 0),
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IRequirementQuestion extends Instance<typeof RequirementQuestionModel> {}
