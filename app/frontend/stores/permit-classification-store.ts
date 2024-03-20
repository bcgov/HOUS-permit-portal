import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { ActivityModel, IPermitType, PermitTypeModel } from "../models/permit-classification"
import { EPermitClassificationType } from "../types/enums"
import { IOption } from "../types/types"

export const PermitClassificationStoreModel = types
  .model("PermitClassificationStore", {
    permitTypeMap: types.map(PermitTypeModel),
    activityMap: types.map(ActivityModel),
    isLoaded: types.optional(types.boolean, false),
    isLoading: types.optional(types.boolean, false),
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
    // View to get an Activity by id
    getActivityById(id: string) {
      return self.activityMap.get(id)
    },
    // View to get all Activities as an array
    get activities() {
      return Array.from(self.activityMap.values())
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
    fetchPermitClassifications: flow(function* () {
      self.isLoading = true
      const response: any = yield self.environment.api.fetchPermitClassifications()
      if (response.ok) {
        const permitTypeData = response.data.data.filter((pc) => pc.type == EPermitClassificationType.PermitType)
        const activityData = response.data.data.filter((pc) => pc.type == EPermitClassificationType.Activity)
        self.mergeUpdateAll(permitTypeData, "permitTypeMap")
        self.mergeUpdateAll(activityData, "activityMap")
      }
      self.isLoading = false
      self.isLoaded = true
      return response.ok
    }),
  }))
  .actions((self) => ({
    fetchPermitTypeOptions: flow(function* (publishedOnly = false, pid = null) {
      const response = yield* toGenerator(
        self.environment.api.fetchPermitClassificationOptions(
          EPermitClassificationType.PermitType,
          publishedOnly,
          null,
          null,
          pid
        )
      )

      return response?.data?.data ?? ([] as IOption<IPermitType>[])
    }),
    fetchActivityOptions: flow(function* (publishedOnly = false, activityId = null) {
      const response = yield* toGenerator(
        self.environment.api.fetchPermitClassificationOptions(
          EPermitClassificationType.Activity,
          publishedOnly,
          activityId
        )
      )
      return response?.data?.data ?? []
    }),
  }))

export interface IPermitClassificationStore extends Instance<typeof PermitClassificationStoreModel> {}
