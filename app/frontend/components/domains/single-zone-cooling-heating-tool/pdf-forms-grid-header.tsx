import { Box, Flex, GridItem, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IPdfFormStore } from "../../../stores/pdf-form-store"
import { GridHeader } from "../../shared/grid/grid-header"

interface ISearchInputProps {
  pdfFormStore: IPdfFormStore
}

const SearchInput = observer(function SearchInput({ pdfFormStore }: ISearchInputProps) {
  const [searchValue, setSearchValue] = useState(pdfFormStore.query || "")

  // Debounced search function
  const debouncedSearch = useCallback(
    (value: string) => {
      const timeoutId = setTimeout(() => {
        pdfFormStore.setQuery(value)
        pdfFormStore.searchPdfForms({ page: 1 })
      }, 500)
      return () => clearTimeout(timeoutId)
    },
    [pdfFormStore]
  )

  const handleSearch = (value: string) => {
    setSearchValue(value)
    debouncedSearch(value)
  }

  // Sync with store changes
  useEffect(() => {
    setSearchValue(pdfFormStore.query || "")
  }, [pdfFormStore.query])

  return (
    <InputGroup maxW="300px">
      <InputLeftElement pointerEvents="none">
        <MagnifyingGlass size={16} />
      </InputLeftElement>
      <Input
        placeholder="Search by project number..."
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        bg="white"
        borderColor="gray.300"
        _hover={{ borderColor: "gray.400" }}
        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
      />
    </InputGroup>
  )
})

export const PdfFormsGridHeader = observer(function PdfFormsGridHeader() {
  const { pdfFormStore } = useMst()
  const { t } = useTranslation() as any

  const i18nPrefix = "singleZoneCoolingHeatingTool"

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 3"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"}>{t(`${i18nPrefix}.title`)}</Text>
          <SearchInput pdfFormStore={pdfFormStore} />
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        <GridHeader role={"columnheader"}>
          <Flex w={"full"} justifyContent={"flex-start"} px={4}>
            <Text textAlign="left">Project Number</Text>
          </Flex>
        </GridHeader>
        <GridHeader role={"columnheader"}>
          <Flex w={"full"} justifyContent={"flex-start"} px={4}>
            <Text textAlign="left">Created At</Text>
          </Flex>
        </GridHeader>
        <GridHeader role={"columnheader"}>
          <Flex w={"full"} justifyContent={"end"} px={4}>
            <Text textAlign="end">Actions</Text>
          </Flex>
        </GridHeader>
      </Box>
    </Box>
  )
})
