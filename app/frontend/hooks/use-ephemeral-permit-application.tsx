// src/hooks/useEphemeralPermitApplication.ts

import { useLocalObservable } from "mobx-react-lite"
import { useEffect } from "react"
import { IPermitApplication, PermitApplicationModel } from "../models/permit-application"
import { IRequirementTemplate } from "../models/requirement-template"
import { useMst } from "../setup/root"
import { EPermitApplicationStatus } from "../types/enums"
import { getFullyEnabledCustomization } from "../utils/formio-component-traversal"
import { convertResourceArrayToRecord } from "../utils/utility-functions"

/**
 * Generates a unique ID for ephemeral permit applications.
 */
const generateEphemeralId = (): string => `ephemeral-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/**
 * Custom hook to create and manage an ephemeral PermitApplicationModel instance.
 *
 * @param requirementTemplate - Optional requirement template to base certain fields on.
 * @param overrides - Optional partial permit application data to override defaults.
 * @returns The ephemeral permit application instance.
 */
export const useEphemeralPermitApplication = (
  requirementTemplate?: IRequirementTemplate,
  overrides: Partial<IPermitApplication> = {}
): IPermitApplication => {
  const { userStore } = useMst()

  // Initialize the ephemeral permit application with default or partial values
  const ephemeralPermit = useLocalObservable(() => {
    if (!requirementTemplate) return null

    return PermitApplicationModel.create({
      id: generateEphemeralId(),
      nickname: overrides.nickname || "Ephemeral Application",
      number: overrides.number || "",
      fullAddress: overrides.fullAddress || null,
      pin: overrides.pin || null,
      pid: overrides.pid || null,
      permitType: requirementTemplate?.permitType || overrides.permitType || {}, // Provide default or empty objects as needed
      activity: requirementTemplate?.activity || overrides.activity || {},
      status: overrides.status || EPermitApplicationStatus.newDraft,
      submitter: overrides.submitter || userStore.currentUser?.id || null,
      jurisdiction: overrides.jurisdiction || null,
      templateVersion: requirementTemplate?.publishedTemplateVersion || overrides.templateVersion || null,
      publishedTemplateVersion:
        requirementTemplate?.publishedTemplateVersion || overrides.publishedTemplateVersion || null,
      formJson: overrides.formJson || requirementTemplate?.publishedTemplateVersion.formJson,
      submissionData: overrides.submissionData || null,
      formattedComplianceData: overrides.formattedComplianceData || null,
      formCustomizations:
        getFullyEnabledCustomization(requirementTemplate?.publishedTemplateVersion.formJson) ||
        overrides.formCustomizations ||
        null,
      submittedAt: overrides.submittedAt || null,
      resubmittedAt: overrides.resubmittedAt || null,
      revisionsRequestedAt: overrides.revisionsRequestedAt || null,
      selectedTabIndex: overrides.selectedTabIndex ?? 0,
      createdAt: overrides.createdAt || new Date(),
      updatedAt: overrides.updatedAt || new Date(),
      stepCode: overrides.stepCode || null,
      supportingDocuments: overrides.supportingDocuments || null,
      allSubmissionVersionCompletedSupportingDocuments:
        overrides.allSubmissionVersionCompletedSupportingDocuments || null,
      zipfileSize: overrides.zipfileSize || null,
      zipfileName: overrides.zipfileName || null,
      zipfileUrl: overrides.zipfileUrl || null,
      referenceNumber: overrides.referenceNumber || null,
      missingPdfs: overrides.missingPdfs || null,
      isFullyLoaded: overrides.isFullyLoaded ?? false,
      isDirty: overrides.isDirty ?? false,
      isLoading: overrides.isLoading ?? false,
      indexedUsingCurrentTemplateVersion: overrides.indexedUsingCurrentTemplateVersion || null,
      showingCompareAfter: overrides.showingCompareAfter ?? false,
      revisionMode: overrides.revisionMode ?? false,
      diff: overrides.diff || null,
      submissionVersions: overrides.submissionVersions || [],
      selectedPastSubmissionVersion: overrides.selectedPastSubmissionVersion || null,
      permitCollaborationMap: overrides.permitCollaborationMap || {},
      permitBlockStatusMap: overrides.permitBlockStatusMap || {},
      isViewingPastRequests: overrides.isViewingPastRequests ?? false,
      // Initialize maps properly if overrides provide arrays
      ...(overrides.permitCollaborations && {
        permitCollaborationMap: convertResourceArrayToRecord(overrides.permitCollaborations),
      }),
      ...(overrides.permitBlockStatuses && {
        permitBlockStatusMap: convertResourceArrayToRecord(overrides.permitBlockStatuses),
      }),
      isEphemeral: true,
    })
  })

  /**
   * useEffect to update the permit application once the requirementTemplate is loaded.
   */
  useEffect(() => {
    if (requirementTemplate) {
      // Update fields that depend on the requirementTemplate
      ephemeralPermit.permitType = overrides.permitType || requirementTemplate.permitType
      ephemeralPermit.activity = overrides.activity || requirementTemplate.activity
      ephemeralPermit.templateVersion = overrides.templateVersion || requirementTemplate.publishedTemplateVersion
      ephemeralPermit.publishedTemplateVersion =
        overrides.publishedTemplateVersion || requirementTemplate.publishedTemplateVersion
      ephemeralPermit.formCustomizations =
        overrides.formCustomizations ||
        getFullyEnabledCustomization(requirementTemplate.publishedTemplateVersion.formJson)

      // Optionally, update other fields if necessary
      // For example, you might want to set default submissionData or formJson based on the template
    }
  }, [
    requirementTemplate,
    overrides.permitType,
    overrides.activity,
    overrides.templateVersion,
    overrides.publishedTemplateVersion,
    overrides.formCustomizations,
  ])

  return ephemeralPermit
}

export default useEphemeralPermitApplication
