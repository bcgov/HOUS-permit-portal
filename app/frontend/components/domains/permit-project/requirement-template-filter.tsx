import { Button, ButtonProps, Checkbox, Menu, MenuButton, MenuList, useCheckboxGroup, VStack } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"

interface IRequirementTemplateFilterProps<TSearchModel extends ISearch> extends ButtonProps {
  searchModel: TSearchModel
}

export const RequirementTemplateFilter = observer(function RequirementTemplateFilter<TSearchModel extends ISearch>({
  searchModel,
  ...rest
}: IRequirementTemplateFilterProps<TSearchModel>) {
  const { t } = useTranslation()
  const { requirementTemplateStore } = useMst()
  const { requirementTemplateFilter, setRequirementTemplateFilter, search } = searchModel as any

  useEffect(() => {
    requirementTemplateStore.fetchFilterOptions()
  }, [])

  const handleChange = (nextValue: string[]) => {
    setRequirementTemplateFilter(nextValue)
    search()
  }

  const { getCheckboxProps } = useCheckboxGroup({
    value: requirementTemplateFilter || [],
    onChange: handleChange,
  })

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        // borderColor="semantic.info"
        // bg="semantic.infoLight"
        rightIcon={<CaretDown />}
        {...rest}
      >
        {t("requirementTemplate.filter")}
      </MenuButton>
      <MenuList p={4} zIndex="dropdown">
        <VStack align="start" spacing={4}>
          {requirementTemplateStore?.filterOptions?.map((option) => {
            const checkboxProps = getCheckboxProps({ value: option.value })
            return (
              <Checkbox key={option.value} {...checkboxProps}>
                {option.label}
              </Checkbox>
            )
          })}
        </VStack>
      </MenuList>
    </Menu>
  )
})
