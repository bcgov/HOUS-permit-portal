import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { CaretDown, SlidersHorizontal, Warning, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"

interface IProps {
  menuButtonProps?: Partial<MenuButtonProps>
  onRemove?: () => void
}

export const OptionsMenu = observer(function UnitSelect({ menuButtonProps, onRemove }: IProps) {
  const { t } = useTranslation()
  return (
    <Menu placement={"bottom-end"}>
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
        righIcon={<CaretDown />}
        {...menuButtonProps}
      >
        <HStack justifyContent={"space-between"} w={"full"}>
          <Text color={"text.primary"} as={"span"} flex={1} w={"full"}>
            {t("requirementsLibrary.modals.optionsMenu.triggerButton")}
          </Text>
          <CaretDown />
        </HStack>
      </MenuButton>
      <MenuList w={"220px"}>
        <MenuItem color={"text,primary"} isDisabled>
          <HStack spacing={2} fontSize={"sm"}>
            <Warning />
            <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.dataValidation")}</Text>
          </HStack>
        </MenuItem>
        <MenuItem color={"text,primary"} isDisabled>
          <HStack spacing={2} fontSize={"sm"}>
            <SlidersHorizontal />
            <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.conditionalLogic")}</Text>
          </HStack>
        </MenuItem>
        <MenuDivider />
        <MenuItem color={"semantic.error"} onClick={onRemove}>
          <HStack spacing={2} fontSize={"sm"}>
            <X />
            <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.remove")}</Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  )
})
