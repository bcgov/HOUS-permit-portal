import { Input, InputGroup, InputGroupProps, InputLeftElement, InputProps } from "@chakra-ui/react"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React, { ChangeEvent, useCallback } from "react"
import { debounce } from "../../../utils/utility-funcitons"

interface IProps {
  setQuery: (query: string) => void
  handleSearch: () => void | Promise<void>
  query: string
  inputGroupProps?: Partial<InputGroupProps>
  inputProps?: Partial<InputProps>
  debounceTimeInMilliseconds?: number
}

export const SearchInput = observer(function SearchInput({
  handleSearch,
  setQuery,
  query,
  inputGroupProps,
  inputProps,
  debounceTimeInMilliseconds = 500,
}: IProps) {
  const debouncedHandleSearch = useCallback(debounce(handleSearch, debounceTimeInMilliseconds), [handleSearch])
  const search = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    debouncedHandleSearch()
  }
  return (
    <InputGroup as={"section"} w={"224px"} bg={"white"} {...inputGroupProps}>
      <Input
        type={"search"}
        placeholder={"Search"}
        fontSize={"sm"}
        onChange={search}
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
