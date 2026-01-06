import { ApiResponse, ApisauceInstance, create, Monitor } from "apisauce"
import { IRevisionRequestForm } from "../../components/domains/permit-application/revision-sidebar"
import { IJurisdictionTemplateVersionCustomizationForm } from "../../components/domains/requirement-template/screens/jurisdiction-edit-digital-permit-screen"
import { TContactFormData } from "../../components/shared/contact/create-edit-contact-modal"
import { IEarlyAccessPreview } from "../../models/early-access-preview"
import { IExternalApiKey } from "../../models/external-api-key"
import { IIntegrationMapping } from "../../models/integration-mapping"
import { IJurisdiction } from "../../models/jurisdiction"
import { IJurisdictionTemplateVersionCustomization } from "../../models/jurisdiction-template-version-customization"
import { IPart3StepCode } from "../../models/part-3-step-code"
import { IPart3StepCodeChecklist } from "../../models/part-3-step-code-checklist"
import { IPart9StepCode } from "../../models/part-9-step-code"
import { IPart9StepCodeChecklist } from "../../models/part-9-step-code-checklist"
import { IPdfForm } from "../../models/pdf-form"
import { IPermitApplication } from "../../models/permit-application"
import { IActivity, IPermitType } from "../../models/permit-classification"
import { IPermitCollaboration } from "../../models/permit-collaboration"
import { IPermitProject } from "../../models/permit-project"
import { IPreCheck } from "../../models/pre-check"
import { IRequirementTemplate } from "../../models/requirement-template"
import { ITemplateVersion } from "../../models/template-version"
import { IUser } from "../../models/user"
import { ISiteConfigurationStore } from "../../stores/site-configuration-store"
import { IStepCode } from "../../stores/step-code-store"
import {
  IExternalApiKeyParams,
  IIntegrationMappingUpdateParams,
  IInvitePreviewersParams,
  IPermitProjectUpdateParams,
  IRequirementBlockParams,
  IRequirementTemplateUpdateParams,
  ITagSearchParams,
} from "../../types/api-request"
import {
  IAcceptInvitationResponse,
  IApiResponse,
  ICollaboratorSearchResponse,
  IJurisdictionPermitApplicationResponse,
  IJurisdictionResponse,
  INotificationResponse,
  IOptionResponse,
  IPageMeta,
  IRequirementBlockResponse,
  IRequirementTemplateResponse,
  IUsersResponse,
} from "../../types/api-responses"
import {
  ECollaborationType,
  ECollaboratorType,
  EEarlyAccessRequirementTemplateSortFields,
  EJurisdictionSortFields,
  EPdfFormSortFields,
  EPermitApplicationSortFields,
  EPermitBlockStatus,
  EPermitClassificationType,
  EPermitProjectSortFields,
  EPreCheckSortFields,
  ERequirementLibrarySortFields,
  ERequirementTemplateSortFields,
  EStepCodeSortFields,
  EStepCodeType,
  ETemplateVersionStatus,
  EUserSortFields,
} from "../../types/enums"
import {
  IContact,
  ICopyRequirementTemplateFormData,
  IJurisdictionFilters,
  IJurisdictionSearchFilters,
  IOverheatingDocument,
  IPart9ChecklistSelectOptions,
  IPdfFormJson,
  IPermitApplicationSearchFilters,
  IPermitProjectSearchFilters,
  ITemplateVersionDiff,
  TAutoComplianceModuleConfigurations,
  TCreatePermitApplicationFormData,
  TCreateRequirementTemplateFormData,
  TSearchParams,
} from "../../types/types"
import { camelizeResponse, decamelizeRequest } from "../../utils"
import { getCsrfToken } from "../../utils/utility-functions"

export class Api {
  client: ApisauceInstance

  constructor() {
    this.client = create({
      baseURL: "/api",
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
      timeout: 30000,
      withCredentials: true,
    })

    this.client.addResponseTransform((response) => {
      response.data = camelizeResponse(response.data)
    })

    this.client.addRequestTransform((request) => {
      request.headers["X-CSRF-Token"] = getCsrfToken()
      request.params = decamelizeRequest(request.params)
      request.data = decamelizeRequest(request.data)
    })

    this.client.addRequestTransform((request) => {
      const persistedSandboxValues = JSON.parse(localStorage.getItem("SandboxStore"))
      request.headers["X-Sandbox-ID"] = persistedSandboxValues?.currentSandboxId
    })
  }

  addMonitor(monitor: Monitor) {
    this.client.addMonitor(monitor)
  }

  async resendConfirmation(userId: string) {
    return this.client.post<ApiResponse<IUser>>(`/users/${userId}/resend_confirmation`)
  }

  async reinviteUser(userId: string) {
    return this.client.post<ApiResponse<IUser>>(`/users/${userId}/reinvite`)
  }

  async logout() {
    return this.client.delete("/logout")
  }

  async validateToken() {
    return this.client.get("/validate_token")
  }

  async invite(params) {
    return this.client.post("/invitation", params)
  }

  async acceptInvitation(userId: string, params) {
    return this.client.post<IAcceptInvitationResponse>(`/users/${userId}/accept_invitation`, params)
  }

  async fetchInvitedUser(token: string) {
    return this.client.get<ApiResponse<IUser>>(`/invitations/${token}`)
  }

  async searchJurisdictions(params?: TSearchParams<EJurisdictionSortFields, IJurisdictionSearchFilters>) {
    return this.client.post<IJurisdictionResponse>("/jurisdictions/search", params)
  }

  async fetchJurisdiction(id) {
    return this.client.get<ApiResponse<IJurisdiction>>(`/jurisdictions/${id}`)
  }

  async fetchPermitApplication(id: string, review?: boolean) {
    return this.client.get<ApiResponse<IPermitApplication>>(`/permit_applications/${id}`, { review })
  }

  async viewPermitApplication(id) {
    return this.client.post<ApiResponse<IPermitApplication>>(`/permit_applications/${id}/mark_as_viewed`)
  }

  async fetchLocalityTypeOptions() {
    return this.client.get<IOptionResponse>(`/jurisdictions/locality_type_options`)
  }

  async fetchContactOptions(query) {
    return this.client.get<IOptionResponse<IContact>>(`/contacts/contact_options`, { query })
  }

  async fetchJurisdictionOptions(filters: IJurisdictionFilters) {
    return this.client.get<IOptionResponse>(`/jurisdictions/jurisdiction_options`, {
      jurisdiction: { ...filters },
    })
  }

  async fetchPermitClassifications(onlyEnabled: boolean = true) {
    return this.client.get<IOptionResponse<IContact>>(`/permit_classifications`, { onlyEnabled })
  }

  async createPermitClassification(permitClassification: {
    name: string
    code: string
    description?: string
    enabled?: boolean
    type: EPermitClassificationType
    category?: string | null
  }) {
    return this.client.post(`/permit_classifications`, { permitClassification })
  }

  async updatePermitClassification(
    id: string,
    permitClassification: Partial<{
      name: string
      code: string
      description?: string
      enabled?: boolean
      type: EPermitClassificationType
      category?: string | null
    }>
  ) {
    return this.client.put(`/permit_classifications/${id}`, { permitClassification })
  }

  async destroyPermitClassification(id: string) {
    return this.client.delete(`/permit_classifications/${id}`)
  }

  async fetchPermitClassificationOptions(
    type,
    published = false,
    firstNations = false,
    permitTypeId: string = null,
    activityId: string = null,
    pid: string = null,
    jurisdictionId: string = null
  ) {
    return this.client.post<IOptionResponse<IPermitType | IActivity>>(
      `/permit_classifications/permit_classification_options`,
      {
        type,
        published,
        firstNations,
        permitTypeId,
        activityId,
        pid,
        jurisdictionId,
      }
    )
  }

  async createJurisdiction(params) {
    return this.client.post<ApiResponse<IJurisdiction>>("/jurisdictions", { jurisdiction: params })
  }

  async updateJurisdiction(id, params) {
    return this.client.patch<ApiResponse<IJurisdiction>>(`/jurisdictions/${id}`, { jurisdiction: params })
  }

  async updateJurisdictionExternalApiEnabled(id: string, externalApiEnabled: boolean) {
    return this.client.patch<ApiResponse<IJurisdiction>>(`/jurisdictions/${id}/update_external_api_enabled`, {
      externalApiEnabled: externalApiEnabled,
    })
  }

  async fetchRequirementBlocks(params?: TSearchParams<ERequirementLibrarySortFields>) {
    return this.client.post<IRequirementBlockResponse>("/requirement_blocks/search", params)
  }

  async fetchJurisdictionUsers(jurisdictionId, params?: TSearchParams<EUserSortFields>) {
    return this.client.post<IUsersResponse>(`/jurisdictions/${jurisdictionId}/users/search`, params)
  }

  async fetchAdminUsers(params?: TSearchParams<EUserSortFields>) {
    return this.client.post<IUsersResponse>(`/users/search`, params)
  }

  async fetchPermitApplications(params?: TSearchParams<EPermitApplicationSortFields, IPermitApplicationSearchFilters>) {
    return this.client.post<IJurisdictionPermitApplicationResponse>(`/permit_applications/search`, params)
  }

  async fetchProjectPermitApplications(
    permitProjectId: string,
    params?: TSearchParams<EPermitApplicationSortFields, IPermitApplicationSearchFilters>
  ) {
    return this.client.post<IJurisdictionPermitApplicationResponse>(
      `/permit_projects/${permitProjectId}/permit_applications/search`,
      params
    )
  }

  async fetchPermitProjects(params?: TSearchParams<EPermitProjectSortFields, IPermitProjectSearchFilters>) {
    return this.client.post<ApiResponse<IPermitProject[]>>(`/permit_projects/search`, params)
  }

  async fetchPermitProject(id: string) {
    return this.client.get<ApiResponse<IPermitProject>>(`/permit_projects/${id}`)
  }

  async fetchPinnedProjects() {
    return this.client.get<ApiResponse<IPermitProject[]>>(`/permit_projects/pinned`)
  }

  async fetchPermitProjectJurisdictionOptions() {
    return this.client.get<IOptionResponse>(`/permit_projects/jurisdiction_options`)
  }

  async createPermitProject(projectData: {
    title: string
    fullAddress?: string
    pid?: string
    jurisdictionId?: string
    pin?: string
  }) {
    return this.client.post<ApiResponse<IPermitProject>>("/permit_projects", { permitProject: projectData })
  }

  async updatePermitProject(id: string, params: IPermitProjectUpdateParams) {
    return this.client.patch<ApiResponse<IPermitProject>>(`/permit_projects/${id}`, { permitProject: params })
  }

  async pinPermitProject(id: string) {
    return this.client.post<ApiResponse<IPermitProject[]>>(`/permit_projects/${id}/pin`)
  }

  async unpinPermitProject(id: string) {
    return this.client.delete<ApiResponse<IPermitProject[]>>(`/permit_projects/${id}/unpin`)
  }

  async fetchSubmissionCollaboratorOptions(id: string) {
    return this.client.get<IOptionResponse>(`/permit_projects/${id}/submission_collaborator_options`)
  }

  async fetchCollaboratorsByCollaboratorable(collaboratorableId: string, params?: TSearchParams<never, never>) {
    return this.client.post<ICollaboratorSearchResponse>(
      `/collaborators/collaboratorable/${collaboratorableId}/search`,
      params
    )
  }

  async fetchJurisdictionPermitApplications(
    jurisdictionId,
    params?: TSearchParams<EPermitApplicationSortFields, IPermitApplicationSearchFilters>
  ) {
    return this.client.post<IJurisdictionPermitApplicationResponse>(
      `/jurisdictions/${jurisdictionId}/permit_applications/search`,
      params
    )
  }

  async createPermitApplication(params: TCreatePermitApplicationFormData) {
    return this.client.post<ApiResponse<IPermitApplication>>("/permit_applications", { permitApplication: params })
  }

  async createProjectPermitApplications(
    permitProjectId: string,
    params: Array<{ activityId: string; permitTypeId: string; firstNations: boolean }>
  ) {
    return this.client.post<ApiResponse<IPermitApplication[]>>(
      `/permit_projects/${permitProjectId}/permit_applications`,
      { permitApplications: params }
    )
  }

  async createRequirementBlock(params: IRequirementBlockParams) {
    return this.client.post<IRequirementBlockResponse>(`/requirement_blocks`, { requirementBlock: params })
  }

  async updateRequirementBlock(id: string, params: Partial<IRequirementBlockParams>) {
    return this.client.put<IRequirementBlockResponse>(`/requirement_blocks/${id}`, { requirementBlock: params })
  }

  async archiveRequirementBlock(id: string) {
    return this.client.delete<IRequirementBlockResponse>(`/requirement_blocks/${id}`)
  }

  async restoreRequirementBlock(id: string) {
    return this.client.post<IRequirementBlockResponse>(`/requirement_blocks/${id}/restore`)
  }

  async updateProfile(params) {
    return this.client.patch<ApiResponse<IUser>>("/profile", { user: params })
  }

  async destroyUser(id) {
    return this.client.delete<ApiResponse<IUser>>(`/users/${id}`)
  }

  async restoreUser(id) {
    return this.client.patch<ApiResponse<IUser>>(`/users/${id}/restore`)
  }

  async acceptEULA(userId: string) {
    return this.client.patch<ApiResponse<IUser>>(`/users/${userId}/accept_eula`)
  }

  async getEULA() {
    return this.client.get("/end_user_license_agreement")
  }

  async searchTags(params: Partial<ITagSearchParams>) {
    return this.client.post<string[]>(`/tags/search`, { search: params })
  }

  async fetchAutoComplianceModuleConfigurations() {
    return this.client.get<ApiResponse<TAutoComplianceModuleConfigurations>>(
      "/requirement_blocks/auto_compliance_module_configurations"
    )
  }

  async updatePermitApplication(id, params, review?: boolean) {
    return this.client.patch<ApiResponse<IPermitApplication>>(`/permit_applications/${id}`, {
      permitApplication: params,
      review,
    })
  }

  async updateRevisionRequests(id, params: IRevisionRequestForm) {
    return this.client.patch<ApiResponse<IPermitApplication>>(`/permit_applications/${id}/revision_requests`, {
      submissionVersion: params,
    })
  }

  async updatePermitApplicationVersion(id) {
    return this.client.patch<ApiResponse<IPermitApplication>>(`/permit_applications/${id}/update_version`)
  }

  async assignCollaboratorToPermitApplication(
    permitApplicationId: string,
    params: {
      collaboratorId: string
      collaboratorType: ECollaboratorType
      assignedRequirementBlockId?: string
    }
  ) {
    return this.client.post<ApiResponse<IPermitCollaboration>>(
      `/permit_applications/${permitApplicationId}/permit_collaborations`,
      {
        permitCollaboration: params,
      }
    )
  }

  async removeCollaboratorCollaborationsFromPermitApplication(
    permitApplicationId: string,
    {
      collaboratorId,
      collaboratorType,
      collaborationType,
    }: {
      collaboratorId: string
      collaboratorType: ECollaboratorType
      collaborationType: ECollaborationType
    }
  ) {
    return this.client.delete<ApiResponse<IPermitCollaboration>>(
      `/permit_applications/${permitApplicationId}/permit_collaborations/remove_collaborator_collaborations`,
      {
        collaboratorId,
        collaboratorType,
        collaborationType,
      }
    )
  }

  async createOrUpdatePermitBlockStatus(
    permitApplicationId: string,
    {
      requirementBlockId,
      collaborationType,
      status,
    }: {
      requirementBlockId: string
      collaborationType: ECollaborationType
      status: EPermitBlockStatus
    }
  ) {
    return this.client.post<ApiResponse<IPermitCollaboration>>(
      `/permit_applications/${permitApplicationId}/permit_block_status`,
      {
        requirementBlockId,
        status,
        collaborationType,
      }
    )
  }

  async inviteNewCollaboratorToPermitApplication(
    permitApplicationId: string,
    params: {
      user: {
        email: string
        firstName: string
        lastName: string
      }
      collaboratorType: ECollaboratorType
      assignedRequirementBlockId?: string
    }
  ) {
    return this.client.post<ApiResponse<IPermitCollaboration>>(
      `/permit_applications/${permitApplicationId}/permit_collaborations/invite`,
      {
        collaboratorInvite: params,
      }
    )
  }

  async unassignPermitCollaboration(id: string) {
    return this.client.delete<ApiResponse<IPermitCollaboration>>(`/permit_collaborations/${id}`)
  }

  async reinvitePermitCollaboration(permitCollaborationId: string) {
    return this.client.post<ApiResponse<IPermitCollaboration>>(
      `/permit_collaborations/${permitCollaborationId}/reinvite`
    )
  }

  async generatePermitApplicationMissingPdfs(id: string) {
    return this.client.post<never>(`/permit_applications/${id}/generate_missing_pdfs`)
  }

  async submitPermitApplication(id, params) {
    return this.client.post<ApiResponse<IPermitApplication>>(`/permit_applications/${id}/submit`, {
      permitApplication: params,
    })
  }

  async retriggerPermitApplicationWebhook(id: string) {
    return this.client.post<ApiResponse<IPermitApplication>>(`/permit_applications/${id}/retrigger_submission_webhook`)
  }

  async finalizeRevisionRequests(id) {
    return this.client.post<ApiResponse<IPermitApplication>>(`/permit_applications/${id}/revision_requests/finalize`)
  }

  async fetchRequirementTemplates(
    params?: TSearchParams<ERequirementTemplateSortFields | EEarlyAccessRequirementTemplateSortFields>
  ) {
    return this.client.post<IRequirementTemplateResponse>(`/requirement_templates/search`, params)
  }

  async fetchRequirementTemplatesForFilter() {
    return this.client.get<IApiResponse<{ id: string; nickname: string }[], {}>>(`/requirement_templates/for_filter`)
  }

  async fetchRequirementTemplate(id: string) {
    return this.client.get<IApiResponse<IRequirementTemplate, {}>>(`/requirement_templates/${id}`)
  }

  async createRequirementTemplate(params: TCreateRequirementTemplateFormData) {
    return this.client.post<ApiResponse<IRequirementTemplate>>(`/requirement_templates`, {
      requirementTemplate: params,
    })
  }

  async copyRequirementTemplate(params?: ICopyRequirementTemplateFormData) {
    return this.client.post<ApiResponse<IRequirementTemplate>>(`/requirement_templates/copy`, {
      requirementTemplate: params,
    })
  }

  async updateRequirementTemplate(templateId: string, params: IRequirementTemplateUpdateParams) {
    return this.client.put<ApiResponse<IRequirementTemplate>>(`/requirement_templates/${templateId}`, {
      requirementTemplate: params,
    })
  }

  async invitePreviewers(templateId: string, params: IInvitePreviewersParams) {
    return this.client.post<ApiResponse<IRequirementTemplate>>(
      `/requirement_templates/${templateId}/invite_previewers`,
      params
    )
  }

  async revokeEarlyAccess(previewId: string) {
    return this.client.post<ApiResponse<IEarlyAccessPreview>>(`/early_access_previews/${previewId}/revoke_access`)
  }

  async unrevokeEarlyAccess(previewId: string) {
    return this.client.post<ApiResponse<IEarlyAccessPreview>>(`/early_access_previews/${previewId}/unrevoke_access`)
  }

  async extendEarlyAccess(previewId: string) {
    return this.client.post<ApiResponse<IEarlyAccessPreview>>(`/early_access_previews/${previewId}/extend_access`)
  }

  // we send the versionDate as string instead of date as we want to strip off timezone info
  async scheduleRequirementTemplate(
    templateId: string,
    {
      requirementTemplate,
      versionDate,
    }: {
      requirementTemplate?: IRequirementTemplateUpdateParams
      versionDate: string
    }
  ) {
    return this.client.post<ApiResponse<IRequirementTemplate>>(`/requirement_templates/${templateId}/schedule`, {
      requirementTemplate,
      versionDate,
    })
  }

  async forcePublishRequirementTemplate(templateId: string, requirementTemplate: IRequirementTemplateUpdateParams) {
    return this.client.post<ApiResponse<IRequirementTemplate>>(
      `/requirement_templates/${templateId}/force_publish_now`,
      {
        requirementTemplate,
      }
    )
  }

  async fetchSiteOptions(address: string) {
    //fetch list of locations, returns siteIds (in some cases blank)
    return this.client.get<IOptionResponse>(`/geocoder/site_options`, { address })
  }

  async fetchGeocodedJurisdiction(siteId: string, pid: string = null, includeLtsaMatcher = false) {
    return this.client.get<IOptionResponse>(`/geocoder/jurisdiction`, {
      siteId,
      pid,
      includeLtsaMatcher,
    })
  }

  async fetchPids(siteId: string) {
    return this.client.get<ApiResponse<string>>(`/geocoder/pids`, { siteId })
  }

  async fetchSiteDetailsFromPid(pid: string) {
    return this.client.get<ApiResponse<string>>(`/geocoder/pid_details`, { pid })
  }

  async fetchPin(pin: string) {
    return this.client.get<ApiResponse<string>>(`/geocoder/pin`, { pin })
  }

  async destroyRequirementTemplate(id) {
    return this.client.delete<ApiResponse<IRequirementTemplate>>(`/requirement_templates/${id}`)
  }

  async restoreRequirementTemplate(id) {
    return this.client.patch<ApiResponse<IRequirementTemplate>>(`/requirement_templates/${id}/restore`)
  }

  async fetchTemplateVersions(
    activityId?: string,
    status?: ETemplateVersionStatus,
    earlyAccess?: boolean,
    isPublic?: boolean,
    permitTypeId?: string
  ) {
    return this.client.get<ApiResponse<ITemplateVersion[]>>(`/template_versions`, {
      activityId,
      status,
      earlyAccess,
      public: isPublic,
      permitTypeId,
    })
  }

  async fetchTemplateVersionCompare(templateVersionId: string, previousVersionId?: string) {
    const params = previousVersionId ? { previousVersionId } : {}

    return this.client.get<ApiResponse<ITemplateVersionDiff>>(
      `/template_versions/${templateVersionId}/compare_requirements`,
      params
    )
  }

  async fetchTemplateVersion(id: string) {
    return this.client.get<ApiResponse<ITemplateVersion>>(`/template_versions/${id}`)
  }

  async fetchJurisdictionTemplateVersionCustomization(templateId: string, jurisdictionId: string) {
    return this.client.get<ApiResponse<IJurisdictionTemplateVersionCustomization>>(
      `/template_versions/${templateId}/jurisdictions/${jurisdictionId}/jurisdiction_template_version_customization`
    )
  }

  async fetchIntegrationMapping(templateId: string, jurisdictionId: string) {
    return this.client.get<ApiResponse<IIntegrationMapping>>(
      `/template_versions/${templateId}/jurisdictions/${jurisdictionId}/integration_mapping`
    )
  }

  async updateIntegrationMapping(id: string, params: IIntegrationMappingUpdateParams) {
    return this.client.patch<ApiResponse<IIntegrationMapping>>(`/integration_mappings/${id}`, {
      integrationMapping: params,
    })
  }

  async createOrUpdateJurisdictionTemplateVersionCustomization(
    templateId: string,
    jurisdictionId: string,
    jurisdictionTemplateVersionCustomization: IJurisdictionTemplateVersionCustomizationForm
  ) {
    return this.client.post<ApiResponse<IJurisdictionTemplateVersionCustomization>>(
      `/template_versions/${templateId}/jurisdictions/${jurisdictionId}/jurisdiction_template_version_customization`,
      { jurisdictionTemplateVersionCustomization }
    )
  }

  async promoteJurisdictionTemplateVersionCustomization(templateId: string, jurisdictionId: string) {
    return this.client.post<ApiResponse<IJurisdictionTemplateVersionCustomization>>(
      `/template_versions/${templateId}/jurisdictions/${jurisdictionId}/jurisdiction_template_version_customization/promote`
    )
  }

  async unscheduleTemplateVersion(templateId: string) {
    return this.client.post<ApiResponse<ITemplateVersion>>(
      `requirement_templates/template_versions/${templateId}/unschedule`
    )
  }

  async fetchPart9StepCodes() {
    return this.client.get<ApiResponse<IStepCode[]>>("/part_9_building/step_codes")
  }

  async fetchPart9StepCode(id: string) {
    return this.client.get<ApiResponse<IPart9StepCode>>(`/part_9_building/step_codes/${id}`)
  }

  async searchStepCodes(params?: TSearchParams<EStepCodeSortFields>) {
    return this.client.post<ApiResponse<IStepCode[]>>("/step_codes/search", params)
  }

  async fetchPart9StepCodeSelectOptions() {
    return this.client.get<ApiResponse<{ selectOptions: IPart9ChecklistSelectOptions }>>(
      "/part_9_building/step_codes/select_options"
    )
  }

  // Removed legacy method createOrFindStepCodeForPermitApplication; Part 9 mirrors Part 3 creation now

  async deleteStepCode(id: string) {
    return this.client.delete<ApiResponse<IStepCode>>(`/step_codes/${id}`)
  }

  async archiveStepCode(id: string) {
    return this.client.delete<ApiResponse<IStepCode>>(`/step_codes/${id}`)
  }

  async restoreStepCode(id: string) {
    return this.client.patch<ApiResponse<IStepCode>>(`/step_codes/${id}/restore`)
  }

  async updateStepCode(
    id: string,
    data: Partial<{
      fullAddress: string
      referenceNumber: string
      title: string
      permitDate: string
      phase: string
      buildingCodeVersion: string
      jurisdictionId: string
      permitApplicationId: string
    }>
  ) {
    return this.client.patch<ApiResponse<IStepCode>>(`/step_codes/${id}`, { stepCode: data })
  }

  async downloadStepCodeSummaryCsv() {
    return this.client.get<BlobPart>(`/step_codes/download_step_code_summary_csv`)
  }

  async downloadStepCodeMetricsCsv(stepCodeType: EStepCodeType) {
    return this.client.get<BlobPart>(`/step_codes/download_step_code_metrics_csv`, { stepCodeType })
  }

  async fetchPreChecks(params?: TSearchParams<EPreCheckSortFields>) {
    return this.client.post<IApiResponse<IPreCheck[], IPageMeta>>(`/pre_checks/search`, params)
  }

  async fetchPreCheck(id: string) {
    return this.client.get<IApiResponse<IPreCheck, {}>>(`/pre_checks/${id}`)
  }

  async createPreCheck(params: Partial<IPreCheck>) {
    return this.client.post<IApiResponse<IPreCheck, {}>>(`/pre_checks`, { preCheck: params })
  }

  async updatePreCheck(id: string, params: Partial<IPreCheck>) {
    return this.client.patch<IApiResponse<IPreCheck, {}>>(`/pre_checks/${id}`, { preCheck: params })
  }

  async submitPreCheck(id: string) {
    return this.client.post<IApiResponse<IPreCheck, {}>>(`/pre_checks/${id}/submit`)
  }

  async markPreCheckAsViewed(id: string) {
    return this.client.patch<IApiResponse<IPreCheck, {}>>(`/pre_checks/${id}/mark_viewed`)
  }

  async getPreCheckPdfReportUrl(id: string) {
    return this.client.get<IApiResponse<{ pdfReportUrl: string }, {}>>(`/pre_checks/${id}/pdf_report_url`)
  }

  async downloadPreCheckUserConsentCsv() {
    return this.client.get<BlobPart>(`/pre_checks/download_pre_check_user_consent_csv`)
  }

  async downloadApplicationMetricsCsv() {
    return this.client.get<BlobPart>(`/permit_applications/download_application_metrics_csv`)
  }

  async fetchPart9Checklist(id: string) {
    return this.client.get<ApiResponse<IPart9StepCodeChecklist>>(`/part_9_building/checklists/${id}`)
  }

  async fetchPart3Checklist(id: string) {
    return this.client.get<ApiResponse<IPart3StepCodeChecklist>>(`/part_3_building/checklists/${id}`)
  }

  async updatePart9Checklist(id: string, data: Partial<IPart9StepCodeChecklist>, options?: Record<string, any>) {
    return this.client.patch<ApiResponse<IPart9StepCode>>(`/part_9_building/checklists/${id}`, {
      stepCodeChecklist: data,
      ...(options ?? {}),
    })
  }

  // importing IPart3StepCodeChecklist causes circular dependency typescript error
  async updatePart3Checklist(checklistId: string, checklist, options?: Record<string, any>) {
    return this.client.patch<ApiResponse<any>>(`/part_3_building/checklists/${checklistId}`, {
      checklist,
      ...(options ?? {}),
    })
  }

  async fetchSiteConfiguration() {
    return this.client.get<ApiResponse<ISiteConfigurationStore>>(`/site_configuration`, {})
  }

  async fetchExternalApiKeys(jurisdictionId: string) {
    return this.client.get<ApiResponse<IExternalApiKey[]>>(`/external_api_keys/`, { jurisdictionId })
  }

  async fetchExternalApiKey(externalApiKeyId: string) {
    return this.client.get<ApiResponse<IExternalApiKey>>(`/external_api_keys/${externalApiKeyId}`)
  }

  async createExternalApiKey(externalApiKey: IExternalApiKeyParams) {
    return this.client.post<ApiResponse<IExternalApiKey>>(`/external_api_keys/`, { externalApiKey })
  }

  async updateExternalApiKey(externalApiKeyId: string, externalApiKey: IExternalApiKeyParams) {
    return this.client.patch<ApiResponse<IExternalApiKey>>(`/external_api_keys/${externalApiKeyId}`, { externalApiKey })
  }

  async revokeExternalApiKey(externalApiKeyId: string) {
    return this.client.post<ApiResponse<IExternalApiKey>>(`/external_api_keys/${externalApiKeyId}/revoke`)
  }

  async updateSiteConfiguration(siteConfiguration) {
    return this.client.put<ApiResponse<ISiteConfigurationStore>>(`/site_configuration`, { siteConfiguration })
  }

  async updateJurisdictionEnrollments(servicePartner: string, jurisdictionIds: string[]) {
    return this.client.post<ApiResponse<any>>(`/site_configuration/update_jurisdiction_enrollments`, {
      servicePartner,
      jurisdictionIds,
    })
  }

  async fetchJurisdictionEnrollments(servicePartner: string) {
    return this.client.get<ApiResponse<any>>(`/site_configuration/jurisdiction_enrollments`, {
      servicePartner,
    })
  }

  async updateUser(id: string, user: IUser) {
    return this.client.patch<ApiResponse<IUser>>(`/users/${id}`, { user })
  }

  async fetchSuperAdmins() {
    return this.client.get<IOptionResponse>(`/users/super_admins`, {})
  }

  async createContact(params: TContactFormData) {
    return this.client.post<ApiResponse<IContact>>("/contacts", { contact: params })
  }

  async updateContact(id: string, params: TContactFormData) {
    return this.client.put<ApiResponse<IContact>>(`/contacts/${id}`, { contact: params })
  }

  async destroyContact(id: string) {
    return this.client.delete<ApiResponse<IContact>>(`/contacts/${id}`)
  }

  async downloadCustomizationJson(templateVersionId: string, jurisdictionId: string) {
    return this.client.get<BlobPart>(
      `/template_versions/${templateVersionId}/jurisdictions/${jurisdictionId}/download_customization_json`
    )
  }

  async downloadCustomizationCsv(templateVersionId: string, jurisdictionId: string) {
    return this.client.get<BlobPart>(
      `/template_versions/${templateVersionId}/jurisdictions/${jurisdictionId}/download_customization_csv`
    )
  }

  async copyJurisdictionTemplateVersionCustomization(
    templateVersionId: string,
    jurisdictionId: string,
    includeElectives: boolean,
    includeTips: boolean,
    fromNonFirstNations?: boolean,
    fromTemplateVersionId?: string
  ) {
    return this.client.post<ApiResponse<IJurisdictionTemplateVersionCustomization>>(
      `/template_versions/${templateVersionId}/jurisdictions/${jurisdictionId}/copy_jurisdiction_template_version_customization`,
      { includeElectives, includeTips, fromTemplateVersionId, fromNonFirstNations }
    )
  }

  async downloadRequirementSummaryCsv(templateVersionId: string) {
    return this.client.get<BlobPart>(`/template_versions/${templateVersionId}/download_requirement_summary_csv`)
  }

  async fetchNotifications(page: number) {
    return this.client.get<INotificationResponse>(`/notifications`, { page })
  }

  async resetLastReadNotifications() {
    return this.client.post(`/notifications/reset_last_read`)
  }

  async fetchCurrentUserAcceptedEulas() {
    return this.client.get<ApiResponse<IUser>>(`/users/current_user/license_agreements`)
  }

  async fetchPart3StepCode(id: string) {
    return this.client.get<ApiResponse<IPart3StepCode>>(`/part_3_building/step_codes/${id}`)
  }

  async createPart3StepCode(data: {
    permitApplicationId?: string
    permitProjectId?: string
    checklistAttributes: { sectionCompletionStatus: Record<string, any> }
  }) {
    if (data.permitApplicationId) {
      return this.client.post<ApiResponse<IStepCode>>(
        `/permit_applications/${data.permitApplicationId}/part_3_building/step_code`,
        { stepCode: data }
      )
    } else {
      return this.client.post<ApiResponse<IStepCode>>(`/part_3_building/step_codes`, { stepCode: data })
    }
  }

  async createPart9StepCode(data: {
    permitApplicationId?: string
    jurisdictionId?: string
    preConstructionChecklistAttributes?: any
    name?: string
  }) {
    if (data.permitApplicationId) {
      return this.client.post<ApiResponse<IStepCode>>(
        `/permit_applications/${data.permitApplicationId}/part_9_building/step_code`,
        { stepCode: data }
      )
    } else {
      return this.client.post<ApiResponse<IStepCode>>(`/part_9_building/step_codes`, { stepCode: data })
    }
  }

  async shareReportDocumentWithJurisdiction(reportDocumentId: string) {
    return this.client.post<ApiResponse<{ message: string }>>(
      `/report_documents/${reportDocumentId}/share_with_jurisdiction`
    )
  }

  async createPdfForm(formData: {
    formJson: IPdfFormJson
    formType: string
    status?: boolean
    projectNumber?: string
    model?: string
    site?: string
    lot?: string
    address?: string
    overheatingDocumentsAttributes?: Partial<IOverheatingDocument>[]
  }) {
    return this.client.post<IApiResponse<IPdfForm, {}>>("/pdf_forms", {
      pdfForm: {
        formJson: formData.formJson,
        formType: formData.formType,
        status: formData.status ?? true,
        projectNumber: formData.projectNumber,
        model: formData.model,
        site: formData.site,
        lot: formData.lot,
        address: formData.address,
        overheatingDocumentsAttributes: formData.overheatingDocumentsAttributes,
      },
    })
  }

  async getPdfForms(params?: TSearchParams<EPdfFormSortFields>) {
    return this.client.get<IApiResponse<IPdfForm[], IPageMeta>>("/pdf_forms", params)
  }

  async generatePdf(id: string) {
    return this.client.post<IApiResponse<IPdfForm, {}>>(`/pdf_forms/${id}/generate_pdf`)
  }

  async archivePdf(id: string) {
    return this.client.post<IApiResponse<IPdfForm, {}>>(`/pdf_forms/${id}/archive`)
  }

  async updatePdfForm(
    id: string,
    data: {
      formJson?: IPdfFormJson
      status?: boolean
      projectNumber?: string
      model?: string
      site?: string
      lot?: string
      address?: string
      overheatingDocumentsAttributes?: Partial<IOverheatingDocument>[]
    }
  ) {
    return this.client.put<IApiResponse<IPdfForm, {}>>(`/pdf_forms/${id}`, {
      pdfForm: {
        formJson: data.formJson,
        status: data.status,
        projectNumber: data.projectNumber,
        model: data.model,
        site: data.site,
        lot: data.lot,
        address: data.address,
        overheatingDocumentsAttributes: data.overheatingDocumentsAttributes,
      },
    })
  }
}
