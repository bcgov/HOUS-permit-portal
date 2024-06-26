import { Input, InputGroup, InputGroupProps, InputLeftElement, InputProps } from "@chakra-ui/react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { ISearch } from "../../../lib/create-search-model"

interface IProps {
  onQueryChange: (query: string | null | undefined) => void
  query: string | undefined
  inputGroupProps?: Partial<InputGroupProps>
  inputProps?: Partial<InputProps>
}

export const SearchInput = observer(function SearchInput<TSearchModel extends ISearch>({
  query,
  onQueryChange,
  inputGroupProps,
  inputProps,
}: IProps) {
  return (
    <InputGroup as={"section"} w={"250px"} bg={"white"} {...inputGroupProps}>
      <Input
        title={"search input"}
        type={"search"}
        placeholder={"Search"}
        fontSize={"sm"}
        onChange={(e) => onQueryChange(e.target.value)}
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
