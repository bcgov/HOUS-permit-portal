import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { RevisionReasonModel } from "../models/revision-reason"
import { ISiteConfigurationUpdateParams } from "../types/api-request"
import { EPreCheckServicePartner } from "../types/enums"
import { IHelpLinkItems } from "../types/types.js"

interface IStandardizationPageTemplate {
  id: string
  nickname: string
  description?: string
  isAvailableForAdoption: boolean
  activityCategory: string
}

// Define the SiteConfiguration model
export const SiteConfigurationStoreModel = types.snapshotProcessor(
  types
    .model("SiteConfigurationStore")
    .props({
      configurationLoaded: types.optional(types.boolean, false),
      displaySitewideMessage: types.maybeNull(types.boolean),
      inboxEnabled: types.maybeNull(types.boolean),
      allowDesignatedReviewer: types.maybeNull(types.boolean),
      codeComplianceEnabled: types.maybeNull(types.boolean),
      archistarEnabledForAllJurisdictions: types.maybeNull(types.boolean),
      sitewideMessage: types.maybeNull(types.string),
      helpLinkItems: types.frozen<IHelpLinkItems>(),
      revisionReasonsMap: types.map(RevisionReasonModel),
      standardizationPageEarlyAccessRequirementTemplates: types.optional(
        types.frozen<IStandardizationPageTemplate[]>(),
        []
      ),
    })
    .extend(withRootStore())
    .extend(withEnvironment())
    .actions((self) => ({
      fetchSiteConfiguration: flow(function* fetchSiteConfiguration() {
        self.configurationLoaded = false
        const response: any = yield self.environment.api.fetchSiteConfiguration()
        const rawData = { ...preProcessor(response.data.data), configurationLoaded: true }
        if (response.ok) {
          applySnapshot(self, rawData)
        }
        return response.ok
      }),
      updateSiteConfiguration: flow(function* updateSiteConfiguration(
        siteConfiguration: ISiteConfigurationUpdateParams
      ) {
        self.configurationLoaded = false
        const response: any = yield self.environment.api.updateSiteConfiguration(siteConfiguration)

        const rawData = { ...preProcessor(response.data.data), configurationLoaded: true }
        if (response.ok) {
          applySnapshot(self, rawData)
        }
        return response.ok
      }),
      updateJurisdictionEnrollments: flow(function* updateJurisdictionEnrollments(
        servicePartner: string,
        jurisdictionIds: string[]
      ) {
        const response: any = yield self.environment.api.updateJurisdictionEnrollments(servicePartner, jurisdictionIds)
        return response
      }),
      fetchJurisdictionEnrollments: flow(function* fetchJurisdictionEnrollments(servicePartner: string) {
        const response: any = yield self.environment.api.fetchJurisdictionEnrollments(servicePartner)
        return response
      }),
    }))
    .actions((self) => ({
      afterCreate() {
        // Automatically fetch site configuration upon store creation
        self.fetchSiteConfiguration()
      },
    }))
    .views((self) => ({
      get anyProviderEnabledForAllJurisdictions() {
        // TODO: Add other providers here when we add more providers
        return self.archistarEnabledForAllJurisdictions
      },
      get activeRevisionReasons() {
        return Array.from(self.revisionReasonsMap.values()).filter((reason) => !reason.discardedAt)
      },
      get standardizationPageEarlyAccessRequirementTemplateIds() {
        return self.standardizationPageEarlyAccessRequirementTemplates.map((template) => template.id)
      },
      get revisionReasonOptions() {
        return this.activeRevisionReasons.map((rr) => ({ label: rr.description, value: rr.reasonCode }))
      },
      get shownHelpLinkItems() {
        if (!self?.helpLinkItems) return []

        return Object.values(self.helpLinkItems).filter((item) => item.show)
      },
      isServicePartnerGloballyEnabled(servicePartner: string) {
        if (!self.codeComplianceEnabled) return false

        // Map service partner to the corresponding "enabled for all" flag
        switch (servicePartner) {
          case EPreCheckServicePartner.archistar:
            return !!self.archistarEnabledForAllJurisdictions
          default:
            return false
        }
      },
    })),
  {
    preProcessor,
  }
)

function preProcessor(snapshot) {
  const processedSnapShot = { ...snapshot }

  if (snapshot.revisionReasons) {
    processedSnapShot.revisionReasonsMap = snapshot.revisionReasons.reduce((acc, rr) => {
      acc[rr.id] = rr
      return acc
    }, {})
  }

  return processedSnapShot
}

export interface ISiteConfigurationStore extends Instance<typeof SiteConfigurationStoreModel> {}
