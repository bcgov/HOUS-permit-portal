import * as R from "ramda"
import { IUIStore } from "../../stores/ui-store"
import { isNilOrEmpty } from "../../utils"
import { API_ERROR_TYPES } from "../../utils/api-errors"
import { Api } from "./"

/**
  Watches for "flash" messages from the server and reports them.
 */
export const addFlashMessageMonitor = (api: Api, uiStore: IUIStore) => {
  api.addMonitor((response) => {
    // assuming these are just CLIENT_ERROR - other types handled below in addApiErrorMonitor
    const messageConfig: { [key: string]: any } = R.path(["data", "meta", "message"], response)
    if (isNilOrEmpty(messageConfig)) return

    const { title, message, type } = messageConfig
    uiStore.flashMessage.show(type, title, message)
  })
}

export const addApiErrorMonitor = (api: Api, uiStore: IUIStore) => {
  api.addMonitor((response) => {
    if (response.problem) {
      const err = API_ERROR_TYPES[response.problem]
      if (err) {
        uiStore.flashMessage.show(err.type, err.message, null)
      }
    }
  })
}
