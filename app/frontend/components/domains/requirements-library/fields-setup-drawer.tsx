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
  onUse?: (
    requirementType: ERequirementType,
    closeDrawer?: () => void,
    isStepCodePackageFileRequirement?: boolean
  ) => void
  disabledRequirementTypeOptions?: Array<{
    requirementType: ERequirementType
    isStepCodePackageFileRequirement?: boolean
  }>
}

// TODO: remove when backend for these types is implemented
const DISABLED_TYPE_OPTIONS = [{ requirementType: ERequirementType.address }]

export const FieldsSetupDrawer = observer(function FieldsSetupMenu({
  defaultButtonProps,
  renderTriggerButton,
  onUse,
  disabledRequirementTypeOptions = [],
}: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()
  const disabledTypeOptions: Array<{
    requirementType: ERequirementType
    isStepCodePackageFileRequirement?: boolean
  }> = [...DISABLED_TYPE_OPTIONS, ...disabledRequirementTypeOptions]

  const requirementTypeOptions = Object.values(ERequirementType).reduce<
    {
      requirementType: ERequirementType
      isStepCodePackageFileRequirement?: boolean
    }[]
  >((acc, type) => {
    let options = {
      requirementType: type,
    }
    acc.push(options)

    // add pseudo type for step code package file
    if (type === ERequirementType.energyStepCode) {
      acc.push({ requirementType: ERequirementType.file, isStepCodePackageFileRequirement: true })
    }

    return acc
  }, [])
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
        <DrawerContent maxW={"550px"}>
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
              {requirementTypeOptions
                .filter(({ requirementType }) => hasRequirementFieldDisplayComponent(requirementType))
                .map(({ requirementType, isStepCodePackageFileRequirement = false }) => (
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
                    <RequirementFieldDisplay
                      requirementType={requirementType}
                      matchesStepCodePackageRequirementCode={isStepCodePackageFileRequirement}
                    />
                    <Button
                      variant={"primary"}
                      rightIcon={<CaretRight />}
                      isDisabled={
                        !!disabledTypeOptions.find(
                          (typeOption) =>
                            typeOption.requirementType === requirementType &&
                            (typeOption?.isStepCodePackageFileRequirement ?? false) === isStepCodePackageFileRequirement
                        )
                      }
                      onClick={() => onUse?.(requirementType, onClose, isStepCodePackageFileRequirement)}
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
