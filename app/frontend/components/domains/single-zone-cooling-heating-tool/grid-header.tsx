import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EPdfFormSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

export const OVERHEATING_GRID_TEMPLATE_COLUMNS = "2fr 1.5fr 1.5fr 2fr 2fr 0.5fr"

export const GridHeaders = observer(function GridHeaders({ includeActionColumn }: { includeActionColumn?: boolean }) {
  const { t } = useTranslation() as any
  const { pdfFormStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = pdfFormStore

  return (
    <Box display={"contents"} role={"row"}>
      <GridHeader role={"columnheader"}>
        <Flex
          w={"full"}
          as={"button"}
          justifyContent={"space-between"}
          cursor="pointer"
          onClick={() => toggleSort(EPdfFormSortFields.projectNumber)}
          px={4}
        >
          <Text textAlign="left">{getSortColumnHeader(EPdfFormSortFields.projectNumber)}</Text>
          <SortIcon<EPdfFormSortFields> field={EPdfFormSortFields.projectNumber} currentSort={sort} />
        </Flex>
      </GridHeader>

      <GridHeader role={"columnheader"}>
        <Flex w={"full"} justifyContent={"flex-start"} px={4}>
          <Text textAlign="left">{t("singleZoneCoolingHeatingTool.coverSheet.fields.buildingLocationAddress")}</Text>
        </Flex>
      </GridHeader>

      <GridHeader role={"columnheader"}>
        <Flex
          w={"full"}
          as={"button"}
          justifyContent={"space-between"}
          cursor="pointer"
          onClick={() => toggleSort(EPdfFormSortFields.createdAt)}
          px={4}
        >
          <Text textAlign="left">{getSortColumnHeader(EPdfFormSortFields.createdAt)}</Text>
          <SortIcon<EPdfFormSortFields> field={EPdfFormSortFields.createdAt} currentSort={sort} />
        </Flex>
      </GridHeader>

      {includeActionColumn && <GridHeader role={"columnheader"} />}
    </Box>
  )
})
