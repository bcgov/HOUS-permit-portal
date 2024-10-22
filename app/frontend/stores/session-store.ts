import { flow, Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

export const SessionStoreModel = types
  .model("SessionStoreModel")
  .props({
    loggedIn: types.optional(types.boolean, false),
    tokenExpired: types.optional(types.boolean, false),
    isValidating: types.optional(types.boolean, true),
    isLoggingOut: types.optional(types.boolean, false),
    afterLoginPath: types.maybeNull(types.string),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({
    resetAuth: flow(function* () {
      self.loggedIn = false
      self.tokenExpired = false
      self.rootStore.sandboxStore.clearSandboxId()
      self.rootStore.userStore.unsetCurrentUser()
      self.rootStore.disconnectUserChannel()
    }),
    setAfterLoginPath(path: string | null) {
      self.afterLoginPath = path
    },
  }))
  .actions((self) => ({
    handleLogin(response, opts = { redirectToRoot: false }) {
      if (response.ok) {
        const user = response.data.data
        self.loggedIn = true
        self.rootStore.userStore.setCurrentUser(user)

        // connect websocket
        self.rootStore.subscribeToUserChannel()

        if (opts.redirectToRoot) window.location.replace("/")

        // Clear any temporarily set sandbox IDs for super admins
        if (!self.rootStore.sandboxStore.shouldPersistSandboxId) self.rootStore.sandboxStore.clearSandboxId()
        return true
      }
      return false
    },
  }))
  .actions((self) => ({
    validateToken: flow(function* () {
      self.isValidating = true
      const response: any = yield self.environment.api.validateToken() // now try to validate this with the server
      self.handleLogin(response)
      self.isValidating = false
    }),
    logout: flow(function* () {
      self.isLoggingOut = true
      const response: any = yield self.environment.api.logout()
      if (response.ok) {
        self.resetAuth()
      }
      // logout of siteminder / keycloak as well
      window.location.href = `${import.meta.env.VITE_SITEMINDER_LOGOUT_URL}?retnow=1&returl=${import.meta.env.VITE_KEYCLOAK_LOGOUT_URL}?redirect_uri=${import.meta.env.VITE_POST_LOGOUT_REDIRECT_URL}`
    }),
    setTokenExpired(isExpired: boolean) {
      self.tokenExpired = isExpired
    },
  }))

export interface ISessionStore extends Instance<typeof SessionStoreModel> {}
