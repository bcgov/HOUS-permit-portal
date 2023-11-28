import { ToastPositionWithLogical, useToast } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import { useMst } from "../../setup/root"

export const FlashMessage = observer(() => {
  const { uiStore } = useMst()
  const { isVisible, status, title, description, duration, isClosable, position } = uiStore.flashMessage
  const toast = useToast()

  useEffect(() => {
    if (isVisible) {
      toast({ title, description, status, isClosable, duration, position: position as ToastPositionWithLogical })
    }
  }, [isVisible, status, title, description])

  return null
})
