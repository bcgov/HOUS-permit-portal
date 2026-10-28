import { Box, Flex, HStack, Text, Tooltip } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { ERequirementLibrarySortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

type TRequirementLibrarySearchModel = ISearch & {
  getSortColumnHeader: (field: ERequirementLibrarySortFields) => string
}

export const GridHeaders = observer(function GridHeaders({
  searchModel: searchModelProp,
}: {
  searchModel?: TRequirementLibrarySearchModel
}) {
  const { requirementBlockStore } = useMst()
  const searchModel = searchModelProp ?? requirementBlockStore

  const { sort, getSortColumnHeader, toggleSort } = searchModel
  const { t } = useTranslation()

  return (
    <Box display={"contents"} role={"rowgroup"} position="fixed">
      <Box display={"contents"} role={"row"}>
        {Object.values(ERequirementLibrarySortFields).map((field) => (
          <GridHeader key={field} role={"columnheader"} minW={0} overflow="hidden">
            <Flex
              w={"full"}
              as={"button"}
              justifyContent={"space-between"}
              cursor="pointer"
              onClick={() => toggleSort(field)}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              px={4}
              minW={0}
              overflow="hidden"
              gap={2}
            >
              <Text isTruncated minW={0}>
                {getSortColumnHeader(field)}
              </Text>
              {field === ERequirementLibrarySortFields.associations ? (
                <HStack flexShrink={0} spacing={3}>
                  <SortIcon<ERequirementLibrarySortFields>
                    field={field}
                    currentSort={sort}
                    aria-label={`Sort ${getSortColumnHeader(field)} Icon`}
                  />
                  <Tooltip label={t("requirementsLibrary.associationsInfo")} placement="bottom-end">
                    <Info aria-label={"Info Icon"} />
                  </Tooltip>
                </HStack>
              ) : (
                <SortIcon<ERequirementLibrarySortFields>
                  field={field}
                  currentSort={sort}
                  aria-label={`Sort ${getSortColumnHeader(field)}`}
                />
              )}
            </Flex>
          </GridHeader>
        ))}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})
