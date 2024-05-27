import { addDays, isAfter, isSameDay, max, startOfDay } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"
import { Instance, flow, toGenerator, types } from "mobx-state-tree"
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
    publishedTemplateVersion: snapshot.publishedTemplateVersion?.id,
  }

  if (Array.isArray(snapshot.templateVersions)) {
    const statusToTemplateVersions =
      snapshot.templateVersions.reduce((acc, version) => {
        if (!acc[version.status]) {
          acc[version.status] = []
        }

        acc[version.status].push(version.id)

        return acc
      }, {}) ?? {}

    processedSnapShot.scheduledTemplateVersions = statusToTemplateVersions[ETemplateVersionStatus.scheduled]
    processedSnapShot.deprecatedTemplateVersions = statusToTemplateVersions[ETemplateVersionStatus.deprecated]
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
      description: types.maybeNull(types.string),
      jurisdictionsSize: types.optional(types.number, 0),
      publishedTemplateVersion: types.maybeNull(types.safeReference(TemplateVersionModel)),
      scheduledTemplateVersions: types.array(types.safeReference(TemplateVersionModel)),
      deprecatedTemplateVersions: types.array(types.safeReference(TemplateVersionModel)),
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
      getScheduledTemplateVersionById(id: string) {
        return self.scheduledTemplateVersions.find((version) => version.id === id)
      },
      get lastThreeDeprecatedTemplateVersions() {
        return self.deprecatedTemplateVersions.slice(0, 3)
      },
    }))
    .actions((self) => ({
      addDeprecatedTemplateVersionReference(templateVersionId: string) {
        self.deprecatedTemplateVersions.unshift(templateVersionId)
        self.deprecatedTemplateVersions.sort((a, b) => b.versionDate.getTime() - a.versionDate.getTime())
      },
      removeScheduledTemplateVersion(templateVersionId: string) {
        const templateVersion = self.getScheduledTemplateVersionById(templateVersionId)

        if (!templateVersion) {
          return
        }
        self.scheduledTemplateVersions.remove(templateVersion)
      },
    }))
    .actions((self) => ({
      unscheduleTemplateVersion: flow(function* (templateVersionId: string) {
        const templateVersion = self.getScheduledTemplateVersionById(templateVersionId)

        if (!templateVersion) {
          return false
        }

        const updateSuccessful = yield* toGenerator(templateVersion.unschedule())

        if (updateSuccessful) {
          self.addDeprecatedTemplateVersionReference(templateVersionId)
          self.removeScheduledTemplateVersion(templateVersionId)
        }

        return updateSuccessful
      }),
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
