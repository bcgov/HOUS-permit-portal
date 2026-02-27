import { Instance, types } from "mobx-state-tree"
import { RequirementBlockModel } from "./requirement-block"

const BlockConditionalModel = types.model("BlockConditionalModel", {
  whenBlockId: types.string,
  whenRequirementCode: types.string,
  eq: types.string,
  show: types.maybe(types.boolean),
  hide: types.maybe(types.boolean),
})

function preProcessor(snapshot) {
  return { ...snapshot, requirementBlock: snapshot?.requirementBlock?.id }
}

export const TemplateSectionBlockModel = types.snapshotProcessor(
  types
    .model("TemplateSectionBlockModel", {
      id: types.identifier,
      requirementBlock: types.safeReference(RequirementBlockModel),
      conditional: types.maybeNull(BlockConditionalModel),
    })
    .views((self) => ({
      get requirementBlockId() {
        return self.requirementBlock?.id
      },
    })),
  { preProcessor }
)

export interface ITemplateSectionBlockModel extends Instance<typeof TemplateSectionBlockModel> {}
