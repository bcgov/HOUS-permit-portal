import { format } from "date-fns"
import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { datefnsAppDateFormat } from "../constants"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IRequirementTemplate, RequirementTemplateModel } from "../models/requirement-template"
import { IRequirementTemplateUpdateParams } from "../types/api-request"
import { ERequirementTemplateSortFields, EVisibility } from "../types/enums"
import { ICopyRequirementTemplateFormData, TCreateRequirementTemplateFormData } from "../types/types"
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

      const templateVersions = []

      if (requirementTemplate.publishedTemplateVersion) {
        templateVersions.push(requirementTemplate.publishedTemplateVersion)
      }

      if (requirementTemplate.scheduledTemplateVersions?.length > 0) {
        templateVersions.push(...requirementTemplate.scheduledTemplateVersions)
      }

      if (requirementTemplate.deprecatedTemplateVersions?.length > 0) {
        templateVersions.push(...requirementTemplate.deprecatedTemplateVersions)
      }

      self.rootStore.templateVersionStore.mergeUpdateAll(templateVersions, "templateVersionMap")
      if (requirementTemplate.assignee) self.rootStore.userStore.mergeUpdate(requirementTemplate.assignee, "usersMap")

      return R.mergeRight(requirementTemplate, {
        assignee: requirementTemplate.assignee?.id,
      })
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
          visibility: `${EVisibility.live},${EVisibility.any}`,
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
      const existingRequirementTemplate = self.requirementTemplateMap.get(id)

      existingRequirementTemplate?.setIsFullyLoaded(false)

      const response = yield* toGenerator(self.environment.api.fetchRequirementTemplate(id))

      if (response.ok) {
        const templateData = response.data.data
        templateData.isFullyLoaded = true
        self.mergeUpdate(templateData, "requirementTemplateMap")

        const updatedRequirementTemplate = self.requirementTemplateMap.get(templateData.id)

        updatedRequirementTemplate?.setIsFullyLoaded(true)

        return updatedRequirementTemplate
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

        return self.requirementTemplateMap.get(templateData.id) as IRequirementTemplate
      }

      return false
    }),
    forcePublishRequirementTemplate: flow(function* (
      templateId: string,
      requirementParams: IRequirementTemplateUpdateParams
    ) {
      const response = yield* toGenerator(
        self.environment.api.forcePublishRequirementTemplate(templateId, requirementParams)
      )

      if (response.ok) {
        const templateData = response.data.data
        templateData.isFullyLoaded = true
        self.mergeUpdate(templateData, "requirementTemplateMap")

        return self.requirementTemplateMap.get(templateData.id) as IRequirementTemplate
      }

      return false
    }),
  }))
  .actions((self) => ({
    copyRequirementTemplate: flow(function* (requirementTemplateValues?: ICopyRequirementTemplateFormData) {
      const { ok, data: response } = yield* toGenerator(
        self.environment.api.copyRequirementTemplate(requirementTemplateValues)
      )

      if (ok) {
        self.requirementTemplateMap.put(response.data)
        return response.data
      }
    }),
  }))

export interface IRequirementTemplateStoreModel extends Instance<typeof RequirementTemplateStoreModel> {}
