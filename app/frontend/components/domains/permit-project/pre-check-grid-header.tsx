import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { EPreCheckSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

interface IGridHeadersProps {
  columns: string[]
  includeActionColumn?: boolean
}
export const PRE_CHECKS_GRID_TEMPLATE_COLUMNS = "2fr 1.5fr 1.5fr 1.5fr 0.5fr"

export const PreCheckGridHeaders = observer(function PreCheckGridHeaders({
  columns,
  includeActionColumn,
}: IGridHeadersProps) {
  const { preCheckStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = preCheckStore

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
              onClick={() => toggleSort(field as EPreCheckSortFields)}
              px={4}
            >
              <Text textAlign="left">{getSortColumnHeader(field as EPreCheckSortFields)}</Text>
              <SortIcon<EPreCheckSortFields> field={field as EPreCheckSortFields} currentSort={sort} />
            </Flex>
          </GridHeader>
        )
      })}
      {includeActionColumn && <GridHeader role={"columnheader"} />}
    </Box>
  )
})
