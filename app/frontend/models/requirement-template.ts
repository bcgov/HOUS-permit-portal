import { addDays, isAfter, isSameDay, max } from "date-fns"
import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { ERequirementTemplateStatus, ETemplateVerionStatus } from "../types/enums"
import { IActivity, IPermitType } from "./permit-classification"
import { RequirementTemplateSectionModel } from "./requirement-template-section"
import { TemplateVersionModel } from "./template-version"

function preProcessor(snapshot) {
  const processedSnapShot = {
    ...snapshot,
    scheduledTemplateVersions: snapshot.templateVersions
      ?.filter((version) => version.status === ETemplateVerionStatus.scheduled)
      .map((version) => version.id),
    publishedTemplateVersion: snapshot.publishedTemplateVersion?.id,
  }

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
      jurisdictionsSize: types.optional(types.number, 0),
      publishedTemplateVersion: types.maybeNull(types.safeReference(TemplateVersionModel)),
      scheduledTemplateVersions: types.array(types.safeReference(TemplateVersionModel)),
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
      get nextAvailableScheduleDate() {
        const tomorrow = addDays(new Date(), 1)

        if (self.scheduledTemplateVersions.length === 0) {
          return tomorrow
        }
        const latestDate = max(self.scheduledTemplateVersions.map((version) => version.versionDate))

        if (isAfter(latestDate, tomorrow) || isSameDay(latestDate, tomorrow)) {
          return addDays(latestDate, 1)
        } else {
          return tomorrow
        }
      },
      hasRequirementSection(id: string) {
        return self.requirementTemplateSectionMap.has(id)
      },
      getRequirementSectionById(id: string) {
        return self.requirementTemplateSectionMap.get(id)
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
