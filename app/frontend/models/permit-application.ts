import { t } from "i18next"
import { Instance, SnapshotIn, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { INPUT_CONTACT_KEYS } from "../stores/contact-store"
import { EPermitApplicationStatus, ERequirementType } from "../types/enums"
import {
  IContact,
  IDownloadableFile,
  IFormIOBlock,
  IFormJson,
  ISubmissionData,
  ITemplateCustomization,
} from "../types/types"
import { combineComplianceHints } from "../utils/formio-component-traversal"
import { JurisdictionModel } from "./jurisdiction"
import { IActivity, IPermitType } from "./permit-classification"
import { StepCodeModel } from "./step-code"
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
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
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
      return combineComplianceHints(self.formJson, self.formCustomizations, self.formattedComplianceData)
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
  }))
  .actions((self) => ({
    setSubmissionData(newData: SnapshotIn<ISubmissionData>) {
      self.submissionData = newData
      self.isDirty = true
    },
    setIsDirty(isDirty: boolean) {
      self.isDirty = true
    },
  }))
  .views((self) => ({
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
      if (jurisdiction && typeof jurisdiction !== "string") {
        self.rootStore.jurisdictionStore.mergeUpdate(jurisdiction, "jurisdictionMap")
        jurisdiction = jurisdiction["id"]
      }
      if (submitter && typeof submitter !== "string") {
        self.rootStore.userStore.mergeUpdate(submitter, "usersMap")
        submitter = submitter["id"]
      }
      const newData = R.mergeRight(resourceData, {
        jurisdiction,
        submitter,
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

    updateContactInSubmissionSection: (requirementKey: string, contact: IContact) => {
      const sectionKey = requirementKey.split("|")[0].slice(21, 64)
      const newSectionFields = {}
      INPUT_CONTACT_KEYS.forEach((contactField) => {
        let newValue = ["cell", "phone"].includes(contactField)
          ? // The normalized phone number starts with +1... (country code)
            (contact[contactField] as string)?.slice(2)
          : contact[contactField] || ""
        newSectionFields[`${requirementKey}|${contactField}`] = newValue
      })
      const newData = {
        data: {
          ...self.submissionData.data,
          [sectionKey]: {
            ...self.submissionData.data[sectionKey],
            ...newSectionFields,
          },
        },
      }
      self.setSubmissionData(newData)
    },
    updateContactInSubmissionDatagrid: (requirementPrefix: string, index: number, contact: IContact) => {
      const parts = requirementPrefix.split("|")
      const contactType = parts[parts.length - 1]
      const requirementKey = parts.slice(0, -1).join("|")
      const sectionKey = requirementKey.split("|")[0].slice(21, 64)

      const newContactElement = {}
      INPUT_CONTACT_KEYS.forEach((contactField) => {
        // The normalized phone number starts with +1... (country code)
        let newValue = ["cell", "phone"].includes(contactField)
          ? (contact[contactField] as string)?.slice(2)
          : contact[contactField]
        newContactElement[`${requirementKey}|${contactType}|${contactField}`] = newValue
      })
      const clonedArray = R.clone(self.submissionData.data?.[sectionKey]?.[requirementKey] ?? [])
      clonedArray[index] = newContactElement
      const newSectionFields = {
        [requirementKey]: clonedArray,
      }

      const newData = {
        data: {
          ...self.submissionData.data,
          [sectionKey]: {
            ...self.submissionData.data[sectionKey],
            ...newSectionFields,
          },
        },
      }
      self.setSubmissionData(newData)
    },
  }))

export interface IPermitApplication extends Instance<typeof PermitApplicationModel> {}
