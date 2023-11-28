import { CONNECTION_ERROR, NETWORK_ERROR, SERVER_ERROR, TIMEOUT_ERROR, UNKNOWN_ERROR } from "apisauce"
import { EFlashMessageStatus } from "../types/enums"

export const API_ERROR_TYPES = {
  [TIMEOUT_ERROR]: {
    message: "We're sorry, the server did not respond in time.  Please try again.",
    type: EFlashMessageStatus.error,
  },
  [UNKNOWN_ERROR]: {
    message: "We're sorry, something unexpected happened. Please check your network connection.",
    type: EFlashMessageStatus.error,
  },
  [SERVER_ERROR]: {
    message: "We're sorry, something unexpected happened. Please try again.",
    type: EFlashMessageStatus.error,
  },
  [NETWORK_ERROR]: {
    message: "We couldn't connect to the internet! Please check your connection.",
    type: EFlashMessageStatus.error,
  },
  [CONNECTION_ERROR]: {
    message: "We're sorry! We can't reach anipet's servers right now. Please try again.",
    type: EFlashMessageStatus.error,
  },
}
