import { ApiResponse, ApisauceInstance, create, Monitor } from "apisauce"
import { TCreateRequirementTemplateFormData } from "../../components/domains/requirement-template/new-requirement-tempate-screen"
import { IJurisdiction } from "../../models/jurisdiction"
import { IPermitApplication } from "../../models/permit-application"
import { IRequirementTemplate } from "../../models/requirement-template"
import { IUser } from "../../models/user"
import { IRequirementBlockParams, ITagSearchParams } from "../../types/api-request"
import {
  IAcceptInvitationResponse,
  IJurisdictionResponse,
  IJurisdictionUserResponse,
  IOptionResponse,
  IRequirementBlockResponse,
  IRequirementTemplateResponse,
  IResetPasswordResponse,
  IUserResponse,
} from "../../types/api-responses"
import {
  EJurisdictionSortFields,
  ERequirementLibrarySortFields,
  ERequirementTemplateSortFields,
  EUserSortFields,
} from "../../types/enums"
import { TSearchParams } from "../../types/types"
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

  async login(username, password) {
    return this.client.post<IUserResponse>("/login", { user: { username, password } })
  }

  async signUp(formData) {
    return this.client.post<IUserResponse>("/signup", { user: formData })
  }

  async logout() {
    return this.client.delete("/logout")
  }

  async changePassword(params) {
    return this.client.patch<IUserResponse>(`/users/change_password`, params)
  }

  async requestPasswordReset(params) {
    return this.client.post("/password", { user: params })
  }

  async resetPassword(params) {
    return this.client.put<IResetPasswordResponse>("/password", { user: params })
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

  async fetchJurisdictions(params?: TSearchParams<EJurisdictionSortFields>) {
    return this.client.post<IJurisdictionResponse>("/jurisdictions/search", params)
  }

  async fetchJurisdiction(id) {
    return this.client.get<ApiResponse<IJurisdiction>>(`/jurisdictions/${id}`)
  }

  async fetchLocalityTypeOptions() {
    return this.client.get<IOptionResponse>(`/jurisdictions/locality_type_options`)
  }

  async fetchPermitTypeOptions() {
    return this.client.get<IOptionResponse>(`/permit_classifications/permit_type_options`)
  }

  async fetchActivityOptions() {
    return this.client.get<IOptionResponse>(`/permit_classifications/activity_options`)
  }

  async createJurisdiction(params) {
    return this.client.post<ApiResponse<IJurisdiction>>("/jurisdictions", { jurisdiction: params })
  }

  async fetchRequirementBlocks(params?: TSearchParams<ERequirementLibrarySortFields>) {
    return this.client.post<IRequirementBlockResponse>("/requirement_blocks/search", params)
  }

  async fetchJurisdictionUsers(jurisdictionId, params?: TSearchParams<EUserSortFields>) {
    return this.client.post<IJurisdictionUserResponse>(`/jurisdictions/${jurisdictionId}/users/search`, params)
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

  async searchTags(params: Partial<ITagSearchParams>) {
    return this.client.post<string[]>(`/tags/search`, { search: params })
  }
  async fetchPermitApplications() {
    return this.client.get<ApiResponse<IPermitApplication>>(`/permit_applications`)
  }

  async fetchRequirementTemplates(params?: TSearchParams<ERequirementTemplateSortFields>) {
    return this.client.post<IRequirementTemplateResponse>(`/requirement_templates/search`, params)
  }

  async createRequirementTemplate(params: TCreateRequirementTemplateFormData) {
    return this.client.post<ApiResponse<IRequirementTemplate>>(`/requirement_templates`, {
      requirementTemplate: params,
    })
  }
}
