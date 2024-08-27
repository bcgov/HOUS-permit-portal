import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EOmniauthProvider, EUserRoles } from "../types/enums"
import { ILicenseAgreement } from "../types/types"
import { convertToDate } from "../utils/utility-functions"
import { IJurisdiction, JurisdictionModel } from "./jurisdiction"

export const UserModel = types
  .model("UserModel")
  .props({
    id: types.identifier,
    email: types.maybeNull(types.string),
    unconfirmedEmail: types.maybeNull(types.string),
    role: types.enumeration(Object.values(EUserRoles)),
    omniauthEmail: types.maybeNull(types.string),
    omniauthUsername: types.maybeNull(types.string),
    omniauthProvider: types.maybeNull(types.enumeration(Object.values(EOmniauthProvider))),
    firstName: types.maybeNull(types.string),
    lastName: types.maybeNull(types.string),
    certified: types.maybeNull(types.boolean),
    organization: types.maybeNull(types.string),
    jurisdictions: types.array(types.reference(types.late(() => JurisdictionModel))),
    createdAt: types.maybeNull(types.Date),
    confirmationSentAt: types.maybeNull(types.Date),
    confirmedAt: types.maybeNull(types.Date),
    discardedAt: types.maybeNull(types.Date),
    lastSignInAt: types.maybeNull(types.Date),
    eulaAccepted: types.maybeNull(types.boolean),
    invitedByEmail: types.maybeNull(types.string),
    preference: types.frozen<IPreference>(),
    invitedToJurisdiction: types.maybeNull(types.frozen<IJurisdiction>()),
    licenseAgreements: types.maybeNull(types.frozen<ILicenseAgreement[]>()),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({
    get isSuperAdmin() {
      return self.role == EUserRoles.superAdmin
    },
    get isRegionalReviewManager() {
      return self.role == EUserRoles.regionalReviewManager
    },
    get isReviewManager() {
      return self.role == EUserRoles.reviewManager
    },
    get isManager() {
      return self.role == EUserRoles.regionalReviewManager || self.role == EUserRoles.reviewManager
    },
    get isReviewer() {
      return self.role == EUserRoles.reviewer
    },
    get isReviewStaff() {
      return (
        self.role == EUserRoles.reviewer ||
        self.role == EUserRoles.reviewManager ||
        self.role == EUserRoles.regionalReviewManager
      )
    },
    get isSubmitter() {
      return self.role == EUserRoles.submitter
    },
    get isDiscarded() {
      return self.discardedAt !== null
    },
    get isUnconfirmed() {
      return self.confirmedAt == null
    },
    get name() {
      return self.firstName && self.lastName && `${self.firstName} ${self.lastName}`
    },
    get jurisdiction() {
      return (
        self.jurisdictions.find((j) => j.id == self.rootStore.uiStore.currentlySelectedJurisdictionId) ||
        self.jurisdictions[0]
      )
    },
  }))
  .actions((self) => ({
    setLicenseAgreements(licenseAgreements: ILicenseAgreement[]) {
      self.licenseAgreements = licenseAgreements?.map((licenseAgreement) => ({
        ...licenseAgreement,
        acceptedAt: convertToDate(licenseAgreement.acceptedAt),
      }))
    },
  }))
  .actions((self) => ({
    destroy: flow(function* () {
      const response = yield self.environment.api.destroyUser(self.id)
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
    restore: flow(function* () {
      const response = yield self.environment.api.restoreUser(self.id)
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
    changeRole: flow(function* () {
      let newRole = null
      if (self.role === EUserRoles.reviewManager) {
        newRole = EUserRoles.reviewer
      } else if (self.role === EUserRoles.reviewer) {
        newRole = EUserRoles.reviewManager
      } else {
        return
      }

      const response = yield self.environment.api.updateUser(self.id, { role: newRole })
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
    acceptEULA: flow(function* () {
      const response = yield self.environment.api.acceptEULA(self.id)
      if (response.ok) {
        self.rootStore.userStore.mergeUpdate(response.data.data, "usersMap")
      }
      return response.ok
    }),
    fetchAcceptedEulas: flow(function* () {
      const response = yield self.environment.api.fetchCurrentUserAcceptedEulas()

      if (response.ok) {
        const licenseAgreements = response.data.data?.licenseAgreements

        Array.isArray(licenseAgreements) && self.setLicenseAgreements(licenseAgreements)
      }

      return response.ok
    }),
    acceptInvitation: flow(function* (invitationToken: string) {
      const response = yield self.environment.api.acceptInvitation(self.id, { invitationToken })
      if (response.ok) {
        self.rootStore.userStore.mergeUpdate(response.data.data, "usersMap")
      }
      return response.ok
    }),
    resendConfirmation: flow(function* () {
      const response = yield self.environment.api.resendConfirmation(self.id)
      if (response.ok) {
        self.rootStore.userStore.mergeUpdate(response.data.data, "usersMap")
      }
      return response.ok
    }),
    reinvite: flow(function* () {
      const response = yield self.environment.api.reinviteUser(self.id)
      if (response.ok) {
        self.rootStore.userStore.mergeUpdate(response.data.data, "usersMap")
      }
      return response.ok
    }),
  }))

export interface IUser extends Instance<typeof UserModel> {}

export interface IPreference {
  enableInAppNewTemplateVersionPublishNotification: boolean
  enableEmailNewTemplateVersionPublishNotification: boolean
  enableInAppCustomizationUpdateNotification: boolean

  enableInAppApplicationSubmissionNotification: boolean
  enableEmailApplicationSubmissionNotification: boolean
  enableInAppApplicationViewNotification: boolean
  enableEmailApplicationViewNotification: boolean
  enableInAppApplicationRevisionsRequestNotification: boolean
  enableEmailApplicationRevisionsRequestNotification: boolean

  enableInAppCollaborationNotification: boolean
  enableEmailCollaborationNotification: boolean

  enableInAppIntegrationMappingNotification: boolean
  enableEmailIntegrationMappingNotification: boolean
}
