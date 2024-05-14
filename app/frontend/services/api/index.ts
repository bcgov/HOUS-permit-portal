import { ApiResponse, ApisauceInstance, create, Monitor } from "apisauce"
import { TCreatePermitApplicationFormData } from "../../components/domains/permit-application/new-permit-application-screen"
import { TCreateRequirementTemplateFormData } from "../../components/domains/requirement-template/new-requirement-template-screen"
import { IJurisdictionTemplateVersionCustomizationForm } from "../../components/domains/requirement-template/screens/jurisdiction-edit-digital-permit-screen"
import { TCreateContactFormData } from "../../components/shared/contact/create-contact-modal"
import { IJurisdiction } from "../../models/jurisdiction"
import { IJurisdictionTemplateVersionCustomization } from "../../models/jurisdiction-template-version-customization"
import { IPermitApplication } from "../../models/permit-application"
import { IActivity, IPermitType } from "../../models/permit-classification"
import { IRequirementTemplate } from "../../models/requirement-template"
import { IStepCode } from "../../models/step-code"
import { IStepCodeChecklist } from "../../models/step-code-checklist"
import { ITemplateVersion } from "../../models/template-version"
import { IUser } from "../../models/user"
import { IRequirementBlockParams, IRequirementTemplateUpdateParams, ITagSearchParams } from "../../types/api-request"
import {
  IAcceptInvitationResponse,
  IApiResponse,
  IJurisdictionPermitApplicationResponse,
  IJurisdictionResponse,
  IOptionResponse,
  IRequirementBlockResponse,
  IRequirementTemplateResponse,
  IUsersResponse,
} from "../../types/api-responses"
import {
  EJurisdictionSortFields,
  EJurisdictionTypes,
  EPermitApplicationSortFields,
  ERequirementLibrarySortFields,
  ERequirementTemplateSortFields,
  EUserSortFields,
} from "../../types/enums"
import { IContact, ISiteConfiguration, TAutoComplianceModuleOptions, TSearchParams } from "../../types/types"
import { camelizeResponse, decamelizeRequest } from "../../utils"

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
      request.params = decamelizeRequest(request.params)
      request.data = decamelizeRequest(request.data)
    })
  }

  addMonitor(monitor: Monitor) {
    this.client.addMonitor(monitor)
  }

  async resendConfirmation(userId: string) {
    return this.client.post<ApiResponse<IUser>>(`/users/${userId}/resend_confirmation`)
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

  async acceptInvitation(params) {
    return this.client.put<IAcceptInvitationResponse>("/invitation", { user: params })
  }

  async fetchInvitedUser(token: string) {
    return this.client.get<ApiResponse<IUser>>(`/invitations/${token}`)
  }

  async searchJurisdictions(params?: TSearchParams<EJurisdictionSortFields>) {
    return this.client.post<IJurisdictionResponse>("/jurisdictions/search", params)
  }

  async fetchJurisdiction(id) {
    return this.client.get<ApiResponse<IJurisdiction>>(`/jurisdictions/${id}`)
  }

  async fetchPermitApplication(id) {
    return this.client.get<ApiResponse<IPermitApplication>>(`/permit_applications/${id}`)
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

  async fetchJurisdictionOptions(name: string, type: EJurisdictionTypes) {
    return this.client.get<IOptionResponse>(`/jurisdictions/jurisdiction_options`, {
      jurisdiction: { name, type },
    })
  }

  async fetchPermitClassifications() {
    return this.client.get<IOptionResponse<IContact>>(`/permit_classifications`)
  }

  async fetchPermitClassificationOptions(
    type,
    published = false,
    permit_type_id: string = null,
    activity_id: string = null,
    pid: string = null,
    jurisdictionId: string = null
  ) {
    return this.client.post<IOptionResponse<IPermitType | IActivity>>(
      `/permit_classifications/permit_classification_options`,
      {
        type,
        published,
        permit_type_id,
        activity_id,
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

  async fetchRequirementBlocks(params?: TSearchParams<ERequirementLibrarySortFields>) {
    return this.client.post<IRequirementBlockResponse>("/requirement_blocks/search", params)
  }

  async fetchJurisdictionUsers(jurisdictionId, params?: TSearchParams<EUserSortFields>) {
    return this.client.post<IUsersResponse>(`/jurisdictions/${jurisdictionId}/users/search`, params)
  }

  async fetchAdminUsers(params?: TSearchParams<EUserSortFields>) {
    return this.client.post<IUsersResponse>(`/users/search`, params)
  }

  async fetchPermitApplications(params?: TSearchParams<EPermitApplicationSortFields>) {
    return this.client.post<IJurisdictionPermitApplicationResponse>(`/permit_applications/search`, params)
  }

  async fetchJurisdictionPermitApplications(jurisdictionId, params?: TSearchParams<EPermitApplicationSortFields>) {
    return this.client.post<IJurisdictionPermitApplicationResponse>(
      `/jurisdictions/${jurisdictionId}/permit_applications/search`,
      params
    )
  }

  async createPermitApplication(params: TCreatePermitApplicationFormData) {
    return this.client.post<ApiResponse<IPermitApplication>>("/permit_applications", { permitApplication: params })
  }

  async createRequirementBlock(params: IRequirementBlockParams) {
    return this.client.post<IRequirementBlockResponse>(`/requirement_blocks`, { requirementBlock: params })
  }

  async updateRequirementBlock(id: string, params: Partial<IRequirementBlockParams>) {
    return this.client.put<IRequirementBlockResponse>(`/requirement_blocks/${id}`, { requirementBlock: params })
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

  async fetchAutoComplianceModuleOptions() {
    return this.client.get<ApiResponse<TAutoComplianceModuleOptions>>(
      "/requirement_blocks/auto_compliance_module_options"
    )
  }

  async updatePermitApplication(id, params) {
    return this.client.patch<ApiResponse<IPermitApplication>>(`/permit_applications/${id}`, {
      permitApplication: params,
    })
  }

  async submitPermitApplication(id, params) {
    return this.client.post<ApiResponse<IPermitApplication>>(`/permit_applications/${id}/submit`, {
      permitApplication: params,
    })
  }

  async fetchRequirementTemplates(params?: TSearchParams<ERequirementTemplateSortFields>) {
    return this.client.post<IRequirementTemplateResponse>(`/requirement_templates/search`, params)
  }

  async fetchRequirementTemplate(id: string) {
    return this.client.get<IApiResponse<IRequirementTemplate, {}>>(`/requirement_templates/${id}`)
  }

  async createRequirementTemplate(params: TCreateRequirementTemplateFormData) {
    return this.client.post<ApiResponse<IRequirementTemplate>>(`/requirement_templates`, {
      requirementTemplate: params,
    })
  }

  async updateRequirementTemplate(templateId: string, params: IRequirementTemplateUpdateParams) {
    return this.client.put<ApiResponse<IRequirementTemplate>>(`/requirement_templates/${templateId}`, {
      requirementTemplate: params,
    })
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

  async fetchSiteOptions(address: string, pid: string = null) {
    return this.client.get<IOptionResponse>(`/geocoder/site_options`, { address, pid })
  }

  async fetchGeocodedJurisdiction(siteId: string, pid: string = null) {
    return this.client.get<IOptionResponse>(`/geocoder/jurisdiction`, { siteId, pid })
  }

  async fetchPids(siteId: string) {
    return this.client.get<ApiResponse<string>>(`/geocoder/pids`, { siteId })
  }

  async destroyRequirementTemplate(id) {
    return this.client.delete<ApiResponse<IRequirementTemplate>>(`/requirement_templates/${id}`)
  }

  async restoreRequirementTemplate(id) {
    return this.client.patch<ApiResponse<IRequirementTemplate>>(`/requirement_templates/${id}/restore`)
  }

  async fetchTemplateVersions(activityId?: string) {
    return this.client.get<ApiResponse<ITemplateVersion[]>>(`/template_versions`, { activityId })
  }

  async fetchTemplateVersion(id: string) {
    return this.client.get<ApiResponse<ITemplateVersion>>(`/template_versions/${id}`)
  }

  async fetchJurisdictionTemplateVersionCustomization(templateId: string, jurisdictionId: string) {
    return this.client.get<ApiResponse<IJurisdictionTemplateVersionCustomization>>(
      `/template_versions/${templateId}/jurisdictions/${jurisdictionId}/jurisdiction_template_version_customization`
    )
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

  async fetchStepCodes() {
    return this.client.get<ApiResponse<IStepCode[]>>("/step_codes")
  }

  async createStepCode(stepCode: IStepCode) {
    return this.client.post<ApiResponse<IStepCode>>("/step_codes", { stepCode })
  }

  async deleteStepCode(id: string) {
    return this.client.delete<ApiResponse<IStepCode>>(`/step_codes/${id}`)
  }

  async fetchStepCodeChecklist(id: string) {
    return this.client.get<ApiResponse<IStepCodeChecklist>>(`/step_code_checklists/${id}`)
  }

  async updateStepCodeChecklist(id: string, stepCodeChecklist: IStepCodeChecklist) {
    return this.client.patch<ApiResponse<IStepCode>>(`/step_code_checklists/${id}`, { stepCodeChecklist })
  }

  async fetchSiteConfiguration() {
    return this.client.get<ApiResponse<ISiteConfiguration>>(`/site_configuration`, {})
  }

  async updateSiteConfiguration(siteConfiguration) {
    return this.client.put<ApiResponse<ISiteConfiguration>>(`/site_configuration`, { siteConfiguration })
  }

  async updateUser(id: string, user: IUser) {
    return this.client.patch<ApiResponse<IUser>>(`/users/${id}`, { user })
  }

  async createContact(params: TCreateContactFormData) {
    return this.client.post<ApiResponse<IContact>>("/contacts", { contact: params })
  }
}
