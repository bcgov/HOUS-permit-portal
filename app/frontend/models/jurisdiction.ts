import { t } from "i18next"
import { Instance, applySnapshot, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IExternalApiKeyParams } from "../types/api-request"
import { IContact, IJurisdictionTemplateRequiredStep, IPermitTypeSubmissionContact, TLatLngTuple } from "../types/types"
import { ExternalApiKeyModel } from "./external-api-key"
import { PermitApplicationModel } from "./permit-application"

export const JurisdictionModel = types
  .model("JurisdictionModel", {
    id: types.identifier,
    slug: types.maybeNull(types.string),
    name: types.maybeNull(types.string),
    submissionEmail: types.maybeNull(types.string),
    qualifiedName: types.string,
    reverseQualifiedName: types.maybeNull(types.string),
    regionalDistrictName: types.maybeNull(types.string),
    localityType: types.maybeNull(types.string),
    qualifier: types.maybeNull(types.string),
    reviewManagersSize: types.maybeNull(types.number),
    reviewersSize: types.maybeNull(types.number),
    permitApplicationsSize: types.maybeNull(types.number),
    descriptionHtml: types.maybeNull(types.string),
    checklistHtml: types.maybeNull(types.string),
    lookOutHtml: types.maybeNull(types.string),
    contactSummaryHtml: types.maybeNull(types.string),
    contacts: types.array(types.frozen<IContact>()),
    permitTypeSubmissionContacts: types.array(types.frozen<IPermitTypeSubmissionContact>()),
    externalApiKeysMap: types.map(ExternalApiKeyModel),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
    tablePermitApplications: types.array(types.reference(PermitApplicationModel)),
    boundryPoints: types.optional(types.array(types.frozen<TLatLngTuple>()), []),
    mapPosition: types.frozen<TLatLngTuple>(),
    mapZoom: types.maybeNull(types.number),
    externalApiEnabled: types.optional(types.boolean, false),
    submissionInboxSetUp: types.boolean,
    jurisdictionTemplateRequiredSteps: types.array(types.frozen<IJurisdictionTemplateRequiredStep>()),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get externalApiKeys() {
      return Array.from(self.externalApiKeysMap.values()).sort((a, b) => (b.createdAt as any) - (a.createdAt as any))
    },
    get primaryContact() {
      if (self.contacts.length === 0) return null
      if (self.contacts.length === 1) return self.contacts[0]

      const sortByCreatedAt = R.sort<IContact>((a, b) => (a.createdAt as number) - (b.createdAt as number))

      return sortByCreatedAt(self.contacts)[0]
    },
    get requiredStepsByTemplate() {
      return self.jurisdictionTemplateRequiredSteps.reduce((result, jtrs) => {
        const templateId = jtrs.requirementTemplateId

        // If the category doesn't exist in the result object, create an array for it
        if (!result[templateId]) {
          result[templateId] = []
        }

        // Push the current item to the appropriate category array
        result[templateId].push(jtrs)

        // Return the result object for the next iteration
        return result
      }, {})
    },
    getPermitTypeSubmissionContact(id: string): IPermitTypeSubmissionContact {
      return self.permitTypeSubmissionContacts.find((c) => c.id == id)
    },
    getExternalApiKey(externalApiKeyId: string) {
      return self.externalApiKeysMap.get(externalApiKeyId)
    },
    energyStepRequiredTranslation(energyStepRequired: number) {
      const i18nPrefix = "home.configurationManagement.stepCodeRequirements"
      // @ts-ignore
      return t(`${i18nPrefix}.stepRequired.energy.options.${energyStepRequired}`)
    },
    zeroCarbonLevelTranslation(zeroCarbonStepRequired: number) {
      const i18nPrefix = "home.configurationManagement.stepCodeRequirements"
      // @ts-ignore
      return t(`${i18nPrefix}.stepRequired.zeroCarbon.options.${zeroCarbonStepRequired}`)
    },
  }))
  .actions((self) => ({
    setTablePermitApplications: (permitApplications) => {
      self.tablePermitApplications = permitApplications.map((pa) => pa.id)
    },
    update: flow(function* (params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.updateJurisdiction(self.id, params))
      if (ok) {
        applySnapshot(self, response.data)
      }
      return ok
    }),
    fetchExternalApiKeys: flow(function* () {
      const response = yield* toGenerator(self.environment.api.fetchExternalApiKeys(self.id))

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "externalApiKeysMap")
      }

      return response.ok
    }),
    fetchExternalApiKey: flow(function* (externalApiKeyId: string) {
      const response = yield* toGenerator(self.environment.api.fetchExternalApiKey(externalApiKeyId))

      if (response.ok) {
        const data = response.data.data
        self.mergeUpdate(data, "externalApiKeysMap")

        return data
      }

      return response.ok
    }),
    createExternalApiKey: flow(function* (params: IExternalApiKeyParams) {
      params.jurisdictionId = self.id
      const response = yield* toGenerator(self.environment.api.createExternalApiKey(params))

      if (response.ok) {
        const data = response.data.data
        self.mergeUpdate(data, "externalApiKeysMap")

        return self.getExternalApiKey(data.id)
      }

      return response.ok
    }),
    updateExternalApiKey: flow(function* (externalApiKeyId: string, params: IExternalApiKeyParams) {
      params.jurisdictionId = self.id
      const response = yield* toGenerator(self.environment.api.updateExternalApiKey(externalApiKeyId, params))

      if (response.ok) {
        const data = response.data.data

        self.mergeUpdate(data, "externalApiKeysMap")

        return self.getExternalApiKey(data.id)
      }

      return response.ok
    }),
    revokeExternalApiKey: flow(function* (externalApiKeyId: string) {
      const response = yield* toGenerator(self.environment.api.revokeExternalApiKey(externalApiKeyId))

      if (response.ok) {
        const data = response.data.data

        self.mergeUpdate(data, "externalApiKeysMap")

        return self.getExternalApiKey(data.id)
      }

      return response.ok
    }),
  }))
  .actions((self) => ({
    toggleExternalApiEnabled: flow(function* () {
      const response = yield* toGenerator(
        self.environment.api.updateJurisdictionExternalApiEnabled(self.id, !self.externalApiEnabled)
      )

      if (response.ok) {
        self.externalApiEnabled = !!response.data?.data?.externalApiEnabled
      }
      return response.ok
    }),
  }))

export interface IJurisdiction extends Instance<typeof JurisdictionModel> {}
