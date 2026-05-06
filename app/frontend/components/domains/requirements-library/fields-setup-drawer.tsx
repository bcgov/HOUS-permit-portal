import { Button, ButtonProps, Drawer, Flex, HStack, Portal, Text, useDisclosure } from "@chakra-ui/react"
import { CaretRight, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { Ref, useRef } from "react"
import { useTranslation } from "react-i18next"
import { ERequirementType } from "../../../types/enums"
import { RequirementFieldDisplay, hasRequirementFieldDisplayComponent } from "./requirement-field-display"

interface IProps {
  defaultButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps & { ref: Ref<HTMLElement> }) => JSX.Element
  onUse?: (requirementType: ERequirementType, closeDrawer?: () => void) => void
  disabledRequirementTypeOptions?: Array<{
    requirementType: ERequirementType
  }>
}

export const FieldsSetupDrawer = observer(function FieldsSetupMenu({
  defaultButtonProps,
  renderTriggerButton,
  onUse,
  disabledRequirementTypeOptions = [],
}: IProps) {
  const { t } = useTranslation()
  const { open, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()
  const disabledTypeOptions: Array<{
    requirementType: ERequirementType
  }> = disabledRequirementTypeOptions

  const requirementTypeOptions = Object.values(ERequirementType).map((requirementType) => ({ requirementType }))

  return (
    <>
      {renderTriggerButton?.({ onClick: onOpen, ref: btnRef }) ?? (
        <Button
          variant={"primary"}
          onClick={onOpen}
          aria-label={"add form fields to requirement block"}
          {...defaultButtonProps}
        >
          <Plus size={12} />
          {t("ui.add")}
        </Button>
      )}
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
            <Drawer.Content maxW={"700px"}>
              <Drawer.CloseTrigger fontSize={"xs"} />
              <Drawer.Header color={"greys.white"} backgroundColor={"theme.blueAlt"} p={6} pt={10} fontSize={"2xl"}>
                {t("ui.add")}...
              </Drawer.Header>
              <Drawer.Body p={0}>
                <Flex w={"full"} px={6} py={4} backgroundColor={"theme.blueLight"}>
                  <Text as={"h3"} color={"text.primary"} fontSize={"sm"} fontWeight={700} pr={4}>
                    {t("requirementsLibrary.fieldsDrawer.formFields")}
                  </Text>
                </Flex>
                <Flex flexDir={"column"} w={"full"}>
                  {requirementTypeOptions
                    .filter(({ requirementType }) => hasRequirementFieldDisplayComponent(requirementType))
                    .map(({ requirementType }) => (
                      <HStack
                        key={`${requirementType}`}
                        alignItems={"flex-end"}
                        justifyContent={"space-between"}
                        gap={6}
                        px={6}
                        pt={4}
                        pb={8}
                        borderBottom={"1px solid"}
                        borderColor={"border.light"}
                        css={{
                          "& &:last-of-type": { border: "none" },
                        }}
                      >
                        <RequirementFieldDisplay inputOptions={{}} requirementType={requirementType} />
                        <Button
                          minW="76px"
                          variant={"primary"}
                          disabled={
                            !!disabledTypeOptions.find((typeOption) => typeOption.requirementType === requirementType)
                          }
                          onClick={() => onUse?.(requirementType, onClose)}
                        >
                          {t("requirementsLibrary.fieldsDrawer.useButton")}
                          <CaretRight />
                        </Button>
                      </HStack>
                    ))}
                </Flex>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  )
})
