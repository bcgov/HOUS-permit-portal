import { Instance, types } from "mobx-state-tree"
import { RequirementBlockModel } from "./requirement-block"

function preProcessor(snapshot) {
  return { ...snapshot, requirementBlock: snapshot?.requirementBlock?.id }
}

export const TemplateSectionBlockModel = types.snapshotProcessor(
  types.model("TemplateSectionBlockModel", {
    id: types.identifier,
    requirementBlock: types.safeReference(RequirementBlockModel),
  }),
  { preProcessor }
)

export interface ITemplateSectionBlockModel extends Instance<typeof TemplateSectionBlockModel> {}
