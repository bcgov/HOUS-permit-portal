import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { PermitApplicationModel } from "./permit-application" // Assuming PermitApplicationModel is in the same directory or path is adjusted
import { IActivity, IPermitType } from "./permit-classification" // Assuming PermitClassificationModel for permitType/activity
import { UserModel } from "./user" // Assuming UserModel is the reference for submitter

export const PermitProjectModel = types
  .model("PermitProjectModel", {
    id: types.identifier,
    description: types.maybeNull(types.string), // Projects might not have a description initially
    createdAt: types.Date,
    updatedAt: types.Date,

    // Delegated fields from primary_permit_application (now part of PermitProjectBlueprint.view :base)
    nickname: types.maybeNull(types.string),
    status: types.maybeNull(types.string), // Consider using EPermitApplicationStatus enum if status values are fixed
    number: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    pid: types.maybeNull(types.string),
    pin: types.maybeNull(types.string),
    referenceNumber: types.maybeNull(types.string),
    submittedAt: types.maybeNull(types.Date),
    viewedAt: types.maybeNull(types.Date),
    resubmittedAt: types.maybeNull(types.Date),
    revisionsRequestedAt: types.maybeNull(types.Date),

    // Delegated associations (now part of PermitProjectBlueprint.view :base)
    submitter: types.maybeNull(types.reference(types.late(() => UserModel))),
    permitType: types.maybeNull(types.frozen<IPermitType>()), // Or types.reference if it's a full model
    activity: types.maybeNull(types.frozen<IActivity>()), // Or types.reference if it's a full model

    // Direct association (can be more detailed, e.g., using extended_with_primary_details view from blueprint)
    primaryPermitApplication: types.maybeNull(types.reference(types.late(() => PermitApplicationModel))),
    supplementalPermitApplications: types.optional(
      types.array(types.reference(types.late(() => PermitApplicationModel))),
      []
    ),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    // Add views here if needed
    get projectNumber() {
      return self.number || self.primaryPermitApplication?.number || "N/A"
    },
    get permitTypeAndActivity() {
      if (self.activity?.name && self.permitType?.name) {
        return `${self.activity.name} - ${self.permitType.name}`.trim()
      }
      return self.primaryPermitApplication?.permitTypeAndActivity || "N/A"
    },
  }))
  .actions((self) => ({
    // Placeholder for __mergeUpdate if complex associations are handled, similar to PermitApplicationModel
    __mergeUpdate: (resourceData: any) => {
      // Logic to handle nested models or references before applying the snapshot
      // For example, if primaryPermitApplication is an object, ensure it's processed by PermitApplicationStore
      if (resourceData.submitter && typeof resourceData.submitter === "object") {
        self.rootStore.userStore.mergeUpdate(resourceData.submitter, "usersMap")
        resourceData.submitter = resourceData.submitter.id
      }
      // PermitType and Activity are frozen, so they should come as objects directly.
      // If they were references, you'd handle them like submitter.

      if (resourceData.primaryPermitApplication && typeof resourceData.primaryPermitApplication === "object") {
        self.rootStore.permitApplicationStore.mergeUpdate(resourceData.primaryPermitApplication, "permitApplicationMap")
        resourceData.primaryPermitApplication = resourceData.primaryPermitApplication.id
      }
      if (resourceData.supplementalPermitApplications && Array.isArray(resourceData.supplementalPermitApplications)) {
        const appIds = resourceData.supplementalPermitApplications.map((app: any) => {
          if (typeof app === "object") {
            self.rootStore.permitApplicationStore.mergeUpdate(app, "permitApplicationMap")
            return app.id
          }
          return app // Assuming it's already an ID
        })
        resourceData.supplementalPermitApplications = appIds
      }
      // Apply the processed snapshot to self
      // This direct assignment is MST's way of updating.
      // For complex updates or if 'self' is a map entry, you might use self.rootStore.permitProjectStore.permitProjectMap.put(newData)
      // However, __mergeUpdate is usually called on an instance that's already in a map.
      Object.assign(self, resourceData)
    },
    // Add other actions here
  }))

export interface IPermitProject extends Instance<typeof PermitProjectModel> {}
