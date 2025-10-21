import { IRootStore } from "../../stores/root-store"
import { ENotificationActionType } from "../../types/enums"
import { IUserPushPayload } from "../../types/types"

export function applyNotificationSideEffects(payload: IUserPushPayload, rootStore: IRootStore) {
  const data: any = payload?.data
  switch (data?.actionType) {
    case ENotificationActionType.stepCodeReportGenerated: {
      const stepCodeId = data?.objectData?.stepCodeId
      if (stepCodeId) {
        try {
          // Fire-and-forget refresh; underlying MST flow returns a promise
          rootStore.stepCodeStore.fetchPart3StepCode(stepCodeId)
        } catch (e) {
          import.meta.env.DEV && console.warn("Notification effect refresh failed", e)
        }
      }
      break
    }
    case ENotificationActionType.preCheckCompleted: {
      const preCheckId = data?.objectData?.preCheckId
      if (preCheckId) {
        try {
          rootStore.preCheckStore.fetchPreCheck(preCheckId)
        } catch (e) {
          import.meta.env.DEV && console.warn("Notification effect refresh failed", e)
        }
      }
      break
    }
    default:
      break
  }
}
