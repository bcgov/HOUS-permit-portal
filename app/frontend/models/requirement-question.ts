import { applySnapshot, flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IRequirementQuestionParams } from "../types/api-request"
import { ERequirementType } from "../types/enums"

export const RequirementQuestionModel = types
  .model("RequirementQuestionModel", {
    id: types.identifier,
    name: types.maybeNull(types.string),
    description: types.maybeNull(types.string),
    label: types.string,
    inputType: types.enumeration(Object.values(ERequirementType)),
    hint: types.maybeNull(types.string),
    instructions: types.maybeNull(types.string),
    requirementCode: types.string,
    associations: types.array(types.string),
    inputOptions: types.frozen(),
    usageCount: types.optional(types.number, 0),
    hasDataValidation: types.optional(types.boolean, false),
    hasAutomatedCompliance: types.optional(types.boolean, false),
    requirementBlocks: types.optional(types.array(types.frozen<{ id: string; name: string }>()), []),
    createdAt: types.Date,
    updatedAt: types.Date,
    discardedAt: types.maybeNull(types.Date),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get isDiscarded() {
      return !!self.discardedAt
    },
  }))
  .actions((self) => ({
    update: flow(function* (params: IRequirementQuestionParams) {
      const response = yield* toGenerator(self.environment.api.updateRequirementQuestion(self.id, params))
      if (response.ok) {
        applySnapshot(self, response.data.data)
      }
      return response.ok
    }),
    destroy: flow(function* () {
      const response = yield self.environment.api.archiveRequirementQuestion(self.id)
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
    restore: flow(function* () {
      const response = yield self.environment.api.restoreRequirementQuestion(self.id)
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
  }))

export interface IRequirementQuestion extends Instance<typeof RequirementQuestionModel> {}
