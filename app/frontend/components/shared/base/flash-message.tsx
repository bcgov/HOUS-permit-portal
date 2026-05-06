import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import { useMst } from "../../../setup/root"
import { toaster } from "../../ui/toaster"

export const FlashMessage = observer(() => {
  const { uiStore } = useMst()
  const { isVisible, status, title, description, duration, isClosable } = uiStore.flashMessage

  useEffect(() => {
    if (isVisible) {
      toaster.create({
        title: title ?? undefined,
        description: description ?? undefined,
        type: status === "special" ? "info" : status,
        closable: isClosable ?? true,
        duration: duration ?? undefined,
      })
    }
  }, [isVisible, status, title, description, duration, isClosable])

  return null
})
