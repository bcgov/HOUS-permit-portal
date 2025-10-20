import { Instance, types } from "mobx-state-tree"
import { EPreCheckServicePartner, EPreCheckStatus } from "../types/enums"
import { IDesignDocument } from "../types/types"
import { JurisdictionModel } from "./jurisdiction"
import { PermitTypeModel } from "./permit-classification"

export const PreCheckModel = types
  .model("PreCheck", {
    id: types.identifier,
    complyCertificateId: types.maybeNull(types.number),
    certificateNo: types.maybeNull(types.string),
    status: types.enumeration(Object.values(EPreCheckStatus)),
    title: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    permitApplicationId: types.maybeNull(types.string),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    permitType: types.maybeNull(types.reference(types.late(() => PermitTypeModel))),
    servicePartner: types.enumeration(Object.values(EPreCheckServicePartner)),
    eulaAccepted: types.optional(types.boolean, false),
    consentToSendDrawings: types.optional(types.boolean, false),
    consentToShareWithJurisdiction: types.optional(types.boolean, false),
    consentToResearchContact: types.optional(types.boolean, false),
    designDocuments: types.array(types.frozen<IDesignDocument>()),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .views((self) => ({
    // Computed view to replace isSubmitted boolean
    get isSubmitted() {
      return self.status === EPreCheckStatus.submitted || self.status === EPreCheckStatus.reviewed
    },
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
      return self.designDocuments.length > 0
    },
    get isConfirmSubmissionComplete() {
      return self.status === EPreCheckStatus.submitted || self.status === EPreCheckStatus.reviewed
    },
    get isResultsSummaryComplete() {
      return self.status === EPreCheckStatus.reviewed
    },
    // Check if all required fields are complete and ready for submission
    get isReadyForSubmission() {
      return (
        this.isServicePartnerComplete &&
        this.isProjectAddressComplete &&
        this.isAgreementsAndConsentComplete &&
        this.isBuildingTypeComplete &&
        this.isUploadDrawingsComplete
      )
    },
  }))

export interface IPreCheck extends Instance<typeof PreCheckModel> {}
