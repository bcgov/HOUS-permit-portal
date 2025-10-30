import { IRootStore } from "../../stores/root-store"
import { ENotificationActionType, EStepCodeType } from "../../types/enums"
import { IUserPushPayload } from "../../types/types"

export function applyNotificationSideEffects(payload: IUserPushPayload, rootStore: IRootStore) {
  const data: any = payload?.data
  switch (data?.actionType) {
    case ENotificationActionType.stepCodeReportGenerated: {
      const stepCodeId = data?.objectData?.stepCodeId
      const stepCodeType = data?.objectData?.stepCodeType
      if (stepCodeId) {
        try {
          // Fire-and-forget refresh; underlying MST flow returns a promise
          if (stepCodeType === EStepCodeType.part3StepCode) {
            rootStore.stepCodeStore.fetchPart3StepCode(stepCodeId)
          } else if (stepCodeType === EStepCodeType.part9StepCode) {
            rootStore.stepCodeStore.fetchPart9StepCode(stepCodeId)
          } else {
            console.error("Unknown step code type", stepCodeType)
          }
        } catch (e) {
          import.meta.env.DEV && console.warn("Notification effect refresh failed", e)
        }
      }
      break
    }
    case ENotificationActionType.preCheckCompleted: {
      const preCheckId = data?.objectData?.preCheckId
      const unviewedCount = data?.objectData?.unviewedCount

      if (preCheckId) {
        try {
          rootStore.preCheckStore.fetchPreCheck(preCheckId)
        } catch (e) {
          import.meta.env.DEV && console.warn("Notification effect refresh failed", e)
        }
      }

      // Update unviewed count from notification
      if (typeof unviewedCount === "number") {
        rootStore.preCheckStore.setUnviewedCount(unviewedCount)
      }
      break
    }
    default:
      break
  }
}
