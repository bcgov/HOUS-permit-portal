import { Box, Flex, GridItem, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EJurisdictionSortFields } from "../../../types/enums"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

interface IGridHeadersProps {
  columns: string[]
  span: number
  includeActionColumn?: boolean
}

export const GridHeaders = observer(function GridHeaders({ columns, span, includeActionColumn }: IGridHeadersProps) {
  const { jurisdictionStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = jurisdictionStore
  const { t } = useTranslation()

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          gridColumn={`span ${span}`}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
          asChild
        >
          <Flex>
            <Text role={"heading"}>{t("jurisdiction.index.tableHeading")}</Text>
            <ModelSearchInput searchModel={jurisdictionStore} />
          </Flex>
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {columns.map((field) => {
          return (
            <GridHeader key={field} role={"columnheader"}>
              <Flex
                w={"full"}
                justifyContent={"space-between"}
                cursor="pointer"
                borderRight={"1px solid"}
                borderColor={"border.light"}
                px={4}
                asChild
              >
                <button onClick={() => toggleSort(field as any as EJurisdictionSortFields)}>
                  <Text textAlign="left">{getSortColumnHeader(field as any as EJurisdictionSortFields)}</Text>
                  <SortIcon<EJurisdictionSortFields>
                    field={field as any as EJurisdictionSortFields}
                    currentSort={sort}
                  />
                </button>
              </Flex>
            </GridHeader>
          )
        })}
        {includeActionColumn && <GridHeader role={"columnheader"} />}
      </Box>
    </Box>
  )
})
