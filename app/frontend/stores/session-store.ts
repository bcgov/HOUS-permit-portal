import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

export const SessionStoreModel = types
  .model("SessionStoreModel")
  .props({
    loggedIn: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({
    resetAuth: flow(function* () {
      self.loggedIn = false
    }),
  }))
  .actions((self) => ({
    handleLogin(response, opts = { redirectToRoot: false }) {
      if (response.ok) {
        const user = response.data.data
        self.loggedIn = true
        self.rootStore.userStore.setCurrentUser(user)
        if (opts.redirectToRoot) window.location.replace("/")
        return true
      }
      return false
    },
    handleForgotPasswordRequest: flow(function* (params) {
      const response = yield self.environment.api.requestPasswordReset(params)
      if (response.ok) {
        return true
      }
    }),
  }))
  .actions((self) => ({
    validateToken: flow(function* () {
      const response: any = yield self.environment.api.validateToken() // now try to validate this with the server
      self.handleLogin(response)
    }),
    login: flow(function* (username, password) {
      const response: any = yield self.environment.api.login(username, password)
      return self.handleLogin(response)
    }),
    logout: flow(function* () {
      const response: any = yield self.environment.api.logout()
      if (response.ok) {
        self.resetAuth()
      }
    }),
    requestPasswordReset: flow(function* (params) {
      const response = yield self.environment.api.requestPasswordReset(params)
      return response.ok
    }),
    resetPassword: flow(function* (params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.resetPassword(params))
      if (ok) {
        window.location.replace(response.meta.redirectUrl)
      }
    }),
  }))

export interface ISessionStore extends Instance<typeof SessionStoreModel> {}
