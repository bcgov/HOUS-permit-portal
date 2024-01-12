import { Input, InputGroup, InputGroupProps, InputLeftElement, InputProps } from "@chakra-ui/react"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React, { ChangeEvent, useCallback } from "react"
import { ISearch } from "../../../lib/create-search-model"
import { debounce } from "../../../utils/utility-funcitons"

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
    <InputGroup as={"section"} w={"224px"} bg={"white"} {...inputGroupProps}>
      <Input
        title={"search input"}
        type={"search"}
        placeholder={"Search"}
        fontSize={"sm"}
        onChange={onSearch}
        value={query ?? ""}
        {...inputProps}
      />
      <InputLeftElement color={"greys.grey01"}>
        <FontAwesomeIcon
          style={{
            width: "14px",
            height: "14px",
          }}
          icon={faSearch}
        />
      </InputLeftElement>
    </InputGroup>
  )
})
