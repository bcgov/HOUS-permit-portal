import { Button, ButtonProps, HStack, Menu, Portal, Text, useDisclosure } from "@chakra-ui/react"
import { CaretDown, Warning, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ERequirementType } from "../../../../types/enums"
import { ComputedComplianceSetupModal } from "./computed-compliance-setup-modal"
import { ConditionalSetupModal } from "./conditional-setup-modal"
import { DataValidationSetupModal } from "./data-validation-setup-modal"

export interface IRequirementOptionsMenu {
  menuButtonProps?: Partial<ButtonProps>
  onRemove?: () => void
  emitOpenState?: (isOpen: boolean) => void
  index: number
  disabledOptions?: Array<"remove" | "conditional">
  requirementType?: ERequirementType
}

export const OptionsMenu = observer(function OptionsMenu({
  disabledOptions = [],
  menuButtonProps,
  onRemove,
  emitOpenState,
  index,
  requirementType,
}: IRequirementOptionsMenu) {
  const { t } = useTranslation()
  const { open, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    emitOpenState?.(open)
  }, [open])

  return (
    <Menu.Root
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      positioning={{
        placement: "bottom-end",
      }}
    >
      <Menu.Trigger asChild>
        <Button
          _expanded={{
            "div > span": {
              textDecoration: "none",
            },
          }}
          css={{
            "& div > span": {
              textDecoration: "underline",
            },
          }}
          {...menuButtonProps}
        >
          {t("requirementsLibrary.modals.optionsMenu.triggerButton")}
          <CaretDown />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {requirementType === ERequirementType.number ||
            requirementType === ERequirementType.date ||
            requirementType === ERequirementType.multiOptionSelect ||
            requirementType === ERequirementType.file ? (
              <DataValidationSetupModal index={index} requirementType={requirementType} />
            ) : (
              <Menu.Item color={"text.primary"} disabled value="item-0">
                <HStack gap={2} fontSize={"sm"}>
                  <Warning />
                  <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.dataValidation")}</Text>
                </HStack>
              </Menu.Item>
            )}
            <ConditionalSetupModal
              index={index}
              triggerButtonProps={{
                isDisabled: disabledOptions.includes("conditional"),
              }}
            />
            <ComputedComplianceSetupModal requirementIndex={index} />
            <Menu.Separator />
            <Menu.Item
              color={"semantic.error"}
              onSelect={onRemove}
              disabled={disabledOptions.includes("remove")}
              value="item-1"
            >
              <HStack gap={2} fontSize={"sm"}>
                <X />
                <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.remove")}</Text>
              </HStack>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
})
