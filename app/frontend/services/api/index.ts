import { ApiResponse, ApisauceInstance, create, Monitor } from "apisauce"
import { IJurisdiction } from "../../models/jurisdiction"
import { IUser } from "../../models/user"
import { IRequirementBlockParams, ITagSearchParams } from "../../types/api-request"
import {
  IAcceptInvitationResponse,
  IJurisdictionResponse,
  IJurisdictionUserResponse,
  IRequirementBlockResponse,
  IResetPasswordResponse,
  IUserResponse,
} from "../../types/api-responses"
import { EJurisdictionSortFields, ERequirementLibrarySortFields, EUserSortFields } from "../../types/enums"
import { ISort } from "../../types/types"
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

  async fetchJurisdictions(params?: {
    sort?: ISort<EJurisdictionSortFields>
    query?: string
    page?: number
    perPage?: number
  }) {
    return this.client.post<IJurisdictionResponse>("/jurisdictions/search", params)
  }

  async fetchJurisdiction(id) {
    return this.client.get<ApiResponse<IJurisdiction>>(`/jurisdictions/${id}`)
  }

  async fetchRequirementBlocks(params?: {
    sort?: ISort<ERequirementLibrarySortFields>
    query?: string
    page?: number
    perPage?: number
  }) {
    return this.client.post<IRequirementBlockResponse>("/requirement_blocks/search", params)
  }

  async fetchJurisdictionUsers(
    jurisdictionId,
    params?: {
      sort?: ISort<EUserSortFields>
      query?: string
      page?: number
      perPage?: number
    }
  ) {
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
}
