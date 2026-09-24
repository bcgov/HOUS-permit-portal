import { t } from "i18next"
import { cast, flow, getEnv, Instance, toGenerator, types } from "mobx-state-tree"
import { TEphemeralEnv } from "../hooks/use-ephemeral-mst-model"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { EQuestionBankSortFields } from "../types/enums"
import { IRequirementQuestion } from "./requirement-question"

/**
 * In-memory question-bank search for nested drawers (no URL sync).
 * Merges entities into the root requirementQuestionStore map.
 */
export const RequirementQuestionPickerSearchModel = types
  .compose(
    types.model("RequirementQuestionPickerSearchModel").props({
      tableRequirementQuestionIds: types.array(types.string),
    }),
    createSearchModel<EQuestionBankSortFields>("fetchRequirementQuestions", undefined, { syncUrl: false })
  )
  .extend(withEnvironment())
  .views((self) => ({
    get rootStore() {
      return getEnv<TEphemeralEnv>(self).rootStore
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
  .views((self) => ({
    get tableRequirementQuestions(): IRequirementQuestion[] {
      const { requirementQuestionStore } = self.rootStore
      return self.tableRequirementQuestionIds
        .map((id) => requirementQuestionStore.getRequirementQuestionById(id))
        .filter(Boolean) as IRequirementQuestion[]
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
        const { requirementQuestionStore } = self.rootStore
        requirementQuestionStore.mergeUpdateAll(response.data.data, "requirementQuestionMap")
        self.tableRequirementQuestionIds = cast(response.data.data.map((question) => question.id))
        self.setPageFields(response.data.meta, opts)
      }
      return response.ok
    }),
  }))

export interface IRequirementQuestionPickerSearch extends Instance<typeof RequirementQuestionPickerSearchModel> {}
