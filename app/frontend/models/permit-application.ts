import { t } from "i18next"
import { Instance, cast, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitApplicationStatus, ERequirementChangeAction, ERequirementType } from "../types/enums"
import {
  ICompareRequirementsBoxData,
  ICompareRequirementsBoxDiff,
  IDownloadableFile,
  IFormIOBlock,
  IFormJson,
  IPermitApplicationSupportingDocumentsUpdate,
  ISubmissionData,
  ISubmissionVersion,
  ITemplateCustomization,
  ITemplateVersionDiff,
} from "../types/types"
import {
  combineChangeMarkers,
  combineComplianceHints,
  combineDiff,
  combineRevisionAnnotations,
  combineRevisionButtons,
} from "../utils/formio-component-traversal"

import { format } from "date-fns"
import { compareSubmissionData } from "../utils/formio-helpers"
import { JurisdictionModel } from "./jurisdiction"
import { IActivity, IPermitType } from "./permit-classification"
import { IRequirement } from "./requirement"
import { StepCodeModel } from "./step-code"
import { TemplateVersionModel } from "./template-version"
import { UserModel } from "./user"

export const PermitApplicationModel = types
  .model("PermitApplicationModel", {
    id: types.identifier,
    nickname: types.string,
    number: types.string,
    fullAddress: types.maybeNull(types.string), // for now some seeds will not have this
    pin: types.maybeNull(types.string), // for now some seeds will not have this
    pid: types.maybeNull(types.string), // for now some seeds will not have this
    permitType: types.frozen<IPermitType>(),
    activity: types.frozen<IActivity>(),
    status: types.enumeration(Object.values(EPermitApplicationStatus)),
    submitter: types.maybe(types.reference(types.late(() => UserModel))),
    jurisdiction: types.maybe(types.reference(types.late(() => JurisdictionModel))),
    templateVersion: types.maybeNull(types.reference(types.late(() => TemplateVersionModel))),
    publishedTemplateVersion: types.maybeNull(types.reference(types.late(() => TemplateVersionModel))),
    formJson: types.maybeNull(types.frozen<IFormJson>()),
    submissionData: types.maybeNull(types.frozen<ISubmissionData>()),
    formattedComplianceData: types.maybeNull(types.frozen()),
    formCustomizations: types.maybeNull(types.frozen<ITemplateCustomization>()),
    submittedAt: types.maybeNull(types.Date),
    resubmittedAt: types.maybeNull(types.Date),
    revisionsRequestedAt: types.maybeNull(types.Date),
    selectedTabIndex: types.optional(types.number, 0),
    createdAt: types.Date,
    updatedAt: types.Date,
    stepCode: types.maybeNull(types.reference(StepCodeModel)),
    supportingDocuments: types.maybeNull(types.frozen<IDownloadableFile[]>()),
    zipfileSize: types.maybeNull(types.number),
    zipfileName: types.maybeNull(types.string),
    zipfileUrl: types.maybeNull(types.string),
    referenceNumber: types.maybeNull(types.string),
    missingPdfs: types.maybeNull(types.array(types.string)),
    isFullyLoaded: types.optional(types.boolean, false),
    isDirty: types.optional(types.boolean, false),
    isLoading: types.optional(types.boolean, false),
    indexedUsingCurrentTemplateVersion: types.maybeNull(types.boolean),
    showingCompareAfter: types.optional(types.boolean, false),
    revisionMode: types.optional(types.boolean, false),
    diff: types.maybeNull(types.frozen<ITemplateVersionDiff>()),
    submissionVersions: types.array(types.frozen<ISubmissionVersion>()),
    selectedPastSubmissionVersion: types.maybeNull(types.frozen<ISubmissionVersion>()),
    isViewingPastRequests: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get isDraft() {
      return (
        self.status === EPermitApplicationStatus.newDraft || self.status === EPermitApplicationStatus.revisionsRequested
      )
    },
    get isSubmitted() {
      return (
        self.status === EPermitApplicationStatus.newlySubmitted || self.status === EPermitApplicationStatus.resubmitted
      )
    },
    get isRevisionsRequested() {
      return self.status === EPermitApplicationStatus.revisionsRequested
    },
    get isResubmitted() {
      return self.status === EPermitApplicationStatus.resubmitted
    },
    get sortedSubmissionVersions() {
      return self.submissionVersions.slice().sort((a, b) => b.createdAt - a.createdAt)
    },
  }))
  .views((self) => ({
    get latestSubmissionVersion() {
      if (self.submissionVersions?.length === 0) {
        return null
      }
      return self.sortedSubmissionVersions[0]
    },
  }))
  .views((self) => ({
    get previousSubmissionVersion() {
      if (self.submissionVersions.length <= 1) {
        return null
      }
      return self.sortedSubmissionVersions[1]
    },
    get previousToSelectedSubmissionVersion() {
      if (!self.selectedPastSubmissionVersion) return null

      // Find the index of the selected version
      const selectedIndex = self.sortedSubmissionVersions.findIndex(
        (version) => version.createdAt === self.selectedPastSubmissionVersion?.createdAt
      )

      // Return the previous version if it exists
      return selectedIndex > 0 ? self.sortedSubmissionVersions[selectedIndex - 1] : null
    },
    get latestRevisionRequests() {
      return (self.latestSubmissionVersion?.revisionRequests || []).slice().sort((a, b) => a.createdAt - b.createdAt)
    },
  }))
  .views((self) => ({
    get pastSubmissionVersionOptions() {
      const latestVersion = self.latestSubmissionVersion
      return self.submissionVersions
        .filter((submissionVersion) => submissionVersion.id !== latestVersion?.id)
        .map((submissionVersion) => ({
          label: format(submissionVersion.createdAt, "MMMM d, yyyy 'at' h:mma"),
          value: submissionVersion,
        }))
    },
    get isViewed() {
      return self.latestSubmissionVersion?.viewedAt
    },
    get viewedAt() {
      return self.latestSubmissionVersion?.viewedAt
    },
    get usingCurrentTemplateVersion() {
      if (self.templateVersion) return self.templateVersion.id == self.publishedTemplateVersion.id
      return self.indexedUsingCurrentTemplateVersion
    },
    get jurisdictionName() {
      return self.jurisdiction.name
    },
    get permitTypeAndActivity() {
      return `${self.activity.name} - ${self.permitType.name}`.trim()
    },
    get flattenedBlocks() {
      return self.formJson.components
        .reduce((acc, section) => {
          const blocks = section.components
          return acc.concat(blocks)
        }, [] as IFormIOBlock[])
        .filter((outNull) => outNull)
    },
    get formattedFormJson() {
      const clonedFormJson = R.clone(self.formJson)
      const revisionAnnotatedFormJson = combineRevisionAnnotations(clonedFormJson, self.latestRevisionRequests)
      //merge the formattedComliance data.  This should trigger a form redraw when it is updated
      const complianceHintedFormJson = combineComplianceHints(
        revisionAnnotatedFormJson,
        self.formCustomizations,
        self.formattedComplianceData
      )
      const diffColoredFormJson = combineDiff(complianceHintedFormJson, self.diff)

      const revisionRequestsToUse = self.isViewingPastRequests
        ? self.selectedPastSubmissionVersion?.revisionRequests
        : self.latestRevisionRequests

      let changedKeys = []
      if (self.isViewingPastRequests && self.selectedPastSubmissionVersion) {
        changedKeys = compareSubmissionData(
          self.previousToSelectedSubmissionVersion?.submissionData,
          self.selectedPastSubmissionVersion?.submissionData
        )
      } else if (self.previousSubmissionVersion) {
        changedKeys = compareSubmissionData(
          self.previousSubmissionVersion.submissionData,
          self.latestSubmissionVersion.submissionData
        )
      }
      const changedMarkedFormJson = combineChangeMarkers(diffColoredFormJson, self.isSubmitted, changedKeys)

      const revisionModeFormJson =
        self.revisionMode || self.isRevisionsRequested
          ? combineRevisionButtons(changedMarkedFormJson, self.isSubmitted, revisionRequestsToUse)
          : diffColoredFormJson

      return revisionModeFormJson
    },
    sectionKey(sectionId) {
      return `section${sectionId}`
    },
    blockKey(sectionId, blockId) {
      return `formSubmissionDataRSTsection${sectionId}|RB${blockId}`
    },
    get diffToInfoBoxData(): ICompareRequirementsBoxDiff | null {
      if (!self.diff) return null

      const mapFn = (req: IRequirement, action: ERequirementChangeAction): ICompareRequirementsBoxData => {
        return {
          label: t("requirementTemplate.compareAction", {
            requirementName: `${req.label}${req.elective ? ` (${t("requirementsLibrary.elective")})` : ""}`,
            action: t(`requirementTemplate.${action}`),
          }),
          class: `formio-component-${req.formJson.key}`,
          diffSectionLabel: req.diffSectionLabel,
        }
      }
      const addedErrorBoxData = self.diff.added.map((req) => mapFn(req, ERequirementChangeAction.added))
      const removedErrorBoxData = self.diff.removed.map((req) => mapFn(req, ERequirementChangeAction.removed))
      const changedErrorBoxData = self.diff.changed.map((req) => mapFn(req, ERequirementChangeAction.changed))
      return { added: addedErrorBoxData, removed: removedErrorBoxData, changed: changedErrorBoxData }
    },
  }))
  .actions((self) => ({
    setRevisionMode(revisionMode: boolean) {
      self.revisionMode = revisionMode
    },
    setSelectedPastSubmissionVersion(submissionVersion: ISubmissionVersion) {
      self.selectedPastSubmissionVersion = submissionVersion
    },
    setIsViewingPastRequests(isViewingPastRequests: boolean) {
      self.isViewingPastRequests = isViewingPastRequests
    },
    setIsDirty(isDirty: boolean) {
      self.isDirty = isDirty
    },
    resetDiff() {
      self.showingCompareAfter = false
      self.diff = null
    },
  }))
  .views((self) => ({
    shouldShowApplicationDiff(isEditing: boolean) {
      return isEditing && (!self.usingCurrentTemplateVersion || self.showingCompareAfter)
    },
    get shouldShowNewVersionWarning() {
      return !self.usingCurrentTemplateVersion && self.isDraft
    },
    get formFormatKey() {
      return (
        (R.isNil(self.diff) ? `${self.templateVersion.id}` : `${self.templateVersion.id}-diff`) +
        (self.revisionMode ? "-revision" : "") +
        (self.selectedPastSubmissionVersion
          ? `-past-submission-version-${self.selectedPastSubmissionVersion.id}`
          : "") +
        (self.isViewingPastRequests ? "-past-requests" : "")
      )
    },
    indexOfBlockId: (blockId: string) => {
      if (blockId === "formio-component-section-signoff-key") return self.flattenedBlocks.length - 1
      return self.flattenedBlocks.findIndex((block) => block.id === blockId)
    },
    getBlockClass(sectionId, blockId) {
      // 'formio-component-formSubmissionDataRSTsection61ba21b8-dc61-4a4a-9765-901cd4b53b3b|RBdc9d3ab2-fce8-40a0-ba94-14404c0c079b'
      return `formio-component-${blockId === "section-signoff-id" ? "section-signoff-key" : self.blockKey(sectionId, blockId)}`
    },
    get blockClasses() {
      return self.flattenedBlocks.map((b) => `formio-component-${b.key}`)
    },
    get contacts() {
      // traverses the nest form json components
      // and collects the label for contact requirements
      const contactKeyToLabelMapping = R.pipe(
        R.prop("components"),
        R.chain(R.prop("components")),
        R.chain(R.prop("components")),
        R.reduce((acc, { id, key, title, components, label }) => {
          if (key.includes("multi_contact")) {
            const firstComponent = components[0]

            if (firstComponent) {
              acc[firstComponent.key] = firstComponent.label
            }
          }

          if (key.includes(ERequirementType.generalContact) || key.includes(ERequirementType.professionalContact)) {
            acc[key] = label
          }

          return acc
        }, {})
      )(self.formJson)
      // Convert each section's object into an array of [key, value] pairs
      const sectionsPairs = R.values(self.submissionData.data).map(R.toPairs)

      // Filters out non contact form components
      const getContactBlocks = (blocks) =>
        blocks.filter(
          (block) =>
            block[0].includes("multi_contact") ||
            block[0].includes(ERequirementType.generalContact) ||
            block[0].includes(ERequirementType.professionalContact)
        )

      const insertFullNameToContact = (contact: { firstName?: string; lastName?: string; name?: string }) => {
        contact.name = `${contact?.firstName ?? ""} ${contact?.lastName ?? ""}`.trim()
      }

      // Flatten one level of arrays to get a single array of [key, value] pairs
      const allContactFieldPairs = getContactBlocks(R.chain(R.identity, sectionsPairs))

      // single contact field value is not an array and they have each contact field input
      // as a separate value so we combine the individual field to an array of contact objects
      const singleContacts = Object.values(
        allContactFieldPairs
          .filter(([_key, val]) => !Array.isArray(val))
          .reduce((acc, [key, val]) => {
            const splitKey = key.split("|")
            // the end of the key is the contact input field name e.g. firstName, email etc.
            const fieldName = splitKey.pop()

            //  the rest of the key is the shared key path
            //  e.g. formSubmissionDataRSTsectioncId|RBId|owner_contact_block|multi_contact|general_contact
            const sharedKeyPath = splitKey.join("|")

            if (!(sharedKeyPath in acc)) {
              acc[sharedKeyPath] = {}
            }

            acc[sharedKeyPath][fieldName] = val

            if (!("title" in acc[sharedKeyPath])) {
              acc[sharedKeyPath].title = contactKeyToLabelMapping[sharedKeyPath]
            }

            return acc
          }, {})
      )

      singleContacts.forEach(insertFullNameToContact)

      const reformatContactObjectFromMultiContactSubmission = (contact: Record<string, string>) => {
        const formattedContactObject = {}

        Object.keys(contact).forEach((key) => {
          const splitKey = key.split("|")
          // the end of the key is the contact input field name e.g. firstName, email etc.
          const fieldName = splitKey.pop()

          formattedContactObject[fieldName] = contact[key]

          if (!("title" in formattedContactObject)) {
            const parentKey = splitKey.join("|")
            // sets the title form the parent field set
            formattedContactObject["title"] = contactKeyToLabelMapping[parentKey]
          }
        })

        insertFullNameToContact(formattedContactObject)

        return formattedContactObject
      }

      // multi contact field pairs value is an array, so we filter them out then
      // format all contacts into an array of contact objects
      const multiContacts = allContactFieldPairs
        .filter(([_key, val]) => Array.isArray(val))
        .reduce((acc, [parentKey, contactArray]) => {
          contactArray.forEach((unformattedContact) => {
            const formattedContact: Record<string, string> =
              reformatContactObjectFromMultiContactSubmission(unformattedContact)

            acc.push(formattedContact)
          })

          return acc
        }, [])

      //   returns a single array of all contacts
      return singleContacts.concat(multiContacts)
    },
  }))
  .actions((self) => ({
    __mergeUpdate: (resourceData) => {
      let jurisdiction = resourceData["jurisdiction"]
      let submitter = resourceData["submitter"]
      let templateVersion = resourceData["templateVersion"]
      let publishedTemplateVersion = resourceData["publishedTemplateVersion"]
      if (jurisdiction && typeof jurisdiction !== "string") {
        self.rootStore.jurisdictionStore.mergeUpdate(jurisdiction, "jurisdictionMap")
        jurisdiction = jurisdiction["id"]
      }
      if (submitter && typeof submitter !== "string") {
        self.rootStore.userStore.mergeUpdate(submitter, "usersMap")
        submitter = submitter["id"]
      }
      if (templateVersion && typeof templateVersion !== "string") {
        self.rootStore.templateVersionStore.mergeUpdate(templateVersion, "templateVersionMap")
        templateVersion = templateVersion["id"]
      }
      if (publishedTemplateVersion && typeof publishedTemplateVersion !== "string") {
        self.rootStore.templateVersionStore.mergeUpdate(publishedTemplateVersion, "templateVersionMap")
        publishedTemplateVersion = publishedTemplateVersion["id"]
      }
      const newData = R.mergeRight(resourceData, {
        jurisdiction,
        submitter,
        templateVersion,
        publishedTemplateVersion,
      })
      self.rootStore.permitApplicationStore.permitApplicationMap.put(newData)
    },
    setFormattedComplianceData(data: Record<string, any>) {
      self.formattedComplianceData = data
    },
    update: flow(function* ({ autosave, ...params }) {
      const response = yield self.environment.api.updatePermitApplication(self.id, params)
      if (response.ok) {
        const { data: permitApplication } = response.data
        if (!autosave) {
          self.rootStore.permitApplicationStore.mergeUpdate(permitApplication, "permitApplicationMap")
        }
      }
      return response
    }),
    updateRevisionRequests: flow(function* (params) {
      self.isLoading = true
      const response = yield self.environment.api.updateRevisionRequests(self.id, params)
      if (response.ok) {
        const { data: permitApplication } = response.data

        self.rootStore.permitApplicationStore.mergeUpdate(
          { ...permitApplication, revisionMode: true },
          "permitApplicationMap"
        )
      }
      self.isLoading = false
      return response
    }),
    fetchDiff: flow(function* () {
      const diffData = yield self.publishedTemplateVersion.fetchTemplateVersionCompare(self.templateVersion.id)
      self.diff = diffData.data
    }),
    updateVersion: flow(function* () {
      self.isLoading = true
      const retainedDiff = self.diff
      const response = yield self.environment.api.updatePermitApplicationVersion(self.id)
      if (response.ok) {
        const { data: permitApplication } = response.data
        self.rootStore.permitApplicationStore.mergeUpdate(permitApplication, "permitApplicationMap")
      }
      self.diff = retainedDiff
      self.showingCompareAfter = true
      self.isLoading = false
      return response
    }),
    submit: flow(function* (params) {
      const response = yield self.environment.api.submitPermitApplication(self.id, params)
      if (response.ok) {
        const { data: permitApplication } = response.data
        self.rootStore.permitApplicationStore.mergeUpdate(permitApplication, "permitApplicationMap")
      }
      return response.ok
    }),
    finalizeRevisionRequests: flow(function* () {
      const response = yield self.environment.api.finalizeRevisionRequests(self.id)
      if (response.ok) {
        const { data: permitApplication } = response.data
        self.rootStore.permitApplicationStore.mergeUpdate(
          { revisionMode: true, ...permitApplication },
          "permitApplicationMap"
        )
      }
      return response.ok
    }),
    markAsViewed: flow(function* () {
      const response = yield self.environment.api.viewPermitApplication(self.id)
      if (response.ok) {
        const { data: permitApplication } = response.data
        self.rootStore.permitApplicationStore.mergeUpdate(permitApplication, "permitApplicationMap")
      }
      return response.ok
    }),

    setSelectedTabIndex: (index: number) => {
      self.selectedTabIndex = index
    },

    resetCompareAfter: () => {
      self.showingCompareAfter = false
    },

    generateMissingPdfs: flow(function* () {
      const response = yield self.environment.api.generatePermitApplicationMissingPdfs(self.id)
      return response.ok
    }),
  }))
  .actions((self) => ({
    handleSocketSupportingDocsUpdate: (data: IPermitApplicationSupportingDocumentsUpdate) => {
      self.missingPdfs = cast(data.missingPdfs)
      self.supportingDocuments = data.supportingDocuments
      self.zipfileSize = data.zipfileSize
      self.zipfileName = data.zipfileName
      self.zipfileUrl = data.zipfileUrl
    },
    generateMissingPdfs: flow(function* () {
      const response = yield self.environment.api.generatePermitApplicationMissingPdfs(self.id)
      return response.ok
    }),
  }))
  .actions((self) => ({
    handleSocketSupportingDocsUpdate: (data: IPermitApplicationSupportingDocumentsUpdate) => {
      self.missingPdfs = cast(data.missingPdfs)
      self.supportingDocuments = data.supportingDocuments
      self.zipfileSize = data.zipfileSize
      self.zipfileName = data.zipfileName
      self.zipfileUrl = data.zipfileUrl
    },
  }))

export const reasonCodes = [
  "non_compliant",
  "conflicting_inaccurate",
  "insufficient_detail",
  "incorrect_format",
  "missing_documentation",
  "outdated",
  "inapplicable",
  "missing_signatures",
  "incorrect_calculations",
  "other",
]

export interface IPermitApplication extends Instance<typeof PermitApplicationModel> {}
