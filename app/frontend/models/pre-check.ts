import { Instance, types } from "mobx-state-tree"
import { JurisdictionModel } from "./jurisdiction"
import { PermitTypeModel } from "./permit-classification"

export const PreCheckModel = types
  .model("PreCheck", {
    id: types.identifier,
    certNumber: types.maybeNull(types.string),
    phase: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    permitApplicationId: types.maybeNull(types.string),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    permitType: types.maybeNull(types.reference(types.late(() => PermitTypeModel))),
    servicePartner: types.maybeNull(types.string),
    eulaAccepted: types.optional(types.boolean, false),
    consentToSendDrawings: types.optional(types.boolean, false),
    consentToShareWithJurisdiction: types.optional(types.boolean, false),
    consentToResearchContact: types.optional(types.boolean, false),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .views((self) => ({
    // Helper to check if all required agreements have been accepted
    get requiredAgreementsAccepted() {
      return self.eulaAccepted && self.consentToSendDrawings
    },
    // Section completion status
    get isServicePartnerComplete() {
      return !!self.servicePartner
    },
    get isProjectAddressComplete() {
      return !!self.fullAddress && !!self.jurisdiction
    },
    get isAgreementsAndConsentComplete() {
      // Both required consents must be accepted
      return self.eulaAccepted && self.consentToSendDrawings
    },
    get isBuildingTypeComplete() {
      return !!self.permitType
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
