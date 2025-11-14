import { IRootStore } from "../../stores/root-store"
import { ESocketDomainTypes } from "../../types/enums"
import { IUserPushPayload } from "../../types/types"
import { applyNotificationSideEffects } from "./notification_effects"

export class UserPushProcessor {
  constructor(private readonly rootStore: IRootStore) {
    this.rootStore = rootStore
  }

  process(payload: IUserPushPayload) {
    switch (payload.domain) {
      // domain, eventType, data
      case ESocketDomainTypes.permitApplication:
        this.rootStore.permitApplicationStore.processWebsocketChange(payload)
        break
      case ESocketDomainTypes.notification:
        this.rootStore.notificationStore.processWebsocketChange(payload)
        applyNotificationSideEffects(payload, this.rootStore)
        break
      case ESocketDomainTypes.template_version:
        this.rootStore.templateVersionStore.processWebsocketChange(payload)
        break
      case ESocketDomainTypes.jurisdiction:
        this.rootStore.jurisdictionStore.processWebsocketChange(payload)
        break
      default:
        import.meta.env.DEV && console.log(`Unknown domain type ${payload.domain}`)
    }
  }
}
