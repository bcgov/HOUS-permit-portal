import { t } from "i18next"
import { Instance, SnapshotIn, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { INPUT_CONTACT_KEYS } from "../stores/contact-store"
import { EPermitApplicationStatus, ERequirementChangeAction, ERequirementType } from "../types/enums"
import {
  ICompareRequirementsBoxData,
  ICompareRequirementsBoxDiff,
  IContact,
  IDownloadableFile,
  IFormIOBlock,
  IFormJson,
  ISubmissionData,
  ITemplateCustomization,
  ITemplateVersionDiff,
} from "../types/types"
import { combineComplianceHints, combineDiff } from "../utils/formio-component-traversal"
import { convertPhoneNumberToFormioFormat } from "../utils/utility-functions"
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
    fullAddress: types.maybeNull(types.string), //for now some seeds will not have this
    pin: types.maybeNull(types.string), //for now some seeds will not have this
    pid: types.maybeNull(types.string), //for now some seeds will not have this
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
    viewedAt: types.maybeNull(types.Date),
    selectedTabIndex: types.optional(types.number, 0),
    createdAt: types.Date,
    updatedAt: types.Date,
    stepCode: types.maybeNull(types.reference(StepCodeModel)),
    supportingDocuments: types.maybeNull(types.frozen<IDownloadableFile[]>()),
    zipfileSize: types.maybeNull(types.number),
    zipfileName: types.maybeNull(types.string),
    zipfileUrl: types.maybeNull(types.string),
    referenceNumber: types.maybeNull(types.string),
    isFullyLoaded: types.optional(types.boolean, false),
    isDirty: types.optional(types.boolean, false),
    isLoading: types.optional(types.boolean, false),
    indexedUsingCurrentTemplateVersion: types.maybeNull(types.boolean),
    showingCompareAfter: types.optional(types.boolean, false),
    diff: types.maybeNull(types.frozen<ITemplateVersionDiff>()),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
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
      //merge the formattedComliance data.  This should trigger a form redraw when it is updated
      const complianceHintedFormJson = combineComplianceHints(
        self.formJson,
        self.formCustomizations,
        self.formattedComplianceData
      )
      const diffColoredFormJson = combineDiff(complianceHintedFormJson, self.diff)
      return diffColoredFormJson
    },
    sectionKey(sectionId) {
      return `section${sectionId}`
    },
    blockKey(sectionId, blockId) {
      return `formSubmissionDataRSTsection${sectionId}|RB${blockId}`
    },
    get isSubmitted() {
      return self.status === EPermitApplicationStatus.submitted
    },
    get isDraft() {
      return self.status === EPermitApplicationStatus.draft
    },
    get isViewed() {
      return self.viewedAt !== null
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
    setSubmissionData(newData: SnapshotIn<ISubmissionData>) {
      self.submissionData = newData
      self.isDirty = true
    },
    setIsDirty(isDirty: boolean) {
      self.isDirty = true
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
    get formDiffKey() {
      return R.isNil(self.diff) ? `${self.templateVersion.id}` : `${self.templateVersion.id}-diff`
    },
    get statusTagText() {
      if (self.status === EPermitApplicationStatus.submitted && self.isViewed) {
        return t("permitApplication.viewed")
      }

      return self.status
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
      self.isLoading = true
      const response = yield self.environment.api.updatePermitApplication(self.id, params)
      if (response.ok) {
        const { data: permitApplication } = response.data
        if (!autosave) {
          self.rootStore.permitApplicationStore.mergeUpdate(permitApplication, "permitApplicationMap")
        }
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

    markAsViewed: flow(function* () {
      const response = yield self.environment.api.viewPermitApplication(self.id)
      if (response.ok) {
        const { data: permitApplication } = response.data
        self.viewedAt = permitApplication.viewedAt
      }
      return response.ok
    }),

    setSelectedTabIndex: (index: number) => {
      self.selectedTabIndex = index
    },

    resetCompareAfter: () => {
      self.showingCompareAfter = false
    },

    updateContactInSubmissionSection: (requirementKey: string, contact: IContact, submissionState: any) => {
      const sectionKey = requirementKey.split("|")[0].slice(21, 64)
      const newSectionFields = {}
      INPUT_CONTACT_KEYS.forEach((contactField) => {
        let newValue = ["cell", "phone"].includes(contactField)
          ? // The normalized phone number starts with +1... (country code)
            convertPhoneNumberToFormioFormat(contact[contactField] as string)
          : contact[contactField] || ""
        newSectionFields[`${requirementKey}|${contactField}`] = newValue
      })

      const newData = {
        data: {
          ...submissionState.data,
          [sectionKey]: {
            ...submissionState.data[sectionKey],
            ...newSectionFields,
          },
        },
      }
      self.setSubmissionData(newData)
    },
    updateContactInSubmissionDatagrid: (
      requirementPrefix: string,
      index: number,
      contact: IContact,
      submissionState: any
    ) => {
      const parts = requirementPrefix.split("|")
      const contactType = parts[parts.length - 1]
      const requirementKey = parts.slice(0, -1).join("|")
      const sectionKey = requirementKey.split("|")[0].slice(21, 64)

      const newContactElement = {}
      INPUT_CONTACT_KEYS.forEach((contactField) => {
        // The normalized phone number starts with +1... (country code)
        let newValue = ["cell", "phone"].includes(contactField)
          ? convertPhoneNumberToFormioFormat(contact[contactField] as string)
          : contact[contactField]
        newContactElement[`${requirementKey}|${contactType}|${contactField}`] = newValue
      })
      const clonedArray = R.clone(submissionState.data?.[sectionKey]?.[requirementKey] ?? [])
      clonedArray[index] = newContactElement
      const newSectionFields = {
        [requirementKey]: clonedArray,
      }
      const newData = {
        data: {
          ...submissionState.data,
          [sectionKey]: {
            ...submissionState.data[sectionKey],
            ...newSectionFields,
          },
        },
      }
      self.setSubmissionData(newData)
    },
  }))

export interface IPermitApplication extends Instance<typeof PermitApplicationModel> {}
