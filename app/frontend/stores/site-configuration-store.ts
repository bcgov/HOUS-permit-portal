import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { RevisionReasonModel } from "../models/revision-reason"
import { ISiteConfigurationUpdateParams } from "../types/api-request"
import { IHelpLinkItems } from "../types/types.js"

interface ILandingPageTemplate {
  id: string
  nickname: string
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
      sitewideMessage: types.maybeNull(types.string),
      helpLinkItems: types.frozen<IHelpLinkItems>(),
      revisionReasonsMap: types.map(RevisionReasonModel),
      landingPageEarlyAccessRequirementTemplates: types.optional(types.frozen<ILandingPageTemplate[]>(), []),
    })
    .extend(withRootStore())
    .extend(withEnvironment())
    .actions((self) => ({
      fetchSiteConfiguration: flow(function* fetchSiteConfiguration() {
        self.configurationLoaded = false
        const response: any = yield self.environment.api.fetchSiteConfiguration()
        if (response.ok) {
          applySnapshot(self, preProcessor(response.data.data))
        }
        self.configurationLoaded = true
        return response.ok
      }),
      updateSiteConfiguration: flow(function* updateSiteConfiguration(
        siteConfiguration: ISiteConfigurationUpdateParams
      ) {
        self.configurationLoaded = false
        const response: any = yield self.environment.api.updateSiteConfiguration(siteConfiguration)

        if (response.ok) {
          applySnapshot(self, preProcessor(response.data.data))
          self.configurationLoaded = true
        }
        self.configurationLoaded = true
        return response.ok
      }),
    }))
    .actions((self) => ({
      afterCreate() {
        // Automatically fetch site configuration upon store creation
        self.fetchSiteConfiguration()
      },
    }))
    .views((self) => ({
      get activeRevisionReasons() {
        return Array.from(self.revisionReasonsMap.values()).filter((reason) => !reason.discardedAt)
      },
      get landingPageEarlyAccessRequirementTemplateIds() {
        return self.landingPageEarlyAccessRequirementTemplates.map((template) => template.id)
      },
      get revisionReasonOptions() {
        return this.activeRevisionReasons.map((rr) => ({ label: rr.description, value: rr.reasonCode }))
      },
      get shownHelpLinkItems() {
        if (!self?.helpLinkItems) return []

        return Object.values(self.helpLinkItems).filter((item) => item.show)
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
