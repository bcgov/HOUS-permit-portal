import { t } from "i18next"
import { cast, flow, getEnv, Instance, toGenerator, types } from "mobx-state-tree"
import { TEphemeralEnv } from "../hooks/use-ephemeral-mst-model"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { ERequirementLibrarySortFields } from "../types/enums"
import { IRequirementBlock } from "./requirement-block"

/**
 * In-memory requirements-library search for nested drawers (no URL sync).
 * Merges entities into the root requirementBlockStore map.
 */
export const RequirementBlockPickerSearchModel = types
  .compose(
    types.model("RequirementBlockPickerSearchModel").props({
      tableRequirementBlockIds: types.array(types.string),
    }),
    createSearchModel<ERequirementLibrarySortFields>("fetchRequirementBlocks", undefined, { syncUrl: false })
  )
  .extend(withEnvironment())
  .views((self) => ({
    get rootStore() {
      return getEnv<TEphemeralEnv>(self).rootStore
    },
    getSortColumnHeader(field: ERequirementLibrarySortFields) {
      switch (field) {
        case ERequirementLibrarySortFields.name:
          return t("requirementsLibrary.fields.name")
        case ERequirementLibrarySortFields.associations:
          return t("requirementsLibrary.fields.associations")
        case ERequirementLibrarySortFields.requirementLabels:
          return t("requirementsLibrary.fields.formFields")
        case ERequirementLibrarySortFields.updatedAt:
          return t("requirementsLibrary.fields.updatedAt")
      }
    },
  }))
  .views((self) => ({
    get tableRequirementBlocks(): IRequirementBlock[] {
      const { requirementBlockStore } = self.rootStore
      return self.tableRequirementBlockIds
        .map((id) => requirementBlockStore.getRequirementBlockById(id))
        .filter(Boolean) as IRequirementBlock[]
    },
  }))
  .actions((self) => ({
    fetchRequirementBlocks: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementBlocks({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          showArchived: self.showArchived,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        const { requirementBlockStore } = self.rootStore
        requirementBlockStore.mergeUpdateAll(response.data.data, "requirementBlockMap")
        self.tableRequirementBlockIds = cast(response.data.data.map((block) => block.id))
        self.setPageFields(response.data.meta, opts)
      }
      return response.ok
    }),
  }))

export interface IRequirementBlockPickerSearch extends Instance<typeof RequirementBlockPickerSearchModel> {}
