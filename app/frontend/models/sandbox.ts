import { getParent, Instance, types } from "mobx-state-tree"
import { ETemplateVersionStatus } from "../types/enums"

export const SandboxModel = types
  .model("SandboxModel")
  .props({
    id: types.identifier,
    name: types.string,
    templateVersionStatusScope: types.enumeration(Object.values(ETemplateVersionStatus)),
  })
  .views((self) => ({
    get jurisdiction() {
      return getParent(self, 2)
    },
  }))
  .views((self) => ({}))

export interface ISandbox extends Instance<typeof SandboxModel> {}
