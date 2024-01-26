import {
  Button,
  ButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretRight, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { Ref, useRef } from "react"
import { useTranslation } from "react-i18next"
import { ERequirementType } from "../../../types/enums"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { RequirementFieldDisplay, hasRequirementFieldDisplayComponent } from "./requirement-field-display"

interface IProps {
  defaultButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps & { ref: Ref<HTMLElement> }) => JSX.Element
  onUse?: (requirementType: ERequirementType, closeDrawer?: () => void) => void
}

// TODO: remove when backend for these types is implemented
const DISABLED_TYPES = [
  ERequirementType.address,
  ERequirementType.select,
  ERequirementType.fileUpload,
  ERequirementType.generalContact,
]

export const FieldsSetupDrawer = observer(function FieldsSetupMenu({
  defaultButtonProps,
  renderTriggerButton,
  onUse,
}: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()

  return (
    <>
      {renderTriggerButton?.({ onClick: onOpen, ref: btnRef }) ?? (
        <Button
          leftIcon={<Plus size={12} />}
          variant={"primary"}
          onClick={onOpen}
          aria-label={"add form fields to requirement block"}
          {...defaultButtonProps}
        >
          {t("ui.add")}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent maxW={"500px"}>
          <DrawerCloseButton fontSize={"xs"} />
          <DrawerHeader color={"greys.white"} backgroundColor={"theme.blueAlt"} p={6} pt={10} fontSize={"2xl"}>
            {t("ui.add")}...
          </DrawerHeader>

          <DrawerBody p={0}>
            <Flex w={"full"} px={6} py={4} backgroundColor={"theme.blueLight"}>
              <Text
                as={"h3"}
                color={"text.primary"}
                fontSize={"sm"}
                fontWeight={700}
                borderRight={"1px solid"}
                borderColor={"text.secondary"}
                pr={4}
              >
                {t("requirementsLibrary.fieldsDrawer.formFields")}
              </Text>
              <RouterLinkButton to={"/"} textDecoration={"underline"} variant={"link"} ml={4}>
                {t("site.questionSupport")}
              </RouterLinkButton>
            </Flex>
            <Flex flexDir={"column"} w={"full"}>
              {Object.values(ERequirementType)
                .filter((requirementType) => hasRequirementFieldDisplayComponent(requirementType))
                .map((requirementType) => (
                  <HStack
                    key={requirementType}
                    alignItems={"flex-end"}
                    justifyContent={"space-between"}
                    spacing={6}
                    px={6}
                    pt={4}
                    pb={8}
                    borderBottom={"1px solid"}
                    borderColor={"border.light"}
                    sx={{
                      "&:last-of-type": { border: "none" },
                    }}
                  >
                    <RequirementFieldDisplay requirementType={requirementType} />
                    <Button
                      variant={"primary"}
                      rightIcon={<CaretRight />}
                      isDisabled={DISABLED_TYPES.includes(requirementType)}
                      onClick={() => onUse?.(requirementType, onClose)}
                    >
                      {t("requirementsLibrary.fieldsDrawer.useButton")}
                    </Button>
                  </HStack>
                ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})
