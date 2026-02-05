import { Button, Flex, Input, InputGroup, InputLeftElement } from "@chakra-ui/react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IOverheatingToolStore } from "../../../stores/overheating-tool-store"

interface ISearchInputProps {
  overheatingToolStore: IOverheatingToolStore
}

const SearchInput = observer(function SearchInput({ overheatingToolStore }: ISearchInputProps) {
  const { t } = useTranslation() as any
  const [searchValue, setSearchValue] = useState(overheatingToolStore.query || "")

  const handleSearch = useCallback(
    (value: string) => {
      overheatingToolStore.setQuery(value)
      overheatingToolStore.searchOverheatingTools({ page: 1 })
    },
    [overheatingToolStore]
  )

  useEffect(() => {
    setSearchValue(overheatingToolStore.query || "")
  }, [overheatingToolStore.query])

  return (
    <InputGroup maxW="400px">
      <InputLeftElement pointerEvents="none">
        <MagnifyingGlass size={20} />
      </InputLeftElement>
      <Input
        placeholder={t("ui.search") || "Search"}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(searchValue)
          }
        }}
      />
    </InputGroup>
  )
})

export const OverheatingToolGridHeader = observer(function OverheatingToolGridHeader() {
  const { t } = useTranslation() as any
  const { overheatingToolStore } = useMst()

  return (
    <Flex justify="space-between" align="center" mb={6}>
      <SearchInput overheatingToolStore={overheatingToolStore} />
      <Button variant="primary" onClick={() => (window.location.href = "/overheating-tool/start")}>
        {t("ui.createNew") || "Create New"}
      </Button>
    </Flex>
  )
})
