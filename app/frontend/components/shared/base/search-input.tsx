import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputGroupProps,
  InputLeftElement,
  InputProps,
  InputRightElement,
} from "@chakra-ui/react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"

interface IProps {
  onQueryChange: (query: string | null | undefined) => void
  query: string | undefined
  inputGroupProps?: Partial<InputGroupProps>
  inputProps?: Partial<InputProps>
  label?: string
}

export const SearchInput = observer(function SearchInput({
  query,
  onQueryChange,
  inputGroupProps,
  inputProps,
  label,
}: IProps) {
  const isLabeled = !!label

  const input = (
    <InputGroup
      {...(isLabeled ? {} : { as: "section" })}
      w={isLabeled ? "630px" : "250px"}
      maxW="full"
      bg="white"
      {...inputGroupProps}
    >
      <Input
        title={isLabeled ? undefined : "search input"}
        type="search"
        placeholder={isLabeled ? undefined : "Search"}
        fontSize={isLabeled ? "md" : "sm"}
        onChange={(e) => onQueryChange(e.target.value)}
        value={query ?? ""}
        h={isLabeled ? "40px" : "38px"}
        borderColor={isLabeled ? "border.light" : "border.input"}
        {...inputProps}
      />
      {isLabeled ? (
        <InputRightElement pointerEvents="none" color="greys.grey01" h="40px">
          <MagnifyingGlass size={20} />
        </InputRightElement>
      ) : (
        <InputLeftElement color="greys.grey01">
          <MagnifyingGlass size={16} />
        </InputLeftElement>
      )}
    </InputGroup>
  )

  if (!isLabeled) return input

  return (
    <FormControl display="flex" flexDirection="column" w="630px" maxW="full">
      <FormLabel mb={0} py={1} fontWeight="bold" fontSize="md" lineHeight="normal">
        {label}
      </FormLabel>
      {input}
    </FormControl>
  )
})
