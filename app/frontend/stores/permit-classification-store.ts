import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { ActivityModel, IActivity, IPermitType, PermitTypeModel } from "../models/permit-classification"
import { EPermitClassificationCode, EPermitClassificationType } from "../types/enums"
import { IOption } from "../types/types"

export const PermitClassificationStoreModel = types
  .model("PermitClassificationStore", {
    permitTypeMap: types.map(PermitTypeModel),
    activityMap: types.map(ActivityModel),
    isLoaded: types.optional(types.boolean, false),
    isPermitTypeLoading: types.optional(types.boolean, false),
    isActivityLoading: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    // View to get a PermitType by id
    getPermitTypeById(id: string) {
      return self.permitTypeMap.get(id)
    },
    // View to get all PermitTypes as an array
    get permitTypes() {
      return Array.from(self.permitTypeMap.values())
    },
    get activities() {
      return Array.from(self.activityMap.values())
    },
  }))
  .views((self) => ({
    get part9BuildingPermitType() {
      return self.permitTypes.find((permitType) => permitType.code === EPermitClassificationCode.lowResidential)
    },
    // View to get an Activity by id
    getActivityById(id: string) {
      return self.activityMap.get(id)
    },
    // View to get all Activities as an array

    // Unique category options across permit types and activities
    get categoryOptions() {
      const labelByKey = new Map<string, string>()
      self.permitTypes.forEach((pt) => {
        const key = pt.category as string | null
        const label = (pt.categoryLabel as string | null) || key
        if (key) labelByKey.set(key, label)
      })
      self.activities.forEach((a) => {
        const key = a.category as string | null
        const label = (a.categoryLabel as string | null) || key
        if (key) labelByKey.set(key, label)
      })
      return Array.from(labelByKey.entries()).map(([value, label]) => ({ label, value }))
    },
  }))
  .views((self) => ({
    get groupedActivities() {
      const items = self.activities as IActivity[]
      const labeledGroups = new Map<string, IActivity[]>()
      const uncategorized: IActivity[] = []
      items.forEach((item) => {
        // @ts-ignore
        const label = (item.categoryLabel as string | null) || ""
        if (label) {
          if (!labeledGroups.has(label)) labeledGroups.set(label, [])
          labeledGroups.get(label)!.push(item)
        } else {
          uncategorized.push(item)
        }
      })
      const labeled = Array.from(labeledGroups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, list]) => ({ label, list }))
      return { labeled, uncategorized }
    },
  }))
  .actions((self) => ({
    // Action to add a new PermitType
    addPermitType(permitType: Instance<typeof PermitTypeModel>) {
      self.permitTypeMap.put(permitType)
    },
    // Action to remove a PermitType
    removePermitType(id: string) {
      self.permitTypeMap.delete(id)
    },
    // Action to add a new Activity
    addActivity(activity: Instance<typeof ActivityModel>) {
      self.activityMap.put(activity)
    },
    // Action to remove an Activity
    removeActivity(id: string) {
      self.activityMap.delete(id)
    },
    fetchPermitClassifications: flow(function* (onlyEnabled: boolean = true) {
      const response: any = yield* toGenerator(self.environment.api.fetchPermitClassifications(onlyEnabled))
      if (response.ok) {
        const permitTypeData = response.data.data.filter((pc) => pc.type == EPermitClassificationType.PermitType)
        const activityData = response.data.data.filter((pc) => pc.type == EPermitClassificationType.Activity)
        self.mergeUpdateAll(permitTypeData, "permitTypeMap")
        self.mergeUpdateAll(activityData, "activityMap")
      }
      self.isLoaded = true
      return response.ok
    }),
  }))
  .actions((self) => ({
    fetchPermitTypeOptions: flow(function* (
      publishedOnly = false,
      firstNations = null,
      pid = null,
      jurisdictionId = null
    ) {
      self.isPermitTypeLoading = true
      const response = yield* toGenerator(
        self.environment.api.fetchPermitClassificationOptions(
          EPermitClassificationType.PermitType,
          publishedOnly,
          firstNations,
          null,
          null,
          pid,
          jurisdictionId
        )
      )
      self.isPermitTypeLoading = false
      return (response?.data?.data ?? []) as IOption<IPermitType>[]
    }),
    fetchActivityOptions: flow(function* (
      publishedOnly = false,
      firstNations = null,
      permitTypeId = null,
      jurisdictionId = null
    ) {
      self.isActivityLoading = true
      const response = yield* toGenerator(
        self.environment.api.fetchPermitClassificationOptions(
          EPermitClassificationType.Activity,
          publishedOnly,
          firstNations,
          permitTypeId,
          null, // activityId
          null, // pid
          jurisdictionId
        )
      )
      self.isActivityLoading = false
      return (response?.data?.data ?? []) as IOption<IActivity>[]
    }),
    createPermitClassification: flow(function* (data: {
      name: string
      code: string
      description?: string
      enabled?: boolean
      type: EPermitClassificationType
      category?: string | null
    }) {
      const response: any = yield* toGenerator(self.environment.api.createPermitClassification(data))
      if (response?.ok) {
        const created = response?.data?.data
        if (created?.type === EPermitClassificationType.PermitType) self.mergeUpdate(created, "permitTypeMap")
        if (created?.type === EPermitClassificationType.Activity) self.mergeUpdate(created, "activityMap")
      }
      return response?.ok
    }),
    updatePermitClassification: flow(function* (
      id: string,
      data: Partial<{
        name: string
        code: string
        description?: string
        enabled?: boolean
        type: EPermitClassificationType
        category?: string | null
      }>
    ) {
      const response: any = yield* toGenerator(self.environment.api.updatePermitClassification(id, data))
      if (response?.ok) {
        const updated = response?.data?.data
        if (updated?.type === EPermitClassificationType.PermitType) self.mergeUpdate(updated, "permitTypeMap")
        if (updated?.type === EPermitClassificationType.Activity) self.mergeUpdate(updated, "activityMap")
      }
      return response?.ok
    }),
    destroyPermitClassification: flow(function* (id: string, type: EPermitClassificationType) {
      const response = yield* toGenerator(self.environment.api.destroyPermitClassification(id))
      if (response?.ok) {
        if (type === EPermitClassificationType.PermitType) self.removePermitType(id)
        if (type === EPermitClassificationType.Activity) self.removeActivity(id)
      }
      return response?.ok
    }),
  }))

export interface IPermitClassificationStore extends Instance<typeof PermitClassificationStoreModel> {}
