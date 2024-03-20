import { createConsumer } from "@rails/actioncable"
import { IRootStore } from "../stores/root-store"

export const BASE_WEBSOCKET_URL = document.querySelector("meta[name='action-cable-url']").content

export const createUserSpecificConsumer = (userId) => {
  return createConsumer(`${BASE_WEBSOCKET_URL}?userId=${userId}`)
}

export const createUserChannelConsumer = (userId: string, rootStore: IRootStore) => {
  return createUserSpecificConsumer(userId).subscriptions.create("UserChannel", {
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
      console.log("DATA", data)
    },
  })
}
