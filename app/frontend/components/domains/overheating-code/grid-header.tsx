import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { EOverheatingCodeSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

export const OverheatingCodeGridHeaders = observer(function OverheatingCodeGridHeaders() {
  const { overheatingCodeStore } = useMst()
  const { getSortColumnHeader, toggleSort, sort } = overheatingCodeStore

  return (
    <Box display={"contents"} role={"row"}>
      {Object.values(EOverheatingCodeSortFields).map((field) => (
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
            <Text textAlign="left">{getSortColumnHeader(field)}</Text>
            <SortIcon<EOverheatingCodeSortFields> field={field} currentSort={sort} />
          </Flex>
        </GridHeader>
      ))}
      <GridHeader role={"columnheader"} />
    </Box>
  )
})
