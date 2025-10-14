import { Instance, types } from "mobx-state-tree"
import { JurisdictionModel } from "./jurisdiction"

export const PreCheckModel = types
  .model("PreCheck", {
    id: types.identifier,
    certNumber: types.maybeNull(types.string),
    phase: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    permitApplicationId: types.maybeNull(types.string),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    jurisdictionId: types.maybeNull(types.string),
    servicePartner: types.maybeNull(types.string),
    eulaAccepted: types.optional(types.boolean, false),
    consentToSendDrawings: types.optional(types.boolean, false),
    consentToShareWithJurisdiction: types.optional(types.boolean, false),
    consentToResearchContact: types.optional(types.boolean, false),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .views((self) => ({
    // Section completion status
    get isServicePartnerComplete() {
      return !!self.servicePartner
    },
    get isProjectAddressComplete() {
      return !!self.fullAddress
    },
    get isAgreementsAndConsentComplete() {
      // Both required consents must be accepted
      return self.eulaAccepted && self.consentToSendDrawings
    },
    get isBuildingTypeComplete() {
      // TODO: implement when building type field is added
      return false
    },
    get isUploadDrawingsComplete() {
      // TODO: implement when drawings upload is added
      return false
    },
    get isConfirmSubmissionComplete() {
      // TODO: implement when submission confirmation is added
      return false
    },
    get isResultsSummaryComplete() {
      // TODO: implement when results are added
      return false
    },
  }))

export interface IPreCheck extends Instance<typeof PreCheckModel> {}
