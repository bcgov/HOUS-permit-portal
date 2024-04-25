import { applySnapshot, flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IRequirementBlockParams } from "../types/api-request"
import { RequirementModel } from "./requirement"

export const RequirementBlockModel = types
  .model("RequirementBlockModel", {
    id: types.identifier,
    name: types.string,
    displayName: types.string,
    requirements: types.array(RequirementModel),
    associations: types.array(types.string),
    description: types.maybeNull(types.string),
    displayDescription: types.maybeNull(types.string),
    sku: types.string,
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    hasRequirement(id: string) {
      return self.requirements.findIndex((requirement) => requirement.id === id) !== -1
    },
    get hasAnyElective() {
      return self.requirements.some((requirement) => requirement.elective)
    },
    get hasAnyConditional() {
      return self.requirements.some((requirement) => !!requirement.conditional)
    },
    get hasAnyDataValidation() {
      return self.requirements.some((requirement) => !!requirement.dataValidation)
    },
  }))
  .actions((self) => ({
    update: flow(function* (requirementParams: IRequirementBlockParams) {
      const response = yield* toGenerator(self.environment.api.updateRequirementBlock(self.id, requirementParams))

      if (response.ok) {
        applySnapshot(self, response.data.data)
      }

      return response.ok
    }),
  }))

export interface IRequirementBlock extends Instance<typeof RequirementBlockModel> {}
