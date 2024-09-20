import { flow, Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

export const SandboxStoreModel = types
  .model("SandboxStoreModel")
  .props({
    sandboxId: types.maybeNull(types.string),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({
    setSandboxId: flow(function* (sandboxId: string) {
      // Optional: Validate sandboxId format here if necessary
      self.sandboxId = sandboxId

      // Add a request interceptor to include sandbox_id in headers
      self.environment.api.client.addRequestTransform((request) => {
        if (self.sandboxId) {
          request.headers["X-Sandbox-ID"] = self.sandboxId
        }
      })
    }),
    clearSandboxId: () => {
      self.sandboxId = null

      self.environment.api.client.addRequestTransform((request) => {
        if (self.sandboxId) {
          request.headers["X-Sandbox-ID"] = null
        }
      })
    },
  }))

export interface ISandboxStore extends Instance<typeof SandboxStoreModel> {}
