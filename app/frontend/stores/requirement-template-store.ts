import { format } from "date-fns"
import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { TCreateRequirementTemplateFormData } from "../components/domains/requirement-template/new-requirement-tempate-screen"
import { datefnsAppDateFormat } from "../constants"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { RequirementTemplateModel } from "../models/requirement-template"
import { IRequirementTemplateUpdateParams } from "../types/api-request"
import { ERequirementTemplateSortFields } from "../types/enums"
import { toCamelCase } from "../utils/utility-functions"

export const RequirementTemplateStoreModel = types
  .compose(
    types.model("RequirementTemplateStoreModel").props({
      requirementTemplateMap: types.map(RequirementTemplateModel),
      tableRequirementTemplates: types.array(types.safeReference(RequirementTemplateModel)),
    }),
    createSearchModel<ERequirementTemplateSortFields>("fetchRequirementTemplates")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    // View to get a RequirementTemplate by id
    getRequirementTemplateById(id: string) {
      return self.requirementTemplateMap.get(id)
    },
    getSortColumnHeader(field: ERequirementTemplateSortFields) {
      //@ts-ignore
      return t(`requirementTemplate.fields.${toCamelCase(field)}`)
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(requirementTemplate) {
      // merge updates requirementBlocks
      if (requirementTemplate.requirementTemplateSections?.length > 0) {
        requirementTemplate.requirementTemplateSections.forEach((section) => {
          section.templateSectionBlocks.forEach((sectionBlock) => {
            sectionBlock.requirementBlock &&
              self.rootStore.requirementBlockStore.mergeUpdate(sectionBlock.requirementBlock, "requirementBlockMap")
          })
        })
      }

      if (requirementTemplate.templateVersions?.length > 0) {
        requirementTemplate.templateVersions.forEach((templateVersion) =>
          self.rootStore.templateVersionStore.mergeUpdate(templateVersion, "templateVersionMap")
        )
      }

      return requirementTemplate
    },
  }))

  .actions((self) => ({
    fetchRequirementTemplates: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementTemplates({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
          showArchived: self.showArchived,
        })
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "requirementTemplateMap")
        self.tableRequirementTemplates = cast(response.data.data.map((requirementTemplate) => requirementTemplate.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
    fetchRequirementTemplate: flow(function* (id: string) {
      const response = yield* toGenerator(self.environment.api.fetchRequirementTemplate(id))

      if (response.ok) {
        const templateData = response.data.data
        templateData.isFullyLoaded = true
        self.mergeUpdate(templateData, "requirementTemplateMap")

        return self.requirementTemplateMap.get(templateData.id)
      }

      return response.ok
    }),

    createRequirementTemplate: flow(function* (formData: TCreateRequirementTemplateFormData) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.createRequirementTemplate(formData))

      if (ok) {
        self.requirementTemplateMap.put(response.data)
        return response.data
      }
    }),
    updateRequirementTemplate: flow(function* (templateId: string, params: IRequirementTemplateUpdateParams) {
      const response = yield* toGenerator(self.environment.api.updateRequirementTemplate(templateId, params))

      if (response.ok) {
        const templateData = response.data.data
        templateData.isFullyLoaded = true
        self.mergeUpdate(templateData, "requirementTemplateMap")

        return self.requirementTemplateMap.get(templateData.id)
      }

      return response.ok
    }),
    scheduleRequirementTemplate: flow(function* (
      templateId: string,
      requirementParams: IRequirementTemplateUpdateParams,
      scheduleDate: Date
    ) {
      const response = yield* toGenerator(
        self.environment.api.scheduleRequirementTemplate(templateId, {
          requirementTemplate: requirementParams,
          versionDate: format(scheduleDate, datefnsAppDateFormat),
        })
      )

      if (response.ok) {
        const templateData = response.data.data
        templateData.isFullyLoaded = true
        self.mergeUpdate(templateData, "requirementTemplateMap")

        return self.requirementTemplateMap.get(templateData.id)
      }

      return response.ok
    }),
  }))

export interface IRequirementTemplateStoreModel extends Instance<typeof RequirementTemplateStoreModel> {}
