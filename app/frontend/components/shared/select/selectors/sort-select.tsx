import { Flex, FormLabel } from "@chakra-ui/react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { ISearch } from "../../../../lib/create-search-model"
// import { EPermitApplicationSortFields, ESortDirection } from "../../../../types/enums"
import { ESortDirection } from "../../../../types/enums"
import { IOption, ISort } from "../../../../types/types"

interface ISearchSortProps {
  searchModel: ISearch
  i18nPrefix: string
  sortFields: string[]
}

export const SortSelect: React.FC<ISearchSortProps> = ({ searchModel, i18nPrefix, sortFields }: ISearchSortProps) => {
  const { t } = useTranslation()
  const uniqueId = React.useId()

  const sortOptions = useMemo(() => {
    const directions = Object.values(ESortDirection)

    const sortOptions: IOption<ISort>[] = []

    sortFields.forEach((field: string) => {
      directions.forEach((direction) => {
        // @ts-ignore
        const label = t(`${i18nPrefix}.columns.${field}`) + ` - ${t(`ui.${direction}`)}`
        sortOptions.push({
          label,
          value: { field, direction },
        })
      })
    })
    return sortOptions
  }, sortFields)

  const { applySort, fetchData, sort } = searchModel

  useEffect(() => {
    if (sortOptions.length === 0 || !sort) return

    const selected = sortOptions.find((so) => so.value.field === sort.field && so.value.direction === sort.direction)

    setSelectedOption(selected)
  }, [JSON.stringify(sort)])

  const [selectedOption, setSelectedOption] = useState<IOption<ISort>>(null)

  const handleChange = (selectedOption: IOption<ISort> | null) => {
    if (selectedOption) {
      setSelectedOption(selectedOption)
      applySort({
        field: selectedOption.value.field,
        direction: selectedOption.value.direction,
      })
      fetchData()
    }
  }

  return (
    <Flex direction="column" minW={250}>
      <FormLabel htmlFor={uniqueId}>{t("ui.sortBy")}</FormLabel>

      <Select
        inputId={uniqueId}
        options={sortOptions}
        onChange={handleChange}
        value={selectedOption}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => `${option.value.field}-${option.value.direction}`}
      />
    </Flex>
  )
}
