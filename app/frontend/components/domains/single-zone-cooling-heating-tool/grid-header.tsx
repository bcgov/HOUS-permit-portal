import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { EPdfFormSortFields } from "../../../stores/pdf-form-store"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

interface IGridHeadersProps {
  columns: string[]
  includeActionColumn?: boolean
}
export const OVERHEATING_GRID_TEMPLATE_COLUMNS = "2fr 1.5fr 1.5fr 2fr 2fr 0.5fr"

export const GridHeaders = observer(function GridHeaders({ columns, includeActionColumn }: IGridHeadersProps) {
  const { pdfFormStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = pdfFormStore

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
              onClick={() => toggleSort(field as EPdfFormSortFields)}
              px={4}
            >
              <Text textAlign="left">{getSortColumnHeader(field as EPdfFormSortFields)}</Text>
              <SortIcon<EPdfFormSortFields> field={field as EPdfFormSortFields} currentSort={sort} />
            </Flex>
          </GridHeader>
        )
      })}
      {includeActionColumn && <GridHeader role={"columnheader"} />}
    </Box>
  )
})
