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
  }> = disabledRequirementTypeOptions

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
        <DrawerContent maxW={"685px"}>
          <DrawerCloseButton fontSize={"xs"} />
          <DrawerHeader color={"greys.white"} backgroundColor={"theme.blueAlt"} p={6} pt={10} fontSize={"2xl"}>
            {t("ui.add")}...
          </DrawerHeader>

          <DrawerBody p={0}>
            <Flex w={"full"} px={6} py={4} backgroundColor={"theme.blueLight"}>
              <Text as={"h3"} color={"text.primary"} fontSize={"sm"} fontWeight={700} pr={4}>
                {t("requirementsLibrary.fieldsDrawer.formFields")}
              </Text>
            </Flex>
            <Flex flexDir={"column"} w={"full"}>
              {requirementTypeOptions
                .filter(
                  ({ requirementType }) =>
                    hasRequirementFieldDisplayComponent(requirementType) && requirementType !== ERequirementType.address // filtering address for now because the back-end formio side of the address field is not yet implemented completely
                )
                .map(({ requirementType, isStepCodePackageFileRequirement = false }) => (
                  <HStack
                    key={`${requirementType}${isStepCodePackageFileRequirement ? "_stepCodePackage" : ""}`}
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
                      minW="76px"
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
