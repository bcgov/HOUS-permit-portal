import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { ERequirementTemplateStatus } from "../types/enums"
import { IActivity, IPermitType } from "./permit-classification"
import { RequirementTemplateSectionModel } from "./requirement-template-section"

function preProcessor(snapshot) {
  const processedSnapShot = { ...snapshot }

  if (snapshot.requirementTemplateSections) {
    processedSnapShot.requirementTemplateSectionMap = snapshot.requirementTemplateSections.reduce((acc, section) => {
      acc[section.id] = section
      return acc
    }, {})
    processedSnapShot.sortedRequirementTemplateSections = snapshot.requirementTemplateSections.map(
      (section) => section.id
    )
    processedSnapShot.isFullyLoaded = true
  }
  return processedSnapShot
}

export const RequirementTemplateModel = types.snapshotProcessor(
  types
    .model("RequirementTemplateModel", {
      id: types.identifier,
      status: types.enumeration(Object.values(ERequirementTemplateStatus)),
      description: types.maybeNull(types.string),
      version: types.maybeNull(types.string),
      jurisdictionsSize: types.optional(types.number, 0),
      permitType: types.frozen<IPermitType>(),
      activity: types.frozen<IActivity>(),
      formJson: types.frozen<IRequirementTemplateFormJson>(),
      scheduledFor: types.maybeNull(types.Date),
      discardedAt: types.maybeNull(types.Date),
      requirementTemplateSectionMap: types.map(RequirementTemplateSectionModel),
      sortedRequirementTemplateSections: types.array(types.safeReference(RequirementTemplateSectionModel)),
      createdAt: types.Date,
      updatedAt: types.Date,
      isFullyLoaded: types.optional(types.boolean, false),
    })
    .extend(withRootStore())
    .extend(withEnvironment())
    .views((self) => ({
      get isDiscarded() {
        return self.discardedAt !== null
      },
    }))
    .actions((self) => ({
      destroy: flow(function* () {
        const response = yield self.environment.api.destroyRequirementTemplate(self.id)
        return response.ok
      }),
      restore: flow(function* () {
        const response = yield self.environment.api.restoreRequirementTemplate(self.id)
        return response.ok
      }),
    })),
  {
    preProcessor,
  }
)

export interface IRequirementTemplate extends Instance<typeof RequirementTemplateModel> {}

export interface IRequirementTemplateFormJson {
  id: string
  legend: string
  key: string
  label: string
  input: boolean
  tableView: boolean
  components: any[] // Todo: define component type
}
