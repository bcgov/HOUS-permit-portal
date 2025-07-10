import { t } from "i18next"
import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IPart3StepCode, Part3StepCodeModel, Part3StepCodeType } from "../models/part-3-step-code"
import { IPart9StepCode, Part9StepCodeModel, Part9StepCodeType } from "../models/part-9-step-code"
import { EEnergyStep, EStepCodeType, EZeroCarbonStep } from "../types/enums"
import { IPart3ChecklistSelectOptions, IPart9ChecklistSelectOptions } from "../types/types"
import { startBlobDownload } from "../utils/utility-functions"

export const StepCodeModel = types.union(
  {
    dispatcher: (snapshot) => {
      // Return the appropriate model based on the `type` field in the snapshot
      switch (snapshot.type) {
        case Part9StepCodeType:
          return Part9StepCodeModel
        case Part3StepCodeType:
          return Part3StepCodeModel
        default:
          throw new Error(`Unknown type: ${snapshot.type}`)
      }
    },
  },
  // types.late is required for reference resolution
  types.late(() => Part9StepCodeModel),
  types.late(() => Part3StepCodeModel)
)

export const StepCodeStoreModel = types
  .model("StepCodeStore", {
    stepCodesMap: types.map(StepCodeModel),
    isLoaded: types.maybeNull(types.boolean),
    selectOptions: types.frozen<Partial<IPart9ChecklistSelectOptions & IPart3ChecklistSelectOptions>>(),
    currentStepCode: types.maybeNull(types.reference(StepCodeModel)),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get stepCodes() {
      return Array.from(self.stepCodesMap.values())
    },
    getStepCode(id: string) {
      return self.stepCodesMap.get(id)
    },
    getEnergyStepOptions(allowNull: boolean = false): EEnergyStep[] {
      const energySteps = self.currentStepCode?.energySteps || self.selectOptions.energySteps
      return (allowNull ? [...energySteps, null] : energySteps) as EEnergyStep[]
    },
    getZeroCarbonStepOptions(allowNull: boolean = false): EZeroCarbonStep[] {
      const zeroCarbonSteps = self.currentStepCode?.zeroCarbonSteps || self.selectOptions.zeroCarbonSteps
      return (allowNull ? [...zeroCarbonSteps, 0] : zeroCarbonSteps) as EZeroCarbonStep[]
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(stepCode: IPart9StepCode | IPart3StepCode) {
      if (stepCode.type == Part9StepCodeType) {
        const checklistsMap = (stepCode as IPart9StepCode).checklists?.reduce((checklistsMap, checklist) => {
          checklistsMap[checklist.id] = checklist
          return checklistsMap
        }, {})
        return R.mergeRight(stepCode, {
          checklistsMap,
        })
      } else {
        return stepCode
      }
    },
    setCurrentStepCode(stepCodeId) {
      self.currentStepCode = stepCodeId
    },
    // TODO: consider restructuring this as we are only really using this endpoint to fetch the part 9 select options
    fetchPart9StepCodes: flow(function* () {
      const response = yield self.environment.api.fetchPart9StepCodes()
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "stepCodesMap")
        self.selectOptions = response.data.meta.selectOptions
      }
      self.isLoaded = true
    }),
    createPart3StepCode: flow(function* (values) {
      const response = yield self.environment.api.createPart3StepCode(values)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "stepCodesMap")
        self.currentStepCode = response.data.data.id
        return true
      } else {
      }
    }),
    createPart9StepCode: flow(function* (values) {
      const response = yield self.environment.api.createPart9StepCode(values)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "stepCodesMap")
        self.currentStepCode = response.data.data.id
        return true
      }
    }),
    deleteStepCode: flow(function* deleteStepCode() {
      if (!self.currentStepCode) return

      try {
        const stepCodeId = self.currentStepCode.id
        const response = yield self.environment.api.deleteStepCode(stepCodeId)

        // WORKAROUND: something is preventing the step code from being deleted from the map without errors, so you must refresh the page to see the changes
        // use navigate(0)
        return response
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error(`Failed to delete step code:`, e)
        }
        throw e
      }
    }),
    downloadStepCodeSummary: flow(function* () {
      try {
        const response = yield* toGenerator(self.environment.api.downloadStepCodeSummaryCsv())
        if (!response.ok) {
          return response.ok
        }

        const blobData = response.data
        const fileName = `${t("reporting.stepCodeSummary.filename")}.csv`
        const mimeType = "text/csv"
        startBlobDownload(blobData, mimeType, fileName)

        return response
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Failed to download energy step code configuration by jurisdiction:`, error)
        }
        throw error
      }
    }),
    downloadStepCodeMetrics: flow(function* (stepCodeType: EStepCodeType) {
      try {
        const response = yield* toGenerator(self.environment.api.downloadStepCodeMetricsCsv(stepCodeType))
        if (!response.ok) {
          return response.ok
        }

        const blobData = response.data
        const fileName = `${t(`reporting.stepCodeMetrics.filename${stepCodeType === EStepCodeType.Part3 ? "Part3" : "Part9"}`)}.csv`
        const mimeType = "text/csv"
        startBlobDownload(blobData, mimeType, fileName)

        return response
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Failed to download step code metrics:`, error)
        }
        throw error
      }
    }),
  }))

export interface IStepCodeStore extends Instance<typeof StepCodeStoreModel> {}
