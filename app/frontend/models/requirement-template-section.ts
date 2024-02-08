import { Instance, types } from "mobx-state-tree"
import { TemplateSectionBlockModel } from "./template-section-block"

function preProcessor(snapshot) {
  const processedSnapShot = { ...snapshot }

  if (snapshot.templateSectionBlocks) {
    processedSnapShot.templateSectionBlockMap = snapshot.templateSectionBlocks.reduce((acc, sectionBlock) => {
      acc[sectionBlock.id] = sectionBlock
      return acc
    }, {})
    processedSnapShot.sortedTemplateSectionBlocks = snapshot.templateSectionBlocks.map(
      (sectionBlock) => sectionBlock.id
    )
  }
  return processedSnapShot
}

export const RequirementTemplateSectionModel = types.snapshotProcessor(
  types
    .model("RequirementTemplateSectionModel", {
      id: types.identifier,
      name: types.maybeNull(types.string),
      templateSectionBlockMap: types.map(TemplateSectionBlockModel),
      sortedTemplateSectionBlocks: types.array(types.safeReference(TemplateSectionBlockModel)),
    })
    .views((self) => ({
      hasTemplateSectionBlock(id: string) {
        return self.templateSectionBlockMap.has(id)
      },
      getTemplateSectionBlockById(id: string) {
        return self.templateSectionBlockMap.get(id)
      },
    })),
  { preProcessor }
)

export interface IRequirementTemplateSectionModel extends Instance<typeof RequirementTemplateSectionModel> {}
