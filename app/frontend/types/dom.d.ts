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
    ATL_JQ_PAGE_PROPS?: {
      triggerFunction: (showCollectorDialog: () => void) => void
      fieldValues?: {
        description?: string
        [key: string]: unknown
      }
    }
  }
}
export {} //needed for TS compiler.
