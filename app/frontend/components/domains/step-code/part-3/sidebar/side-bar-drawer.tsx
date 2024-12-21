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
import { Sidebar } from "."

interface IProps {
  triggerProps?: ButtonProps
}

const i18nPrefix = "stepCode.part3.sidebar"

export const SideBarDrawer = observer(function SideBarDrawer({ triggerProps }: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  const btnRef = React.useRef()

  return (
    <>
      <Button ref={btnRef} variant="secondary" onClick={onOpen} zIndex={1} {...triggerProps}>
        {t(`${i18nPrefix}.responsiveButton`)}
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
