import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { TemplateVersionModel } from "../models/template-version"
import { ESocketEventTypes, ETemplateVersionStatus } from "../types/enums"
import { ITemplateVersionUpdate, IUserPushPayload } from "../types/types"

export const TemplateVersionStoreModel = types
  .model("TemplateVersionStoreModel")
  .props({
    templateVersionMap: types.map(TemplateVersionModel),
    templateVersionsByActivityId: types.map(types.array(types.safeReference(TemplateVersionModel))),
    isLoading: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .actions((self) => ({
    __beforeMergeUpdate(templateVersion) {
      // Merge template version previews into the earlyAccessPreviewStore (same table/shape)
      if (templateVersion.templateVersionPreviews?.length > 0) {
        self.rootStore.earlyAccessPreviewStore.mergeUpdateAll(
          templateVersion.templateVersionPreviews,
          "earlyAccessPreviewsMap"
        )
      }

      // Merge assignee into usersMap if present
      if (templateVersion.assignee) {
        self.rootStore.userStore.mergeUpdate(templateVersion.assignee, "usersMap")
      }

      return R.mergeRight(templateVersion, {
        templateVersionPreviewIds: (templateVersion.templateVersionPreviews ?? []).map((p: any) => p.id ?? p),
        templateVersionPreviews: undefined, // Remove the raw objects; IDs are stored in templateVersionPreviewIds
        assignee: templateVersion.assignee?.id ?? templateVersion.assignee,
      })
    },
  }))
  .views((self) => ({
    get templateVersions() {
      return Array.from(self.templateVersionMap.values())
    },
  }))
  .views((self) => ({
    // View to get a RequirementTemplate by id
    getTemplateVersionById(id: string) {
      return self.templateVersionMap.get(id)
    },
    getTemplateVersionsByStatus(
      status: ETemplateVersionStatus = ETemplateVersionStatus.published,
      earlyAccess: boolean = false,
      isPubliclyPreviewable: boolean = false
    ) {
      return self.templateVersions.filter(
        (t) => t.status === status && t.publiclyPreviewable === isPubliclyPreviewable && t.earlyAccess === earlyAccess
      )
    },
    getTemplateVersionsByActivityId: (
      permitTypeId: string,
      status: ETemplateVersionStatus = ETemplateVersionStatus.published,
      earlyAccess: boolean = false,
      isPubliclyPreviewable: boolean = false
    ) => {
      return (self.templateVersionsByActivityId.get(permitTypeId) ?? []).filter(
        (t) => t.status === status && t.publiclyPreviewable === isPubliclyPreviewable && t.earlyAccess === earlyAccess
      )
    },
  }))
  .actions((self) => ({
    fetchTemplateVersions: flow(function* (
      activityId?: string,
      status?: ETemplateVersionStatus,
      earlyAccess?: boolean,
      isPubliclyPreviewable?: boolean,
      permitTypeId?: string
    ) {
      self.isLoading = true
      const response = yield* toGenerator(
        self.environment.api.fetchTemplateVersions(activityId, status, earlyAccess, isPubliclyPreviewable, permitTypeId)
      )

      if (response.ok) {
        const templateVersions = response.data.data

        templateVersions.forEach((version) => {
          version.isFullyLoaded = true
        })
        self.mergeUpdateAll(templateVersions, "templateVersionMap")

        !!activityId &&
          self.templateVersionsByActivityId.set(
            activityId,
            templateVersions.map((templateVersion) => templateVersion.id)
          )
      }
      self.isLoading = false
      return response.ok
    }),

    fetchTemplateVersion: flow(function* (id: string) {
      const response = yield* toGenerator(self.environment.api.fetchTemplateVersion(id))

      if (response.ok) {
        const templateVersion = response.data.data

        templateVersion.isFullyLoaded = true

        self.mergeUpdate(templateVersion, "templateVersionMap")

        return self.getTemplateVersionById(templateVersion.id)
      }
      return response.ok
    }),
  }))
  .actions((self) => ({
    processWebsocketChange: function (payload: IUserPushPayload) {
      //based on the eventType do stuff
      let payloadData
      switch (payload.eventType as ESocketEventTypes) {
        case ESocketEventTypes.update:
          payloadData = payload.data as ITemplateVersionUpdate

          self.templateVersionMap.get(payloadData?.id)?.handleSocketSupportingDocsUpdate(payloadData)
          break
        default:
          import.meta.env.DEV && console.log(`Unknown event type ${payload.eventType}`)
      }
    },
  }))

export interface ITemplateVersionStoreModel extends Instance<typeof TemplateVersionStoreModel> {}
