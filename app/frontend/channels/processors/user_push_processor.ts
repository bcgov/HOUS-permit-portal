import { IRootStore } from "../../stores/root-store"
import { ESocketDomainTypes } from "../../types/enums"
import { IUserPushPayload } from "../../types/types"

export class UserPushProcessor {
  constructor(private readonly rootStore: IRootStore) {
    this.rootStore = rootStore
  }

  process(payload: IUserPushPayload) {
    // TODO: This should have some kind of metadata with the unread counts and such
    switch (payload.domain) {
      // domain, eventType, data
      case ESocketDomainTypes.permitApplication:
        this.rootStore.permitApplicationStore.processWebsocketChange(payload)
        break
      case ESocketDomainTypes.notification:
        break
      default:
        import.meta.env.DEV && console.log(`Unknown domain type ${payload.domain}`)
    }
  }
}
