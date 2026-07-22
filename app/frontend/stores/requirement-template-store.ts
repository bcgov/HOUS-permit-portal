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
import { ERequirementTemplateSortFields, ETagType } from "../types/enums"
import { ICopyRequirementTemplateFormData, IOption, TCreateRequirementTemplateFormData } from "../types/types"
import { toCamelCase } from "../utils/utility-functions"

export interface IRequirementTemplateConfigError {
  category: string
  blockId: string
  blockName: string
  requirementId?: string
  requirementCode?: string
  requirementName?: string
  message: string
}

interface IConfigErrorResponse {
  meta?: {
    configErrors?: IRequirementTemplateConfigError[]
  }
}

export const RequirementTemplateStoreModel = types
  .compose(
    types.model("RequirementTemplateStoreModel").props({
      requirementTemplateMap: types.map(RequirementTemplateModel),
      tableRequirementTemplates: types.array(types.safeReference(RequirementTemplateModel)),
      filterOptions: types.optional(types.array(types.frozen<IOption>()), []),
      configErrorsByRequirementTemplateId: types.optional(
        types.map(types.frozen<IRequirementTemplateConfigError[]>()),
        {}
      ),
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
    getConfigErrorsByRequirementTemplateId(id: string) {
      return self.configErrorsByRequirementTemplateId.get(id) ?? []
    },
    getSortColumnHeader(field: ERequirementTemplateSortFields) {
      //@ts-ignore
      return t(`requirementTemplate.fields.${toCamelCase(field)}`)
    },
  }))
  .actions((self) => ({
    captureConfigErrors(templateId: string, responseData: unknown) {
      const configErrors = (responseData as IConfigErrorResponse | undefined)?.meta?.configErrors
      if (configErrors) {
        self.configErrorsByRequirementTemplateId.set(templateId, configErrors)
      } else {
        self.configErrorsByRequirementTemplateId.delete(templateId)
      }
    },
    clearConfigErrors(templateId: string) {
      self.configErrorsByRequirementTemplateId.delete(templateId)
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

      if (requirementTemplate.draftTemplateVersions?.length > 0) {
        templateVersions.push(...requirementTemplate.draftTemplateVersions)
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
        })
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "requirementTemplateMap")
        self.tableRequirementTemplates = cast(response.data.data.map((requirementTemplate) => requirementTemplate.id))
        self.setPageFields(response.data.meta, opts)
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
        self.clearConfigErrors(templateId)

        return self.requirementTemplateMap.get(templateData.id) as IRequirementTemplate
      }

      self.captureConfigErrors(templateId, response.data)
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
        self.clearConfigErrors(templateId)

        return self.requirementTemplateMap.get(templateData.id) as IRequirementTemplate
      }

      self.captureConfigErrors(templateId, response.data)
      return false
    }),
    fetchFilterOptions: flow(function* () {
      const response = yield* toGenerator(self.environment.api.fetchRequirementTemplatesForFilter())
      if (response.ok) {
        self.filterOptions = cast(response.data.data)
      }
      return response.ok
    }),
    searchTagOptions: flow(function* (query: string) {
      const response = yield* toGenerator(
        self.environment.api.searchTags({
          query,
          taggableTypes: [ETagType.requirementTemplate],
        })
      )
      const tags = (response?.ok ? response.data : []) as string[]
      return (Array.isArray(tags) ? tags : []).map((tag) => ({ value: tag, label: tag }))
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

    // Draft workflow actions
    createDraft: flow(function* (templateId: string, assigneeId?: string) {
      const response = yield* toGenerator(
        self.environment.api.createDraft(templateId, assigneeId ? { assigneeId } : undefined)
      )

      if (response.ok) {
        const templateData = response.data.data
        templateData.isFullyLoaded = true
        self.mergeUpdate(templateData, "requirementTemplateMap")
        self.clearConfigErrors(templateId)
        return self.requirementTemplateMap.get(templateData.id) as IRequirementTemplate
      }

      self.captureConfigErrors(templateId, response.data)
      return false
    }),

    discardDraft: flow(function* (templateVersionId: string) {
      const response = yield* toGenerator(self.environment.api.discardDraft(templateVersionId))

      if (response.ok) {
        const templateData = response.data.data
        templateData.isFullyLoaded = true
        self.mergeUpdate(templateData, "requirementTemplateMap")
        return self.requirementTemplateMap.get(templateData.id) as IRequirementTemplate
      }

      return false
    }),

    promoteDraft: flow(function* (
      templateVersionId: string,
      params: {
        versionDate?: string
        changeNotes?: string
        changeSignificance?: string
        notificationScope?: string
        notifiedJurisdictionIds?: string[]
        promoteBlockIds?: string[]
        sendAdvanceNotice?: boolean
        skipDateCheck?: boolean
      }
    ) {
      const requirementTemplateId =
        self.rootStore.templateVersionStore.getTemplateVersionById(templateVersionId)?.requirementTemplateId
      const response = yield* toGenerator(self.environment.api.promoteDraft(templateVersionId, params))

      if (response.ok) {
        const templateData = response.data.data
        templateData.isFullyLoaded = true
        self.mergeUpdate(templateData, "requirementTemplateMap")
        self.clearConfigErrors(templateData.id)
        return self.requirementTemplateMap.get(templateData.id) as IRequirementTemplate
      }

      if (requirementTemplateId) {
        self.captureConfigErrors(requirementTemplateId, response.data)
      }
      return false
    }),
  }))

export interface IRequirementTemplateStoreModel extends Instance<typeof RequirementTemplateStoreModel> {}
