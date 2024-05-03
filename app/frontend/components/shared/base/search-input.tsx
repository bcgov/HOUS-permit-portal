import { Input, InputGroup, InputGroupProps, InputLeftElement, InputProps } from "@chakra-ui/react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { ChangeEvent, useCallback } from "react"
import { ISearch } from "../../../lib/create-search-model"
import { debounce } from "../../../utils/utility-functions"

interface IProps<TSearchModel extends ISearch> {
  searchModel: TSearchModel
  inputGroupProps?: Partial<InputGroupProps>
  inputProps?: Partial<InputProps>
  debounceTimeInMilliseconds?: number
}

export const SearchInput = observer(function SearchInput<TSearchModel extends ISearch>({
  searchModel,
  inputGroupProps,
  inputProps,
  debounceTimeInMilliseconds = 500,
}: IProps<TSearchModel>) {
  const { setQuery, query, search } = searchModel
  const debouncedSearch = useCallback(debounce(search, debounceTimeInMilliseconds), [search])

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    debouncedSearch()
  }

  return (
    <InputGroup as={"section"} w={"250px"} bg={"white"} {...inputGroupProps}>
      <Input
        title={"search input"}
        type={"search"}
        placeholder={"Search"}
        fontSize={"sm"}
        onChange={onSearch}
        value={query ?? ""}
        h="38px"
        borderColor="border.input"
        {...inputProps}
      />
      <InputLeftElement color={"greys.grey01"}>
        <MagnifyingGlass size={16} />
      </InputLeftElement>
    </InputGroup>
  )
})
