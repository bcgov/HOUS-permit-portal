import {
  Button,
  ButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { OverheatingToolSidebar as Sidebar } from "."

interface IProps {
  triggerProps?: ButtonProps
}

export const SideBarDrawer = observer(function SideBarDrawer({ triggerProps }: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  const { t } = useTranslation() as any

  return (
    <>
      <Button ref={btnRef} variant="secondary" onClick={onOpen} zIndex={1} {...triggerProps}>
        {t("singleZoneCoolingHeatingTool.sidebar.sections")}
      </Button>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />

          <DrawerBody>
            <Sidebar />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})
