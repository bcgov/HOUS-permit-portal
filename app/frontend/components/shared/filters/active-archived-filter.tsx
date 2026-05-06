import { RadioGroup } from "@/components/ui/radio"
import { Button, ButtonProps, Portal, VStack } from "@chakra-ui/react"
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
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline" borderColor="semantic.info" bg="semantic.infoLight" {...rest}>
          {showArchived ? t("ui.archived", "Archived") : t("ui.active", "Active")}
          <CaretDown />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <RadioGroup.Root onValueChange={handleChange} value={String(showArchived)}>
              <VStack align="start" gap={4}>
                <RadioGroup.Item value="false">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{t("ui.active", "Active")}</RadioGroup.ItemText>
                </RadioGroup.Item>
                <RadioGroup.Item value="true">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{t("ui.archived", "Archived")}</RadioGroup.ItemText>
                </RadioGroup.Item>
              </VStack>
            </RadioGroup.Root>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
})
