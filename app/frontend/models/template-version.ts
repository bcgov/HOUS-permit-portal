import { t } from "i18next"
import { flow } from "mobx"
import { Instance, toGenerator, types } from "mobx-state-tree"
import { IJurisdictionTemplateVersionCustomizationForm } from "../components/domains/requirement-template/screens/jurisdiction-edit-digital-permit-screen"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EDeprecationReason, EExportFormat, ETemplateVersionStatus } from "../types/enums"
import { IDenormalizedTemplate } from "../types/types"
import { startBlobDownload } from "../utils/utility-functions"
import { JurisdictionTemplateVersionCustomizationModel } from "./jurisdiction-template-version-customization"

export const TemplateVersionModel = types
  .model("TemplateVersionModel")
  .props({
    id: types.identifier,
    status: types.enumeration(Object.values(ETemplateVersionStatus)),
    deprecationReason: types.maybeNull(types.enumeration(Object.values(EDeprecationReason))),
    versionDate: types.Date,
    label: types.string,
    updatedAt: types.Date,
    denormalizedTemplateJson: types.maybeNull(types.frozen<IDenormalizedTemplate>()),
    templateVersionCustomizationsByJurisdiction: types.map(JurisdictionTemplateVersionCustomizationModel),
    latestVersionId: types.maybeNull(types.string),
    isFullyLoaded: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get isPublished() {
      return self.status === ETemplateVersionStatus.published
    },

    get isScheduled() {
      return self.status === ETemplateVersionStatus.scheduled
    },

    get isDeprecated() {
      return self.status === ETemplateVersionStatus.deprecated
    },
    getJurisdictionTemplateVersionCustomization(jurisdictionId: string) {
      return self.templateVersionCustomizationsByJurisdiction.get(jurisdictionId)
    },
    get deprecationReasonLabel() {
      if (!self.deprecationReason) {
        return ""
      }

      return t(
        `requirementTemplate.versionSidebar.deprecationReasonLabels.${self.deprecationReason as EDeprecationReason}`
      )
    },
  }))
  .actions((self) => ({
    setJurisdictionTemplateVersionCustomization(
      jurisdictionId: string,
      customization: IJurisdictionTemplateVersionCustomizationForm
    ) {
      self.templateVersionCustomizationsByJurisdiction.set(jurisdictionId, customization)
    },
    setStatus(status: ETemplateVersionStatus) {
      self.status = status
    },
    setDeprecationReason(reason: EDeprecationReason | null) {
      self.deprecationReason = reason
    },
  }))
  .actions((self) => ({
    fetchJurisdictionTemplateVersionCustomization: flow(function* (jurisdictionId: string) {
      const response = yield* toGenerator(
        self.environment.api.fetchJurisdictionTemplateVersionCustomization(self.id, jurisdictionId)
      )
      if (!response.ok) {
        return response
      }

      const customization = response.data.data

      if (customization) {
        const customizationModel = JurisdictionTemplateVersionCustomizationModel.create(customization)
        self.setJurisdictionTemplateVersionCustomization(jurisdictionId, customizationModel)
      }

      return response
    }),
    fetchTemplateVersionCompare: flow(function* (previousVersionId?: string) {
      const response = yield* toGenerator(self.environment.api.fetchTemplateVersionCompare(self.id, previousVersionId))
      if (response.ok) {
        return response.data
      }
    }),
    createOrUpdateJurisdictionTemplateVersionCustomization: flow(function* (
      jurisdictionId: string,
      params: IJurisdictionTemplateVersionCustomizationForm
    ) {
      const response = yield* toGenerator(
        self.environment.api.createOrUpdateJurisdictionTemplateVersionCustomization(self.id, jurisdictionId, params)
      )
      if (!response.ok) {
        return response.ok
      }

      const customization = response.data.data

      if (customization) {
        self.setJurisdictionTemplateVersionCustomization(jurisdictionId, customization)
      }

      return self.getJurisdictionTemplateVersionCustomization(jurisdictionId)
    }),
    downloadExport: flow(function* (jurisdictionId: string, format: EExportFormat) {
      const jurisdiction = self.rootStore.jurisdictionStore.getJurisdictionById(jurisdictionId)
      const mimeTypes = {
        [EExportFormat.csv]: "text/csv",
        [EExportFormat.json]: "text/plain",
      }

      const apiMethodNames = {
        [EExportFormat.csv]: "downloadCustomizationCsv",
        [EExportFormat.json]: "downloadCustomizationJson",
      }

      try {
        const response = yield* toGenerator(self.environment.api[apiMethodNames[format]](self.id, jurisdictionId))
        if (!response.ok) {
          return response.ok
        }

        const mimeType = mimeTypes[format]
        const fileName = `${jurisdiction.qualifiedName} - ${self.label}.${format}`
        const blobData = format === EExportFormat.json ? JSON.stringify(response.data, null, 2) : response.data
        startBlobDownload(blobData, mimeType, fileName)
        return response
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Failed to download template version ${format}:`, error)
        }
        throw error
      }
    }),
    downloadRequirementSummary: flow(function* () {
      try {
        const response = yield* toGenerator(self.environment.api.downloadRequirementSummaryCsv(self.id))
        if (!response.ok) {
          return response.ok
        }

        const blobData = response.data
        const fileName = `${self.label} ${t("requirementTemplate.export.templateSummaryFilename")}.csv`
        const mimeType = "text/csv"
        startBlobDownload(blobData, mimeType, fileName)

        return response
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Failed to download requirement summary:`, error)
        }
        throw error
      }
    }),
    unschedule: flow(function* () {
      if (!self.isScheduled) {
        return false
      }
      const response = yield* toGenerator(self.environment.api.unscheduleTemplateVersion(self.id))

      if (response.ok) {
        self.setStatus(response.data.data.status)
        self.setDeprecationReason(response.data.data.deprecationReason)
      }

      return response.ok
    }),
  }))

export interface ITemplateVersion extends Instance<typeof TemplateVersionModel> {}
