import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { EJurisdictionSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

interface IGridHeadersProps {
  columns: string[]
  includeActionColumn?: boolean
}

export const GridHeaders = observer(function GridHeaders({ columns, includeActionColumn }: IGridHeadersProps) {
  const { jurisdictionStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = jurisdictionStore

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        {columns.map((field) => {
          return (
            <GridHeader key={field} role={"columnheader"}>
              <Flex
                w={"full"}
                as={"button"}
                justifyContent={"space-between"}
                cursor="pointer"
                onClick={() => toggleSort(field as any as EJurisdictionSortFields)}
                borderRight={"1px solid"}
                borderColor={"border.light"}
                px={4}
              >
                <Text textAlign="left">{getSortColumnHeader(field as any as EJurisdictionSortFields)}</Text>
                <SortIcon<EJurisdictionSortFields> field={field as any as EJurisdictionSortFields} currentSort={sort} />
              </Flex>
            </GridHeader>
          )
        })}
        {includeActionColumn && <GridHeader role={"columnheader"} />}
      </Box>
    </Box>
  )
})
