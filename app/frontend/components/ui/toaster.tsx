"use client"

import { Toaster as ChakraToaster, Portal, Toast, createToaster } from "@chakra-ui/react"
import { EFlashMessageStatus } from "../../types/enums"
import { CustomMessageBox } from "../shared/base/custom-message-box"

export const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
})

const toastStatus = (type: string | undefined) => {
  if (type === EFlashMessageStatus.success) return EFlashMessageStatus.success
  if (type === EFlashMessageStatus.warning) return EFlashMessageStatus.warning
  if (type === EFlashMessageStatus.error) return EFlashMessageStatus.error

  return EFlashMessageStatus.info
}

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root width={{ md: "sm" }} unstyled>
            <CustomMessageBox
              width="full"
              position="relative"
              pr={toast.closable ? 10 : undefined}
              title={toast.title}
              description={toast.description}
              status={toastStatus(toast.type)}
            >
              {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
              {toast.closable && <Toast.CloseTrigger position="absolute" top={3} right={3} />}
            </CustomMessageBox>
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
