import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { EPermitProjectSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

interface IGridHeadersProps {
  columns: string[]
  includeActionColumn?: boolean
}

export const GridHeaders = observer(function GridHeaders({ columns, includeActionColumn }: IGridHeadersProps) {
  const { permitProjectStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = permitProjectStore

  return (
    <Box display={"contents"} role={"row"}>
      {columns.map((field) => {
        return (
          <GridHeader key={field} role={"columnheader"}>
            <Flex
              w={"full"}
              as={"button"}
              justifyContent={"space-between"}
              cursor="pointer"
              onClick={() => toggleSort(field as EPermitProjectSortFields)}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              px={4}
            >
              <Text textAlign="left">{getSortColumnHeader(field as EPermitProjectSortFields)}</Text>
              <SortIcon<EPermitProjectSortFields> field={field as EPermitProjectSortFields} currentSort={sort} />
            </Flex>
          </GridHeader>
        )
      })}
      {includeActionColumn && <GridHeader role={"columnheader"} />}
    </Box>
  )
})
