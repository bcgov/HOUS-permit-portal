import { reaction } from "mobx"
import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { ISandbox, SandboxModel } from "../models/sandbox"

export const SandboxStoreModel = types
  .model("SandboxStoreModel")
  .props({
    currentSandbox: types.maybeNull(types.reference(SandboxModel)),
    active: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({
    clearSandboxId: () => {
      self.currentSandbox = null

      self.environment.api.client.addRequestTransform((request) => {
        if (self.currentSandbox) {
          request.headers["X-Sandbox-ID"] = null
        }
      })
    },
  }))
  .actions((self) => ({
    setCurrentSandbox: flow(function* (sandbox: ISandbox = null) {
      if (self.active) {
        sandbox ??= self.rootStore.userStore.currentUser.jurisdiction.defaultSandbox
        self.currentSandbox = sandbox

        // Add a request interceptor to include sandbox_id in headers
        self.environment.api.client.addRequestTransform((request) => {
          if (self.currentSandbox) {
            request.headers["X-Sandbox-ID"] = self.currentSandbox
          }
        })
      } else {
        self.clearSandboxId()
      }
    }),
  }))
  .actions((self) => ({
    activate: flow(function* () {
      self.active = true
      yield self.setCurrentSandbox()
    }),
    deactivate: flow(function* () {
      self.active = false
      self.clearSandboxId()
    }),
  }))
  .actions((self) => ({
    afterCreate() {
      // Reaction to monitor jurisdiction changes
      reaction(
        () => self.rootStore.uiStore.currentlySelectedJurisdictionId,
        (newJurisdictionId) => {
          if (self.active) {
            self.setCurrentSandbox()
          }
        }
      )
    },
  }))

export interface ISandboxStore extends Instance<typeof SandboxStoreModel> {}
