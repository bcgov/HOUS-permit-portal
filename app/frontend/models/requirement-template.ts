import { Instance, types } from "mobx-state-tree"
import { ERequirementTemplateStatus } from "../types/enums"
import { IActivity, IPermitType } from "./permit-classification"

export const RequirementTemplateModel = types.model("RequirementTemplateModel", {
  id: types.identifier,
  status: types.enumeration(Object.values(ERequirementTemplateStatus)),
  description: types.maybeNull(types.string),
  version: types.maybeNull(types.string),
  jurisdictionsSize: types.optional(types.number, 0),
  permitType: types.frozen<IPermitType>(),
  activity: types.frozen<IActivity>(),
  formJson: types.frozen<IRequirementTemplateFormJson>(),
  scheduledFor: types.maybeNull(types.Date),
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IRequirementTemplate extends Instance<typeof RequirementTemplateModel> {}

export interface IRequirementTemplateFormJson {
  id: string
  legend: string
  key: string
  label: string
  input: boolean
  tableView: boolean
  components: any[] // Todo: define component type
}
