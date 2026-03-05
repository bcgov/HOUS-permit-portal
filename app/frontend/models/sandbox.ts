import { t } from "i18next"
import { Instance, types } from "mobx-state-tree"
import { ETemplateVersionStatus } from "../types/enums"

export const SandboxModel = types
  .model("SandboxModel")
  .props({
    id: types.identifier,
    templateVersionStatusScope: types.enumeration(Object.values(ETemplateVersionStatus)),
    jurisdictionId: types.string,
  })
  .views((self) => ({
    get name(): string {
      return t(`sandbox.scopeLabels.${self.templateVersionStatusScope}` as const)
    },
    get description(): string {
      return t(`sandbox.scopeDescriptions.${self.templateVersionStatusScope}` as const)
    },
  }))

export interface ISandbox extends Instance<typeof SandboxModel> {}
