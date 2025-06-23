import { Button, ButtonProps, Menu, MenuButton, MenuList, Radio, RadioGroup, VStack } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"

interface IActiveArchivedFilterProps<TSearchModel extends ISearch> extends ButtonProps {
  searchModel: TSearchModel
}

export const ActiveArchivedFilter = observer(function ActiveArchivedFilter<TSearchModel extends ISearch>({
  searchModel,
  ...rest
}: IActiveArchivedFilterProps<TSearchModel>) {
  const { t } = useTranslation()
  const { showArchived, setShowArchived, search } = searchModel

  const handleChange = (nextValue: string) => {
    const boolValue = nextValue === "true"
    if (showArchived !== boolValue) {
      setShowArchived(boolValue)
      search()
    }
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        borderColor="semantic.info"
        bg="semantic.infoLight"
        rightIcon={<CaretDown />}
        {...rest}
      >
        {showArchived ? t("ui.archived", "Archived") : t("ui.active", "Active")}
      </MenuButton>
      <MenuList p={4} zIndex="dropdown">
        <RadioGroup onChange={handleChange} value={String(showArchived)}>
          <VStack align="start" spacing={4}>
            <Radio value="false">{t("ui.active", "Active")}</Radio>
            <Radio value="true">{t("ui.archived", "Archived")}</Radio>
          </VStack>
        </RadioGroup>
      </MenuList>
    </Menu>
  )
})
