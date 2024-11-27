import { Button, Checkbox, CheckboxGroup, Collapse, CaretDown, Divider, Flex, Funnel } from "@chakra-ui/react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { ESortDirection } from "../../../../frontend/types/enums"
import { IOption, ISort } from "../../../../frontend/types/types"

interface ISearchSortProps {
  searchModel: ISearch
  i18nPrefix: string
  sortFields: string[]
  isOpen: boolean
}

export const StatusFilter: React.FC<ISearchSortProps> = ({ searchModel, i18nPrefix, sortFields, isOpen }: ISearchSortProps) => {
  const { t } = useTranslation()
  const uniqueId = React.useId()
  const [selectedOptions, setSelectedOptions] = useState([]);
  const options = ['Collaborating'];


  const sortOptions = useMemo(() => {
    const directions = Object.values(ESortDirection)

    const sortOptions: IOption<ISort>[] = []

    // sortFields.forEach((field: string) => {
    //   directions.forEach((direction) => {
    //     // @ts-ignore
    //     const label = t(`${i18nPrefix}.columns.${field}`) + ` - ${t(`ui.${direction}`)}`
    //     sortOptions.push({
    //       label,
    //       value: { field, direction },
    //     })
    //   })
    // })
    return sortOptions
  }, sortFields)

  //const { applySort, fetchData, sort } = searchModel

  // useEffect(() => {
  //   if (sortOptions.length === 0 || !sort) return

  //   const selected = sortOptions.find((so) => so.value.field === sort.field && so.value.direction === sort.direction)

  //   setSelectedOption(selected)
  // }, [JSON.stringify(sort)])

  const [selectedOption, setSelectedOption] = useState<IOption<ISort>>(null)

  // const handleChange = (selectedOption: IOption<ISort> | null) => {
  //   if (selectedOption) {
  //     setSelectedOption(selectedOption)
  //     applySort({
  //       field: selectedOption.value.field,
  //       direction: selectedOption.value.direction,
  //     })
  //     fetchData()
  //   }
  // }
  const handleCheckboxChange = (newSelectedOptions) => {
    setSelectedOptions(newSelectedOptions);
  };

  const handleClear = () => {
    setSelectedOptions([]);
  }
  return (<Flex direction="column" position="relative" zIndex={1}>
              <Collapse in={isOpen}>
                <Flex 
                direction="column"
                bg="white"
                border="2px solid #606060"
                borderRadius="sm"
                boxShadow="md"
                p={4}
                zIndex={1}
                position="absolute"
                >
                  <CheckboxGroup value={selectedOptions} onChange={handleCheckboxChange}>
                    {options.map((option) => (
                      <Checkbox key={option} value={option}>
                        {option}
                      </Checkbox>
                    ))}
                  </CheckboxGroup> 
                  <Divider borderColor="gray.300" />
                  <Button size="sm" variant="tertiary" onClick={handleClear}>
                    {t("ui.reset")}
                  </Button>
                </Flex>
              </Collapse>
        </Flex>)
}
