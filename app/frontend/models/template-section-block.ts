import { Instance, types } from "mobx-state-tree"
import { RequirementBlockModel } from "./requirement-block"

function preProcessor(snapshot) {
  return { ...snapshot, requirementBlock: snapshot?.requirementBlock?.id }
}

export const TemplateSectionBlockModel = types.snapshotProcessor(
  types
    .model("TemplateSectionBlockModel", {
      id: types.identifier,
      requirementBlock: types.safeReference(RequirementBlockModel),
    })
    .views((self) => ({
      get requirementBlockId() {
        return self.requirementBlock?.id
      },
    })),
  { preProcessor }
)

export interface ITemplateSectionBlockModel extends Instance<typeof TemplateSectionBlockModel> {}
