import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { ERequirementTemplateStatus } from "../types/enums"
import { IActivity, IPermitType } from "./permit-classification"

export const RequirementTemplateModel = types
  .model("RequirementTemplateModel", {
    id: types.identifier,
    status: types.enumeration(Object.values(ERequirementTemplateStatus)),
    description: types.maybeNull(types.string),
    version: types.maybeNull(types.string),
    jurisdictionsSize: types.optional(types.number, 0),
    permitType: types.frozen<IPermitType>(),
    activity: types.frozen<IActivity>(),
    formJson: types.frozen<IRequirementTemplateFormJson>(),
    scheduledFor: types.maybeNull(types.Date),
    discardedAt: types.maybeNull(types.Date),
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({
    get isDiscarded() {
      return self.discardedAt !== null
    },
  }))
  .actions((self) => ({
    destroy: flow(function* () {
      const response = yield self.environment.api.destroyRequirementTemplate(self.id)
      return response.ok
    }),
    restore: flow(function* () {
      const response = yield self.environment.api.restoreRequirementTemplate(self.id)
      return response.ok
    }),
  }))

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
