import { Instance, types } from "mobx-state-tree"
import { ActivityModel, PermitTypeModel } from "../models/permit-classification"

export const PermitClassificationStoreModel = types
  .model("PermitClassificationStore", {
    permitTypeMap: types.map(PermitTypeModel),
    activityMap: types.map(ActivityModel),
  })
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
    // TODO: Asynchronous action to fetch permit classifications (PermitTypes and Activities) from an API
    // fetchPermitClassifications: flow(function* () {
    // try {
    //   const response = yield fetch("/api/permitclassifications");
    //   const permitClassifications = yield response.json();
    //   applySnapshot(self.permitTypeMap, permitClassifications.permitTypes);
    //   applySnapshot(self.activityMap, permitClassifications.activities);
    // } catch (error) {
    //   console.error("Failed to fetch permit classifications", error);
    // }
    // }),
  }))

export interface IPermitClassificationStore extends Instance<typeof PermitClassificationStoreModel> {}
