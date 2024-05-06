import { addDays, isAfter, isSameDay, max, startOfDay } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"
import { Instance, flow, types } from "mobx-state-tree"
import { vancouverTimeZone } from "../constants"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { ETemplateVersionStatus } from "../types/enums"
import { IActivity, IPermitType } from "./permit-classification"
import { RequirementTemplateSectionModel } from "./requirement-template-section"
import { TemplateVersionModel } from "./template-version"

function preProcessor(snapshot) {
  const processedSnapShot = {
    ...snapshot,
    scheduledTemplateVersions: snapshot.templateVersions
      ?.filter((version) => version.status === ETemplateVersionStatus.scheduled)
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
      label: types.string,
      description: types.maybeNull(types.string),
      jurisdictionsSize: types.optional(types.number, 0),
      publishedTemplateVersion: types.maybeNull(types.safeReference(TemplateVersionModel)),
      scheduledTemplateVersions: types.array(types.safeReference(TemplateVersionModel)),
      permitType: types.frozen<IPermitType>(),
      activity: types.frozen<IActivity>(),
      formJson: types.frozen<IRequirementTemplateFormJson>(),
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
        // Get tomorrow's date in Vancouver time zone, starting from midnight
        const tomorrow = addDays(startOfDay(utcToZonedTime(new Date(), vancouverTimeZone)), 1)

        // If no scheduled versions are available, return tomorrow's date
        if (self.scheduledTemplateVersions.length === 0) {
          return tomorrow
        }

        // Get the latest scheduled date in Vancouver time zone
        const latestDate = max(
          self.scheduledTemplateVersions.map((version) =>
            startOfDay(utcToZonedTime(new Date(version.versionDate), vancouverTimeZone))
          )
        )

        // Compare the latest date with tomorrow
        if (isAfter(latestDate, tomorrow) || isSameDay(latestDate, tomorrow)) {
          // If the latest date is after or the same day as tomorrow, return the date after the latest date
          return addDays(latestDate, 1)
        } else {
          // Otherwise, return tomorrow's date
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
