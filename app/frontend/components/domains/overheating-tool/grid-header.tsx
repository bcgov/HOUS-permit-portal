import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EOverheatingToolSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

export const OVERHEATING_GRID_TEMPLATE_COLUMNS =
  "minmax(0, 2fr) minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.5fr)"

export const GridHeaders = observer(function GridHeaders({ includeActionColumn }: { includeActionColumn?: boolean }) {
  const { t } = useTranslation() as any
  const { overheatingToolStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = overheatingToolStore

  return (
    <Box display={"contents"} role={"row"}>
      <GridHeader role={"columnheader"}>
        <Flex
          w={"full"}
          as={"button"}
          justifyContent={"space-between"}
          cursor="pointer"
          onClick={() => toggleSort(EOverheatingToolSortFields.projectNumber)}
          px={4}
        >
          <Text textAlign="left">{getSortColumnHeader(EOverheatingToolSortFields.projectNumber)}</Text>
          <SortIcon<EOverheatingToolSortFields> field={EOverheatingToolSortFields.projectNumber} currentSort={sort} />
        </Flex>
      </GridHeader>

      <GridHeader role={"columnheader"}>
        <Flex
          w={"full"}
          as={"button"}
          justifyContent={"space-between"}
          cursor="pointer"
          onClick={() => toggleSort(EOverheatingToolSortFields.address)}
          px={4}
        >
          <Text textAlign="left">{t("singleZoneCoolingHeatingTool.coverSheet.fields.buildingLocationAddress")}</Text>
          <SortIcon<EOverheatingToolSortFields> field={EOverheatingToolSortFields.address} currentSort={sort} />
        </Flex>
      </GridHeader>

      <GridHeader role={"columnheader"}>
        <Flex
          w={"full"}
          as={"button"}
          justifyContent={"space-between"}
          cursor="pointer"
          onClick={() => toggleSort(EOverheatingToolSortFields.createdAt)}
          px={4}
        >
          <Text textAlign="left">{getSortColumnHeader(EOverheatingToolSortFields.createdAt)}</Text>
          <SortIcon<EOverheatingToolSortFields> field={EOverheatingToolSortFields.createdAt} currentSort={sort} />
        </Flex>
      </GridHeader>

      <GridHeader role={"columnheader"}>
        <Flex w={"full"} px={4}>
          <Text textAlign="left">{t("singleZoneCoolingHeatingTool.coverSheet.rollupStatus")}</Text>
        </Flex>
      </GridHeader>

      {includeActionColumn && <GridHeader role={"columnheader"} />}
    </Box>
  )
})
