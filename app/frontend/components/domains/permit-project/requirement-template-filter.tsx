import {
  Button,
  ButtonProps,
  Checkbox,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  useCheckboxGroup,
  VStack,
} from "@chakra-ui/react"
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
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
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    requirementTemplateStore.fetchFilterOptions()
  }, [])

  const handleChange = (nextValue: string[]) => {
    setRequirementTemplateFilter(nextValue)
    search()
  }

  const handleReset = () => {
    setRequirementTemplateFilter(null)
    search()
  }

  const { getCheckboxProps } = useCheckboxGroup({
    value: requirementTemplateFilter || [],
    onChange: handleChange,
  })

  const filteredOptions = requirementTemplateStore.filterOptions?.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Menu>
      <MenuButton as={Button} variant="outline" rightIcon={<CaretDown />} {...rest}>
        {t("requirementTemplate.filter")}
      </MenuButton>
      <MenuList p={4} zIndex="dropdown">
        <VStack align="start" spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <MagnifyingGlass />
            </InputLeftElement>
            <Input placeholder={t("ui.search")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
          <Divider />
          {filteredOptions?.map((option) => {
            const checkboxProps = getCheckboxProps({ value: option.value })
            return (
              <Checkbox key={option.value} {...checkboxProps}>
                {option.label}
              </Checkbox>
            )
          })}
          <Divider />
          <Button
            onClick={handleReset}
            variant="primary"
            size="sm"
            alignSelf="center"
            w="full"
            isDisabled={!requirementTemplateFilter || requirementTemplateFilter.length === 0}
          >
            {t("ui.reset", "Reset")}
          </Button>
        </VStack>
      </MenuList>
    </Menu>
  )
})
