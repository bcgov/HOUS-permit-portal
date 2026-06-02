import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { RequirementQuestionModel } from "../models/requirement-question"
import { IRequirementQuestionParams } from "../types/api-request"
import { ERequirementLibrarySortFields } from "../types/enums"

export const RequirementQuestionStoreModel = types
  .compose(
    types.model("RequirementQuestionStoreModel").props({
      requirementQuestionMap: types.map(RequirementQuestionModel),
      tableRequirementQuestions: types.array(types.safeReference(RequirementQuestionModel)),
    }),
    createSearchModel<ERequirementLibrarySortFields>("fetchRequirementQuestions")
  )
  .extend(withEnvironment())
  .extend(withMerge())
  .views((self) => ({
    getRequirementQuestionById(id: string) {
      return self.requirementQuestionMap.get(id)
    },
  }))
  .actions((self) => ({
    fetchRequirementQuestions: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementQuestions({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          showArchived: self.showArchived,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "requirementQuestionMap")
        self.tableRequirementQuestions = cast(response.data.data.map((question) => question.id))
        self.setPageFields(response.data.meta, opts)
      }
      return response.ok
    }),
    createRequirementQuestion: flow(function* (params: IRequirementQuestionParams) {
      const response = yield* toGenerator(self.environment.api.createRequirementQuestion(params))

      if (response.ok) {
        self.requirementQuestionMap.put(response.data.data)
        yield self.fetchRequirementQuestions()
      }

      return response.ok
    }),
    updateRequirementQuestion: flow(function* (id: string, params: Partial<IRequirementQuestionParams>) {
      const response = yield* toGenerator(self.environment.api.updateRequirementQuestion(id, params))

      if (response.ok) {
        self.requirementQuestionMap.put(response.data.data)
        yield self.fetchRequirementQuestions()
      }

      return response.ok
    }),
    archiveRequirementQuestion: flow(function* (id: string) {
      const response = yield* toGenerator(self.environment.api.archiveRequirementQuestion(id))

      if (response.ok) {
        self.requirementQuestionMap.put(response.data.data)
        yield self.fetchRequirementQuestions()
      }

      return response.ok
    }),
    restoreRequirementQuestion: flow(function* (id: string) {
      const response = yield* toGenerator(self.environment.api.restoreRequirementQuestion(id))

      if (response.ok) {
        self.requirementQuestionMap.put(response.data.data)
        yield self.fetchRequirementQuestions()
      }

      return response.ok
    }),
  }))

export interface IRequirementQuestionStoreModel extends Instance<typeof RequirementQuestionStoreModel> {}
