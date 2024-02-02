import { Instance, types } from "mobx-state-tree"
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
  types.model("RequirementTemplateModel", {
    id: types.identifier,
    status: types.enumeration(Object.values(ERequirementTemplateStatus)),
    description: types.maybeNull(types.string),
    version: types.maybeNull(types.string),
    jurisdictionsSize: types.optional(types.number, 0),
    permitType: types.frozen<IPermitType>(),
    activity: types.frozen<IActivity>(),
    formJson: types.frozen<IRequirementTemplateFormJson>(),
    requirementTemplateSectionMap: types.map(RequirementTemplateSectionModel),
    sortedRequirementTemplateSections: types.array(types.safeReference(RequirementTemplateSectionModel)),
    scheduledFor: types.maybeNull(types.Date),
    createdAt: types.Date,
    updatedAt: types.Date,
    isFullyLoaded: types.optional(types.boolean, false),
  }),
  { preProcessor }
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
