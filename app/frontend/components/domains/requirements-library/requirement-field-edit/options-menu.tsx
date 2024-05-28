import {
  Button,
  ButtonProps,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretDown, Warning, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ComputedComplianceSetupModal } from "./computed-compliance-setup-modal"
import { ConditionalSetupModal } from "./conditional-setup-modal"

export interface IRequirementOptionsMenu {
  menuButtonProps?: Partial<ButtonProps>
  onRemove?: () => void
  emitOpenState?: (isOpen: boolean) => void
  index: number
  disabledOptions?: Array<"remove" | "conditional">
}

export const OptionsMenu = observer(function OptionsMenu({
  disabledOptions = [],
  menuButtonProps,
  onRemove,
  emitOpenState,
  index,
}: IRequirementOptionsMenu) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    emitOpenState?.(isOpen)
  }, [isOpen])

  return (
    <Menu isOpen={isOpen} onClose={onClose} onOpen={onOpen} placement={"bottom-end"}>
      <MenuButton
        as={Button}
        _expanded={{
          "div > span": {
            textDecoration: "none",
          },
        }}
        sx={{
          "div > span": {
            textDecoration: "underline",
          },
        }}
        rightIcon={<CaretDown />}
        {...menuButtonProps}
      >
        {t("requirementsLibrary.modals.optionsMenu.triggerButton")}
      </MenuButton>
      <MenuList w={"220px"}>
        <MenuItem color={"text.primary"} isDisabled>
          <HStack spacing={2} fontSize={"sm"}>
            <Warning />
            <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.dataValidation")}</Text>
          </HStack>
        </MenuItem>
        <ConditionalSetupModal
          index={index}
          triggerButtonProps={{
            isDisabled: disabledOptions.includes("conditional"),
          }}
        />
        <ComputedComplianceSetupModal requirementIndex={index} />

        <MenuDivider />
        <MenuItem color={"semantic.error"} onClick={onRemove} isDisabled={disabledOptions.includes("remove")}>
          <HStack spacing={2} fontSize={"sm"}>
            <X />
            <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.remove")}</Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  )
})
