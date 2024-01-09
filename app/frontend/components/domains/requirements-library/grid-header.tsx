import { Box, Flex, GridItem, Input, InputGroup, InputLeftElement, Text, styled } from "@chakra-ui/react"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React, { ChangeEvent } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { ERequirementLibrarySortFields } from "../../../types/enums"
import { debounce } from "../../../utils/utility-funcitons"
import { SortIcon } from "../../shared/sort-icon"

export const GridHeaders = observer(function GridHeaders() {
  const { requirementBlockStore } = useMst()
  const { query, sort, getSortColumnHeader, toggleSort, fetchRequirementBlocks, setQuery } = requirementBlockStore
  const { t } = useTranslation()

  const debouncedFetchRequirementBlocks = debounce(fetchRequirementBlocks, 500)
  const search = async (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    await debouncedFetchRequirementBlocks({ reset: true })
  }

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem display={"flex"} gridColumn={"span 5"} p={6} bg={"greys.grey10"} justifyContent={"space-between"}>
          <Text role={"heading"} as={"h3"} color={"black"} fontSize={"sm"}>
            {t("requirementsLibrary.tableHeading")}
          </Text>
          <InputGroup w={"224px"} bg={"white"}>
            <Input placeholder={"Search"} fontSize={"sm"} onChange={search} value={query ?? ""} />
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
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {Object.values(ERequirementLibrarySortFields).map((field) => (
          <GridHeader key={field} role={"columnheader"}>
            <Flex
              w={"full"}
              as={"button"}
              justifyContent={"space-between"}
              cursor="pointer"
              onClick={() => toggleSort(field)}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              px={4}
            >
              <Text>{getSortColumnHeader(field)}</Text>
              <SortIcon<ERequirementLibrarySortFields> field={field} currentSort={sort} />
            </Flex>
          </GridHeader>
        ))}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})

const GridHeader = styled(GridItem)
GridHeader.defaultProps = {
  fontSize: "sm",
  py: 5,
  color: "text.secondary",
  fontWeight: 400,
  borderTop: "1px solid",
  borderBottom: "1px solid",
  borderColor: "border.light",
}
