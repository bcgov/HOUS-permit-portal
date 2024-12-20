import { ToastPosition, useToast } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useMst } from "../../../setup/root"
import { CustomMessageBox } from "./custom-message-box"

export const FlashMessage = observer(() => {
  const { uiStore } = useMst()
  const { isVisible, status, title, description, duration, isClosable, position } = uiStore.flashMessage
  const toast = useToast()

  useEffect(() => {
    if (isVisible) {
      toast({
        title,
        description,
        status,
        isClosable,
        duration,
        position: position as ToastPosition,
        render: ({ description, ...rest }) => <CustomMessageBox description={description as string} {...rest} />,
      })
    }
  }, [isVisible, status, title, description])

  return null
})
