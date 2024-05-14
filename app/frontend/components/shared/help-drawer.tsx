import {
  Button,
  ButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import React, { Ref, useRef } from "react"
import { useTranslation } from "react-i18next"

interface IProps {
  defaultButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps & { ref: Ref<HTMLElement> }) => JSX.Element
}

export function HelpDrawer({ defaultButtonProps, renderTriggerButton }: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()

  return (
    <>
      {renderTriggerButton?.({ onClick: onOpen, ref: btnRef }) ?? (
        <Button
          variant={"ghost"}
          p={0}
          onClick={onOpen}
          aria-label={"add requirement to template"}
          _hover={{
            textDecoration: "underline",
          }}
          {...defaultButtonProps}
        >
          {t("ui.help")}
        </Button>
      )}
      <Drawer isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef} placement={"right"}>
        <DrawerOverlay />
        <DrawerContent display={"flex"} flexDir={"column"} h={"full"} maxW={"430px"}>
          <DrawerCloseButton fontSize={"xs"} />
          <DrawerHeader display={"flex"} alignItems={"center"} p={6} pt={10} fontSize={"2xl"}>
            <Info style={{ marginRight: "var(--chakra-sizes-2)" }} />
            {t("ui.help")}
          </DrawerHeader>

          <DrawerBody
            sx={{
              iframe: {
                w: "full",
                h: "full",
              },
            }}
          >
            <iframe src="https://www2.gov.bc.ca/gov/content?id=A5A88A4CE1D54D95AB23D57858EF11EE" title="Help"></iframe>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
