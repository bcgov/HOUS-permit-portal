import { Instance, types } from "mobx-state-tree"
import { ETemplateVersionStatus } from "../types/enums"

export const SandboxModel = types
  .model("SandboxModel")
  .props({
    id: types.identifier,
    name: types.string,
    description: types.maybeNull(types.string),
    templateVersionStatusScope: types.enumeration(Object.values(ETemplateVersionStatus)),
    jurisdictionId: types.string,
  })
  .views((self) => ({}))

export interface ISandbox extends Instance<typeof SandboxModel> {}
