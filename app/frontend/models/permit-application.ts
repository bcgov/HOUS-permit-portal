import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitApplicationStatus } from "../types/enums"
import { IFormIOBlock, IFormJson, ISubmissionData } from "../types/types"
import { JurisdictionModel } from "./jurisdiction"
import { IActivity, IPermitType } from "./permit-classification"
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
    submittedAt: types.maybeNull(types.Date),
    selectedTabIndex: types.optional(types.number, 0),
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get jurisdictionName() {
      return self.jurisdiction.name
    },
    get permitTypeAndActivity() {
      return `${self.activity.name} ${self.permitType.name}`.trim()
    },
    get flattenedBlocks() {
      return self.formJson.components
        .reduce((acc, section) => {
          const blocks = section.components
          return acc.concat(blocks)
        }, [] as IFormIOBlock[])
        .filter((outNull) => outNull)
    },
    sectionKey(sectionId) {
      return `section${sectionId}`
    },
    blockKey(sectionId, blockId) {
      return `formSubmissionDataRSTsection${sectionId}|RB${blockId}`
    },
    isRequiredKey(key) {
      let retValue = null
      self.formJson?.components?.forEach((section) => {
        // if (
        //   key ===
        //     "formSubmissionDataRSTsectionfb9400a1-21ff-44fa-9f2d-4094d26cc667|RB1d2f3a02-3627-41b3-afad-b00968f54af9|cell" &&
        //   section.key === "sectionfb9400a1-21ff-44fa-9f2d-4094d26cc667"
        // ) {
        //   debugger
        // }
        section?.components?.forEach((block) => {
          // if (
          //   key ===
          //     "formSubmissionDataRSTsectionfb9400a1-21ff-44fa-9f2d-4094d26cc667|RB1d2f3a02-3627-41b3-afad-b00968f54af9|cell" &&
          //   block.key ==
          //     "formSubmissionDataRSTsectionfb9400a1-21ff-44fa-9f2d-4094d26cc667|RB1d2f3a02-3627-41b3-afad-b00968f54af9"
          // ) {
          //   debugger
          // }
          block?.components?.forEach((input) => {
            // if (
            //   key ===
            //     "formSubmissionDataRSTsectionfb9400a1-21ff-44fa-9f2d-4094d26cc667|RB1d2f3a02-3627-41b3-afad-b00968f54af9|cell" &&
            //   input.key === key
            // ) {
            //   debugger
            // }
            if (input.key === key) {
              // debugger
              retValue = input?.validation?.required
            }
          })
        })
      })
      return retValue
    },
  }))
  .views((self) => ({
    blockHasRequiredKey(sectionId, blockId) {
      const sectionKey = self.sectionKey(sectionId)
      const blockKey = self.blockKey(sectionId, blockId)
      const section = self.formJson?.components?.find((c) => c.key === sectionKey)
      const block = section?.components?.find((b) => b.key === blockKey)
      return block?.components?.some((i) => i?.validation?.required === true)
    },
  }))
  .views((self) => ({
    getBlockById: (blockId: string) => {
      return self.flattenedBlocks.find((block) => block.id === blockId)
    },
    indexOfBlockId: (blockId: string) => {
      return self.flattenedBlocks.findIndex((block) => block.id === blockId)
    },
    getBlockClass(sectionId, blockId) {
      return `formio-component-${self.blockKey(sectionId, blockId)}`
    },
    get blockClasses() {
      return self.flattenedBlocks.map((b) => `formio-component-${b.key}`)
    },
    getIsBlockPopulated(sectionId, blockId) {
      const sectionKey = self.sectionKey(sectionId)
      const blockKey = self.blockKey(sectionId, blockId)

      if (!self.submissionData) return false

      const sectionObject = self.submissionData.data[sectionKey]

      if (!sectionObject) return false

      const atLeastOneRequiredKey = self.blockHasRequiredKey(sectionId, blockId)

      // if (sectionId == "2a00bdfc-a9ee-4b58-8db4-54e5213e5040" && blockId == "ef2cc94a-d768-42fc-9bc8-2df1878201dc") {
      //   // Legal assessment block
      //   debugger
      // }

      // if (sectionId == "4699c3fb-d77e-486e-b223-687395873a9c" && blockId == "ef86b667-3444-4ebc-9310-c235bdde51e4") {
      //   // Site plan block
      //   debugger
      // }

      if (!atLeastOneRequiredKey) return true

      const isEmpty = !Object.keys(sectionObject).some((key) => {
        return key.startsWith(blockKey)
      })

      if (isEmpty) return false

      // const atLeastOnePrefixKey = Object.keys(sectionObject).some((key) => {
      //   return key.startsWith(blockKey)
      // })

      // if (!atLeastOnePrefixKey) return false

      for (const key in sectionObject) {
        if (
          sectionId == "4699c3fb-d77e-486e-b223-687395873a9c" &&
          blockId == "ef86b667-3444-4ebc-9310-c235bdde51e4" &&
          key.startsWith(blockKey)
        ) {
          // Site plan block
          // debugger
          // self.isRequiredKey(key)
        }
        if (
          key.startsWith(blockKey) &&
          (!sectionObject[key] || sectionObject[key].length === 0) &&
          self.isRequiredKey(key)
        ) {
          // Found a key starting with blockKey but its value is falsy
          return false
        }
      }
      return true
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
      return response.ok
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
