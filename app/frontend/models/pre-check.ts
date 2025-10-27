import { flow, Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { EPreCheckAssessmentResult, EPreCheckServicePartner, EPreCheckStatus } from "../types/enums"
import { IDesignDocument } from "../types/types"
import { JurisdictionModel } from "./jurisdiction"
import { PermitTypeModel } from "./permit-classification"

export const PreCheckModel = types
  .model("PreCheck", {
    id: types.identifier,
    certificateNo: types.maybeNull(types.string),
    status: types.enumeration(Object.values(EPreCheckStatus)),
    title: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    pid: types.maybeNull(types.string),
    permitApplicationId: types.maybeNull(types.string),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    permitType: types.maybeNull(types.reference(types.late(() => PermitTypeModel))),
    servicePartner: types.enumeration(Object.values(EPreCheckServicePartner)),
    eulaAccepted: types.optional(types.boolean, false),
    consentToSendDrawings: types.optional(types.boolean, false),
    consentToShareWithJurisdiction: types.optional(types.boolean, false),
    consentToResearchContact: types.optional(types.boolean, false),
    designDocuments: types.array(types.frozen<IDesignDocument>()),
    assessmentResult: types.maybeNull(types.enumeration(Object.values(EPreCheckAssessmentResult))),
    viewedAt: types.maybeNull(types.Date),
    viewerUrl: types.maybeNull(types.string),
    expired: types.optional(types.boolean, false),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .extend(withEnvironment())
  .volatile(() => ({
    cachedPdfReportUrl: null as string | null,
    pdfUrlFetchedAt: null as Date | null,
  }))
  .views((self) => ({
    // Computed view to replace isSubmitted boolean
    get isSubmitted() {
      return self.status === EPreCheckStatus.processing || self.status === EPreCheckStatus.complete
    },
    get isCompleted() {
      return self.status === EPreCheckStatus.complete
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
      return self.status === EPreCheckStatus.processing || self.status === EPreCheckStatus.complete
    },
    get isResultsSummaryComplete() {
      return self.status === EPreCheckStatus.complete
    },
    // Check if completed but not yet viewed
    get isUnviewed() {
      return self.status === EPreCheckStatus.complete && !self.viewedAt
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
    // Get the display name for the service partner
    get providerName() {
      switch (self.servicePartner) {
        case EPreCheckServicePartner.archistar:
          return "Archistar"
        default:
          return "our service partner"
      }
    },
  }))
  .actions((self) => ({
    fetchPdfReportUrl: flow(function* () {
      // Check if we have a cached URL that's less than 1 hour old
      if (self.cachedPdfReportUrl && self.pdfUrlFetchedAt) {
        const hourInMs = 60 * 60 * 1000
        const timeSinceFetch = Date.now() - self.pdfUrlFetchedAt.getTime()

        if (timeSinceFetch < hourInMs) {
          // Cache is still valid, return cached URL
          return self.cachedPdfReportUrl
        }
      }

      // Cache is stale or doesn't exist, fetch new URL
      const response = yield self.environment.api.getPreCheckPdfReportUrl(self.id)
      if (response.ok && response.data?.pdfReportUrl) {
        // Cache the new URL and timestamp
        self.cachedPdfReportUrl = response.data.pdfReportUrl
        self.pdfUrlFetchedAt = new Date()
        return self.cachedPdfReportUrl
      }

      console.error("Failed to fetch PDF report URL:", response.problem, response.data)
      return null
    }),
  }))

export interface IPreCheck extends Instance<typeof PreCheckModel> {}
