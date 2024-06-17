import { InputGroupProps, InputProps } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { ISearch } from "../../../lib/create-search-model"
import { debounce } from "../../../utils/utility-functions"
import { SearchInput } from "./search-input"

interface IProps<TSearchModel extends ISearch> {
  searchModel: TSearchModel
  inputGroupProps?: Partial<InputGroupProps>
  inputProps?: Partial<InputProps>
  debounceTimeInMilliseconds?: number
}

export const ModelSearchInput = observer(function ModelSearchInput<TSearchModel extends ISearch>({
  searchModel,
  inputGroupProps,
  inputProps,
  debounceTimeInMilliseconds = 500,
}: IProps<TSearchModel>) {
  const { setQuery, query, search } = searchModel
  const debouncedSearch = useCallback(debounce(search, debounceTimeInMilliseconds), [search])

  const onSearch = (query: string) => {
    setQuery(query)
    debouncedSearch()
  }

  return (
    <SearchInput query={query} onQueryChange={onSearch} inputGroupProps={inputGroupProps} inputProps={inputProps} />
  )
})
