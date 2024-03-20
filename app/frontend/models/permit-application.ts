import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitApplicationStatus } from "../types/enums"
import { IDownloadableFile, IFormIOBlock, IFormJson, ISubmissionData, ITemplateCustomization } from "../types/types"
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
  .views((self) => ({
    indexOfBlockId: (blockId: string) => {
      return self.flattenedBlocks.findIndex((block) => block.id === blockId)
    },
    getBlockClass(sectionId, blockId) {
      return `formio-component-${self.blockKey(sectionId, blockId)}`
    },
    get blockClasses() {
      return self.flattenedBlocks.map((b) => `formio-component-${b.key}`)
    },
    get contacts() {
      const blockIdToTitleMapping = R.pipe(
        R.prop("components"), // Access the top-level components array
        R.chain(R.prop("components")), // Flatten nested components into a single array
        R.reduce((acc, { id, title }) => ({ ...acc, [id]: title }), {}) // Create an ID to title mapping
      )(self.formJson)
      // Convert each section's object into an array of [key, value] pairs
      const sectionsPairs = R.values(self.submissionData.data).map(R.toPairs)

      // Flatten one level of arrays to get a single array of [key, value] pairs
      const allFields = R.chain(R.identity, sectionsPairs)

      // Group the fields by block identifier, e.g., "section1|block1", to aggregate all related fields together
      const groupedByBlock = R.groupBy(([key, _]) => key.split("|").slice(0, 2).join("|"), allFields)

      // Map over each block, obtaining ID and transforming them into the desired Contact object structure
      const unfilteredContacts = R.keys(groupedByBlock).map((blockFieldsKey) => {
        const keySplit = blockFieldsKey.split("|RB")
        if (keySplit.length <= 1) return

        const blockId = keySplit[keySplit.length - 1]
        const blockObject = R.fromPairs(groupedByBlock[blockFieldsKey])
        return {
          id: blockId,
          address: blockObject[R.keys(blockObject).find((key: string) => key.includes("address"))!],
          cellNumber: blockObject[R.keys(blockObject).find((key: string) => key.includes("cell"))!],
          email: blockObject[R.keys(blockObject).find((key: string) => key.includes("email"))!],
          name: blockObject[R.keys(blockObject).find((key: string) => key.includes("individual_name"))!],
          phone: blockObject[R.keys(blockObject).find((key: string) => key.includes("phone"))!],
          title: blockIdToTitleMapping[blockId],
        }
      })

      return unfilteredContacts.filter((contact) => {
        const omitted = R.omit(["id", "title"], contact)
        return R.keys(omitted).length > 0 && R.values(omitted).some((value) => value && !R.isEmpty(value))
      })
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
    update: flow(function* (params) {
      const response = yield self.environment.api.updatePermitApplication(self.id, params)
      if (response.ok) {
        const { data: permitApplication } = response.data
        self.rootStore.permitApplicationStore.mergeUpdate(permitApplication, "permitApplicationMap")
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

    setSelectedTabIndex: (index: number) => {
      self.selectedTabIndex = index
    },
  }))

export interface IPermitApplication extends Instance<typeof PermitApplicationModel> {}
