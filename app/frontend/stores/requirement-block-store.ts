import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IRequirementBlock, RequirementBlockModel } from "../models/requirement-block"
import { IRequirementTemplate } from "../models/requirement-template"
import { IRequirementBlockParams } from "../types/api-request"
import {
  EAutoComplianceModule,
  EAutoComplianceType,
  ERequirementLibrarySortFields,
  ERequirementType,
  ETagType,
  EVisibility,
} from "../types/enums"
import {
  IDenormalizedRequirementBlock,
  TAutoComplianceModuleConfiguration,
  TAutoComplianceModuleConfigurations,
  TValueExtractorAutoComplianceModuleConfiguration,
} from "../types/types"
import { isValueExtractorModuleConfiguration } from "../utils/utility-functions"

export const RequirementBlockStoreModel = types
  .compose(
    types.model("RequirementBlockStoreModel").props({
      requirementBlockMap: types.map(RequirementBlockModel),
      autoComplianceModuleConfigurations: types.maybeNull(types.frozen<TAutoComplianceModuleConfigurations>()),
      isAutoComplianceModuleOptionsLoading: types.optional(types.boolean, false),
      tableRequirementBlocks: types.array(types.safeReference(RequirementBlockModel)),
      isEditingEarlyAccess: types.optional(types.boolean, false),
    }),
    createSearchModel<ERequirementLibrarySortFields>("fetchRequirementBlocks")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get autoComplianceModuleConfigurationsList(): Array<TAutoComplianceModuleConfiguration> {
      return Object.values(self.autoComplianceModuleConfigurations ?? {}) as Array<TAutoComplianceModuleConfiguration>
    },
    // View to get a RequirementBlock by id
    getRequirementBlockById(id: string) {
      return self.requirementBlockMap.get(id)
    },
    getSortColumnHeader(field: ERequirementLibrarySortFields) {
      switch (field) {
        case ERequirementLibrarySortFields.name:
          return t("requirementsLibrary.fields.name")
        case ERequirementLibrarySortFields.firstNations:
          return t("requirementsLibrary.fields.firstNations")
        case ERequirementLibrarySortFields.associations:
          return t("requirementsLibrary.fields.associations")
        case ERequirementLibrarySortFields.requirementLabels:
          return t("requirementsLibrary.fields.formFields")
        case ERequirementLibrarySortFields.updatedAt:
          return t("requirementsLibrary.fields.updatedAt")
        case ERequirementLibrarySortFields.configurations:
          return t("requirementsLibrary.configurationsColumn")
      }
    },
  }))
  .views((self) => ({
    getAutoComplianceModuleConfigurationForRequirementType(
      moduleName: EAutoComplianceModule,
      requirementType: ERequirementType
    ) {
      const moduleConfig = self.autoComplianceModuleConfigurations?.[moduleName]

      if (!moduleConfig || !moduleConfig.availableOnInputTypes.includes(requirementType)) {
        return null
      }

      if (!isValueExtractorModuleConfiguration(moduleConfig)) {
        return moduleConfig
      }

      return {
        ...moduleConfig,
        availableFields: (moduleConfig as TValueExtractorAutoComplianceModuleConfiguration).availableFields.filter(
          (field) => field.availableOnInputTypes.includes(requirementType)
        ),
      }
    },
    getAvailableAutoComplianceModuleConfigurationsForRequirementType(requirementType: ERequirementType) {
      return self.autoComplianceModuleConfigurationsList
        .filter((option) => option.availableOnInputTypes.includes(requirementType))
        .map((option) => {
          if (
            option.type === EAutoComplianceType.externalValueExtractor ||
            option.type === EAutoComplianceType.internalValueExtractor
          ) {
            return {
              ...option,
              availableFields: (option as TValueExtractorAutoComplianceModuleConfiguration).availableFields.filter(
                (field) => field.availableOnInputTypes.includes(requirementType)
              ),
            }
          }

          return option
        })
    },
    getIsRequirementBlockEditable(requirementBlock: IRequirementBlock | IDenormalizedRequirementBlock) {
      return !self.isEditingEarlyAccess || requirementBlock.visibility === EVisibility.earlyAccess
    },
  }))
  .actions((self) => ({
    fetchRequirementBlocks: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const visibility = self.isEditingEarlyAccess ? EVisibility.any : `${EVisibility.live},${EVisibility.any}`

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementBlocks({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          showArchived: self.showArchived,
          visibility,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "requirementBlockMap")
        self.tableRequirementBlocks = cast(response.data.data.map((requirementBlock) => requirementBlock.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
  }))
  .actions((self) => ({
    createRequirementBlock: flow(function* (requirementParams: IRequirementBlockParams) {
      const response = yield* toGenerator(self.environment.api.createRequirementBlock(requirementParams))

      if (response.ok) {
        self.requirementBlockMap.put(response.data.data)

        // Get latest data for current page, sort and filters
        yield self.fetchRequirementBlocks()
      }

      return response.ok
    }),
    searchAssociations: flow(function* (query: string) {
      const response = yield* toGenerator(
        self.environment.api.searchTags({
          query,
          taggableTypes: [ETagType.requirementBlock],
        })
      )

      if (response.ok) {
        return response.data
      }

      return []
    }),
    fetchAutoComplianceModuleConfigurations: flow(function* () {
      self.isAutoComplianceModuleOptionsLoading = true

      const response = yield* toGenerator(self.environment.api.fetchAutoComplianceModuleConfigurations())

      if (response.ok) {
        self.autoComplianceModuleConfigurations = response.data.data
      }

      self.isAutoComplianceModuleOptionsLoading = false

      return self.autoComplianceModuleConfigurations
    }),
  }))
  .actions((self) => ({
    copyRequirementBlock: flow(function* (
      requirementBlock: IRequirementBlock,
      toEarlyAccess = false,
      replaceOn: IRequirementTemplate = null
    ) {
      const { id, requirements, ...copyableRequirementsAttributes } = requirementBlock

      const clonedParams: IRequirementBlockParams = {
        ...copyableRequirementsAttributes,
        requirementsAttributes: requirementBlock.requirements?.map((attr) => {
          const { id, ...rest } = attr
          return rest
        }),
        name: requirementBlock.name,
        visibility: toEarlyAccess ? EVisibility.earlyAccess : requirementBlock.visibility,
        replaceBlockId: requirementBlock.id,
        replaceOnTemplateId: replaceOn.id,
      }

      return yield self.createRequirementBlock(clonedParams)
    }),
    setIsEditingEarlyAccess: (value: boolean) => {
      self.isEditingEarlyAccess = value
    },
    resetIsEditingEarlyAccess: () => {
      self.isEditingEarlyAccess = false
    },
  }))

export interface IRequirementBlockStoreModel extends Instance<typeof RequirementBlockStoreModel> {}
