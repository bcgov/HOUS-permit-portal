import { createConsumer } from "@anycable/web"
import { IRootStore } from "../stores/root-store"
import { camelizeResponse } from "../utils"
import { UserPushProcessor } from "./processors/user_push_processor"

export const createUserSpecificConsumer = (userId) => {
  // @ts-ignore
  const BASE_WEBSOCKET_URL = document.querySelector("meta[name='action-cable-url']").content
  return createConsumer(BASE_WEBSOCKET_URL)
}

export const createUserChannelConsumer = (userId: string, rootStore: IRootStore) => {
  const userPushProcessor = new UserPushProcessor(rootStore)
  const consumer = createUserSpecificConsumer(userId)
  consumer.subscriptions.create(
    { channel: "UserChannel", userId },
    {
      connected() {
        // Called when the subscription is ready for use on the server
        import.meta.env.DEV && console.log("User Channel CONNECTED")
      },
      disconnected() {
        // Called when the subscription has been terminated by the server
        import.meta.env.DEV && console.log("User Channel DISCONNECTED")
      },
      received(data) {
        // Called when there's incoming data on the websocket for this channel
        const camelizedData = camelizeResponse(data)
        import.meta.env.DEV && console.log("[DEV] DATA", camelizedData)
        userPushProcessor.process(camelizedData)
      },
    }
  )
  return consumer
}
