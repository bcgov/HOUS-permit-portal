import { t } from "i18next"
import { Instance, applySnapshot, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IExternalApiKeyParams } from "../types/api-request"
import { EEnergyStep, EJurisdictionExternalApiState, EZeroCarbonStep } from "../types/enums"
import { IContact, IOption, IPermitTypeRequiredStep, IPermitTypeSubmissionContact, TLatLngTuple } from "../types/types"
import { ExternalApiKeyModel } from "./external-api-key"
import { PermitApplicationModel } from "./permit-application"
import { SandboxModel } from "./sandbox"

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
    externalApiState: types.optional(
      types.enumeration(Object.values(EJurisdictionExternalApiState)),
      EJurisdictionExternalApiState.gOff
    ),
    submissionInboxSetUp: types.boolean,
    permitTypeRequiredSteps: types.array(types.frozen<IPermitTypeRequiredStep>()),
    sandboxes: types.array(types.reference(SandboxModel)),
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
    permitTypeStepRequirements(permitTypeId: string) {
      const all = self.permitTypeRequiredSteps.filter((r) => r.permitTypeId == permitTypeId)
      return R.any((r) => !r.default, all) ? all.filter((r) => !r.default) : all
    },
    getPermitTypeSubmissionContact(id: string): IPermitTypeSubmissionContact {
      return self.permitTypeSubmissionContacts.find((c) => c.id == id)
    },
    getRequiredStep(id: string): IPermitTypeRequiredStep {
      return self.permitTypeRequiredSteps.find((rs) => rs.id == id)
    },
    getExternalApiKey(externalApiKeyId: string) {
      return self.externalApiKeysMap.get(externalApiKeyId)
    },
    energyStepRequiredTranslation(energyStepRequired?: EEnergyStep) {
      const i18nPrefix = "home.configurationManagement.stepCodeRequirements"
      return energyStepRequired
        ? t(`${i18nPrefix}.stepRequired.energy.options.${energyStepRequired}`)
        : t(`${i18nPrefix}.notRequired`)
    },
    zeroCarbonLevelTranslation(zeroCarbonStepRequired?: EZeroCarbonStep) {
      const i18nPrefix = "home.configurationManagement.stepCodeRequirements"
      return zeroCarbonStepRequired
        ? t(`${i18nPrefix}.stepRequired.zeroCarbon.options.${zeroCarbonStepRequired}`)
        : t(`${i18nPrefix}.notRequired`)
    },
    get sandboxOptions(): IOption[] {
      return self.sandboxes.map((s) => ({ label: s.name, value: s.id }))
    },
  }))
  .views((self) => ({
    get requiredStepsByPermitType() {
      const groupRequirements = (acc, r) =>
        R.includes(r, self.permitTypeStepRequirements(r.permitTypeId)) ? acc.concat(r) : acc
      const toPermitType = ({ permitTypeId }) => permitTypeId

      return R.reduceBy(groupRequirements, [], toPermitType, self.permitTypeRequiredSteps)
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
        self.externalApiState = response.data?.data?.externalApiState
      }
      return response.ok
    }),
  }))

export interface IJurisdiction extends Instance<typeof JurisdictionModel> {}
