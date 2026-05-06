import { Button, ButtonProps, Drawer, Portal, useDisclosure } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Sidebar } from "."

interface IProps {
  triggerProps?: ButtonProps
}

const i18nPrefix = "stepCode.part3.sidebar"

export const SideBarDrawer = observer(function SideBarDrawer({ triggerProps }: IProps) {
  const { open, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  const btnRef = React.useRef()

  return (
    <>
      <Button ref={btnRef} variant="secondary" onClick={onOpen} zIndex={1} {...triggerProps}>
        {t(`${i18nPrefix}.responsiveButton`)}
      </Button>
      <Drawer.Root
        open={open}
        placement="start"
        finalFocusEl={() => btnRef.current}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.CloseTrigger />
              <Drawer.Body>
                <Sidebar />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  )
})
