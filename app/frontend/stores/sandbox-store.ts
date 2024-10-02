import { reaction } from "mobx"
import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { SandboxModel } from "../models/sandbox"

export const SandboxStoreModel = types
  .model("SandboxStoreModel")
  .props({
    sandboxMap: types.map(SandboxModel),
    currentSandboxId: types.maybeNull(types.string),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get currentSandbox() {
      return self.sandboxMap.get(self.currentSandboxId)
    },
    get shouldPersistSandboxId() {
      return self.rootStore.userStore.currentUser.isReviewStaff
    },
  }))
  .views((self) => ({
    get sandboxes() {
      return Array.from(self.sandboxMap.values())
    },
  }))
  .actions((self) => ({
    clearSandboxId: () => {
      self.currentSandboxId = null
    },
  }))
  .actions((self) => ({
    setCurrentSandboxId: (sandboxId: string = null) => {
      self.currentSandboxId = sandboxId
    },
  }))
  .actions((self) => ({
    afterCreate() {
      // Reaction to monitor jurisdiction changes
      reaction(
        () => self.rootStore.uiStore.currentlySelectedJurisdictionId,
        (newJurisdictionId) => {
          self.clearSandboxId()
        }
      )
    },
  }))

export interface ISandboxStore extends Instance<typeof SandboxStoreModel> {}
