import { t } from "i18next"
import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IUser } from "./user"  // Assuming UserModel is imported here
import { convertToDate } from "../utils/utility-functions"

export const EUserActivityActions = {
  TOGGLE_FEATURE: "toggleFeature", 
  UPDATE_FEATURE: "updateFeature", 
  // Add more action types as required
} as const

export const UserActivityModel = types
  .model("UserActivityModel")
  .props({
    id: types.identifier,              // Unique ID for the activity log
    userId: types.reference(types.late(() => UserModel)),  // Reference to the User
    featureName: types.string,         // Name of the feature that was toggled
    jurisdiction: types.string,        // Jurisdiction where the feature toggle is applied
    action: types.enumeration(Object.values(EUserActivityActions)),  // Type of action taken (toggle, update, etc.)
    timestamp: types.Date,             // Timestamp of when the activity occurred
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .actions((self) => ({
    logActivity(user: IUser, featureName: string, jurisdiction: string, action: typeof EUserActivityActions[keyof typeof EUserActivityActions]) {
      const newActivity = {
        userId: user.id,
        featureName,
        jurisdiction,
        action,
        timestamp: new Date(),
      }
      applySnapshot(self, newActivity)  
      self.environment.api.logUserActivity(newActivity)
    },
  }))

export interface IUserActivity extends Instance<typeof UserActivityModel> {}

export interface IUserActivityStore {
  logActivity: (user: IUser, featureName: string, jurisdiction: string, action: typeof EUserActivityActions[keyof typeof EUserActivityActions]) => void
}

