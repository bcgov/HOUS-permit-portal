import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { RequirementQuestionModel } from "../models/requirement-question"
import { IRequirementQuestionParams } from "../types/api-request"
import { EQuestionBankSortFields, ETagType } from "../types/enums"

export const RequirementQuestionStoreModel = types
  .compose(
    types.model("RequirementQuestionStoreModel").props({
      requirementQuestionMap: types.map(RequirementQuestionModel),
      tableRequirementQuestions: types.array(types.safeReference(RequirementQuestionModel)),
    }),
    createSearchModel<EQuestionBankSortFields>("fetchRequirementQuestions")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getRequirementQuestionById(id: string) {
      return self.requirementQuestionMap.get(id)
    },
    getSortColumnHeader(field: EQuestionBankSortFields) {
      switch (field) {
        case EQuestionBankSortFields.name:
          return t("questionBank.fields.name")
        case EQuestionBankSortFields.associations:
          return t("questionBank.fields.associations")
        case EQuestionBankSortFields.updatedAt:
          return t("questionBank.fields.updatedAt")
      }
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
  }))
  .actions((self) => ({
    createRequirementQuestion: flow(function* (params: IRequirementQuestionParams) {
      const response = yield* toGenerator(self.environment.api.createRequirementQuestion(params))

      if (response.ok) {
        self.requirementQuestionMap.put(response.data.data)
        yield self.fetchRequirementQuestions()
      }

      return response.ok
    }),
    fetchRequirementQuestion: flow(function* (id: string) {
      const existing = self.getRequirementQuestionById(id)
      if (existing) return existing

      const response = yield* toGenerator(self.environment.api.fetchRequirementQuestion(id))
      if (response.ok) {
        self.requirementQuestionMap.put(response.data.data)
        return self.getRequirementQuestionById(id)
      }
      return undefined
    }),
    searchAssociations: flow(function* (query: string) {
      const response = yield* toGenerator(
        self.environment.api.searchTags({
          query,
          taggableTypes: [ETagType.requirementBlock, ETagType.requirementQuestion],
        })
      )

      if (response.ok) {
        return response.data
      }

      return []
    }),
  }))

export interface IRequirementQuestionStoreModel extends Instance<typeof RequirementQuestionStoreModel> {}
