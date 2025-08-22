import { t } from "i18next"
import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IPart3StepCode, Part3StepCodeModel } from "../models/part-3-step-code"
import { IPart9StepCode, Part9StepCodeModel } from "../models/part-9-step-code"
import { EEnergyStep, EStepCodeSortFields, EStepCodeType, EZeroCarbonStep } from "../types/enums"
import { IPart3ChecklistSelectOptions, IPart9ChecklistSelectOptions, TSearchParams } from "../types/types"
import { setQueryParam, startBlobDownload } from "../utils/utility-functions"

export const StepCodeModel = types.union(
  {
    dispatcher: (snapshot) => {
      // Return the appropriate model based on the `type` field in the snapshot
      switch (snapshot.type) {
        case EStepCodeType.part9StepCode: // Using string literal
          return Part9StepCodeModel
        case EStepCodeType.part3StepCode: // Using string literal
          return Part3StepCodeModel
        default:
          // It's good practice to have a default, even if you expect it to never be hit.
          // Consider logging an error or throwing a more specific error if an unknown type is encountered.
          console.error(`Unknown step code snapshot type: ${snapshot.type}`, snapshot)
          throw new Error(`Unknown step code type: ${snapshot.type}`)
      }
    },
  },
  // types.late is required for reference resolution
  types.late(() => Part9StepCodeModel),
  types.late(() => Part3StepCodeModel)
)

export type IStepCode = Instance<typeof StepCodeModel>

export const StepCodeStoreModel = types
  .compose(
    types.model("StepCodeStore", {
      stepCodesMap: types.map(StepCodeModel),
      tableStepCodes: types.optional(types.array(types.reference(StepCodeModel)), []),
      isLoaded: types.maybeNull(types.boolean),
      selectOptions: types.frozen<Partial<IPart9ChecklistSelectOptions & IPart3ChecklistSelectOptions>>(),
      currentStepCode: types.maybeNull(types.reference(StepCodeModel)),
      typeFilter: types.optional(types.array(types.enumeration(Object.values(EStepCodeType) as any)), []),
    }),
    createSearchModel<EStepCodeSortFields>("searchStepCodes", "setStepCodeFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    setCurrentStepCode(stepCodeId) {
      self.currentStepCode = stepCodeId
    },
  }))
  .views((self) => ({
    get stepCodes() {
      return Array.from(self.stepCodesMap.values())
    },
    getStepCode(id: string) {
      return self.stepCodesMap.get(id)
    },
    getSortColumnHeader(field: EStepCodeSortFields) {
      const map = {
        [EStepCodeSortFields.permitProjectTitle]: t("stepCode.columns.project"),
        [EStepCodeSortFields.type]: t("stepCode.columns.type"),
        [EStepCodeSortFields.fullAddress]: t("stepCode.columns.fullAddress"),
        [EStepCodeSortFields.updatedAt]: t("stepCode.columns.updatedAt"),
      }
      return map[field]
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
    setCurrentStepCode(stepCodeId) {
      self.currentStepCode = stepCodeId
    },
    setTableStepCodes(stepCodes: Array<IPart9StepCode | IPart3StepCode>) {
      // @ts-ignore
      self.tableStepCodes.replace(stepCodes.map((s) => s.id))
    },
    setTypeFilter(nextTypes: EStepCodeType[] | undefined) {
      if (!nextTypes || nextTypes.length === 0) {
        setQueryParam("type", [])
        self.typeFilter.clear()
        return
      }
      setQueryParam("type", nextTypes)
      // @ts-ignore
      self.typeFilter.replace(nextTypes)
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(stepCode: IPart9StepCode | IPart3StepCode) {
      let normalized = stepCode as any

      // Part 9: convert checklists array to map for stable references
      if (normalized.type === EStepCodeType.part9StepCode) {
        const checklistsMap = (normalized as IPart9StepCode).checklists?.reduce(
          (acc, checklist) => {
            acc[checklist.id] = checklist
            return acc
          },
          {} as Record<string, any>
        )
        normalized = R.mergeRight(normalized, { checklistsMap })
      }

      // Jurisdiction: merge object into store, replace with reference id (applies to all types)
      const jurisdiction = normalized.jurisdiction
      if (jurisdiction && typeof jurisdiction === "object" && jurisdiction.id) {
        self.rootStore.jurisdictionStore.mergeUpdate(jurisdiction, "jurisdictionMap")
        normalized = R.mergeRight(normalized, { jurisdiction: jurisdiction.id })
      }

      return normalized
    },

    fetchPart9StepCodes: flow(function* () {
      const response = yield self.environment.api.fetchPart9StepCodes()
      if (response.ok) {
        self.selectOptions = response.data.meta.selectOptions
        self.mergeUpdateAll(response.data.data, "stepCodesMap")
      } else {
        console.error("Failed to fetch Part 9 Step Codes:", response.problem, response.data)
      }
      self.isLoaded = true
    }),
    searchStepCodes: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }
      const params: TSearchParams<EStepCodeSortFields> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
        filters: {
          type: self.typeFilter,
        } as any,
      }
      const response = yield self.environment.api.searchStepCodes(params)
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "stepCodesMap")
        self.setTableStepCodes(response.data.data)
        self.setPageFields(response.data.meta, opts)
      } else {
        console.error("Failed to search Step Codes:", response.problem, response.data)
      }
      return response.ok
    }),
    setStepCodeFilters(queryParams: URLSearchParams) {
      const rawType = queryParams.get("type")
      const typeFilter = rawType ? (rawType.split(",").filter(Boolean) as EStepCodeType[]) : []
      self.setTypeFilter(typeFilter)
    },
    fetchPart9SelectOptions: flow(function* () {
      const response = yield self.environment.api.fetchPart9StepCodeSelectOptions()
      if (response.ok) {
        self.selectOptions = { ...self.selectOptions, ...response.data.data.selectOptions }
      } else {
        console.error("Failed to fetch Part 9 Select Options:", response.problem, response.data)
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
        const fileName = `${t(`reporting.stepCodeMetrics.filename${stepCodeType === EStepCodeType.part3StepCode ? "Part3" : "Part9"}`)}.csv`
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
    createPart3StepCode: flow(function* (values: {
      permitApplicationId?: string
      checklistAttributes: { sectionCompletionStatus: Record<string, any> }
    }) {
      const response = yield self.environment.api.createPart3StepCode(values)

      if (response.ok) {
        self.mergeUpdate(response.data.data, "stepCodesMap")
        self.setCurrentStepCode(response.data.data.id)
        return { ok: true, data: response.data.data }
      } else {
        console.error("Failed to create/find Part 3 Step Code:", response.problem, response.data)
        return { ok: false, error: response.data?.errors || response.problem }
      }
    }),
    createPart9StepCode: flow(function* (values: {
      permitApplicationId?: string
      preConstructionChecklistAttributes?: any
      name?: string
    }) {
      const response = yield self.environment.api.createPart9StepCode(values)

      if (response.ok) {
        self.mergeUpdate(response.data.data, "stepCodesMap")
        self.setCurrentStepCode(response.data.data.id)
        return { ok: true, data: response.data.data }
      } else {
        console.error("Failed to create/find Part 9 Step Code:", response.problem, response.data)
        return { ok: false, error: response.data?.errors || response.problem }
      }
    }),
    fetchPart3StepCode: flow(function* (id: string) {
      const response = yield self.environment.api.fetchPart3StepCode(id)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "stepCodesMap")
        return response.data.data
      } else {
        console.error("Failed to fetch Part 3 Step Code:", response.problem, response.data)
        return null
      }
    }),
  }))

export interface IStepCodeStore extends Instance<typeof StepCodeStoreModel> {}
