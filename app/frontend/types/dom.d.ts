// modified from https://stackoverflow.com/questions/43001679/how-do-you-create-custom-event-in-typescript
import { ECustomEvents } from "./enums"
import { IPermitApplicationComplianceUpdate } from "./types"

export interface ICustomEventMap {
  [ECustomEvents.handlePermitApplicationUpdate]: CustomEvent<IPermitApplicationComplianceUpdate>
  [ECustomEvents.openRequestRevision]: CustomEvent<{ key: string }>
}

declare global {
  interface Document {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof ICustomEventMap>(
      type: K,
      listener: (this: Document, ev: ICustomEventMap[K]) => void
    ): void

    dispatchEvent<K extends keyof ICustomEventMap>(ev: ICustomEventMap[K]): void
  }

  interface Window {
    // Jira Issue Collector configuration (set in application_helper.rb)
    ATL_JQ_PAGE_PROPS?: {
      collectorId?: string
      triggerFunction?: (showCollectorDialog: () => void) => void
      fieldValues?: {
        description?: string
        [key: string]: unknown
      }
    }
    // Jira dialog function (provided by Jira collector script)
    showCollectorDialog?: () => void
  }
}
export {} //needed for TS compiler.
