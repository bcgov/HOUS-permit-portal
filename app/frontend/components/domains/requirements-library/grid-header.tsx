import { Box, Flex, GridItem, Text, styled } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { ERequirementLibrarySortFields, ESortDirection } from "../../../types/enums"
import { SortIcon } from "../../shared/sort-icon"

export const GridHeaders = observer(function GridHeaders() {
  const { requirementBlockStore } = useMst()
  const { sort, applySort, clearSort, getSortColumnHeader } = requirementBlockStore

  const toggleSort = async (sortField: ERequirementLibrarySortFields) => {
    // calculate the next sort state based on current sort
    // descending -> ascending -> unsorted
    if (sort && sort.field == sortField && sort.direction == ESortDirection.ascending) {
      // return to unsorted state
      await clearSort()
    } else {
      // apply the next sort state
      const direction =
        sort?.field == sortField && sort?.direction == ESortDirection.descending
          ? ESortDirection.ascending
          : ESortDirection.descending
      applySort({ field: sortField, direction })
    }
  }

  return (
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
