import { ApisauceInstance, create, Monitor } from "apisauce"
import { IAcceptInvitationResponse, IResetPasswordResponse, IUserResponse } from "../../types/api-responses"
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
}
