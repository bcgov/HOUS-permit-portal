import { t } from "i18next"
import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IStepCode, StepCodeModel } from "../models/step-code"
import { EEnergyStep, EZeroCarbonStep } from "../types/enums"
import { IStepCodeSelectOptions } from "../types/types"
import { startBlobDownload } from "../utils/utility-functions"

export const StepCodeStoreModel = types
  .model("StepCodeStore", {
    stepCodesMap: types.map(StepCodeModel),
    selectOptions: types.frozen<IStepCodeSelectOptions>(),
    isLoaded: types.maybeNull(types.boolean),
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
      const { energySteps } = self.selectOptions
      return (allowNull ? [...energySteps, null] : energySteps) as EEnergyStep[]
    },
    getZeroCarbonStepOptions(allowNull: boolean = false): EZeroCarbonStep[] {
      const { zeroCarbonSteps } = self.selectOptions
      return (allowNull ? [...zeroCarbonSteps, null] : zeroCarbonSteps) as EZeroCarbonStep[]
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(stepCode) {
      const checklistsMap = stepCode.checklists.reduce((checklistsMap, checklist) => {
        checklistsMap[checklist.id] = checklist
        return checklistsMap
      }, {})
      return R.mergeRight(stepCode, {
        checklistsMap,
      })
    },
    setCurrentStepCode(stepCode?: IStepCode) {
      self.currentStepCode = stepCode
    },
    fetchStepCodes: flow(function* () {
      const response = yield self.environment.api.fetchStepCodes()
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "stepCodesMap")
        self.selectOptions = response.data.meta.selectOptions
      }
      self.isLoaded = true
    }),
    createStepCode: flow(function* (values) {
      const response = yield self.environment.api.createStepCode(values)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "stepCodesMap")
        self.currentStepCode = response.data.data.id
        return true
      }
    }),
    deleteStepCode: flow(function* () {
      const response = yield self.environment.api.deleteStepCode(self.currentStepCode.id)
      if (response.ok) {
        self.stepCodesMap.delete(self.currentStepCode.id)
        self.currentStepCode = null
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
    downloadApplicationMetrics: flow(function* () {
      try {
        const response = yield* toGenerator(self.environment.api.downloadApplicationMetricsCsv())
        if (!response.ok) {
          return response.ok
        }

        const blobData = response.data
        const fileName = `${t("reporting.applicationMetrics.filename")}.csv`
        const mimeType = "text/csv"
        startBlobDownload(blobData, mimeType, fileName)

        return response
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Failed to download permit application metrics:`, error)
        }
        throw error
      }
    }),
  }))

export interface IStepCodeStore extends Instance<typeof StepCodeStoreModel> {}
