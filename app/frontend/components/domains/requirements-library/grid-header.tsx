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
        {Object.values(ERequirementLibrarySortFields).map((field) => {
          const fitHeader =
            field === ERequirementLibrarySortFields.requirementLabels ||
            field === ERequirementLibrarySortFields.updatedAt
          return (
            <GridHeader
              key={field}
              role={"columnheader"}
              overflow={fitHeader ? "visible" : "hidden"}
              minW={fitHeader ? "max-content" : 0}
            >
              <Flex
                w={"full"}
                minW={fitHeader ? "max-content" : 0}
                as={"button"}
                justifyContent={"space-between"}
                alignItems="center"
                gap={2}
                cursor="pointer"
                onClick={() => toggleSort(field)}
                borderRight={"1px solid"}
                borderColor={"border.light"}
                px={4}
              >
                <Text
                  as="span"
                  whiteSpace="nowrap"
                  minW={fitHeader ? "max-content" : 0}
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {getSortColumnHeader(field)}
                </Text>
                {field === ERequirementLibrarySortFields.associations ? (
                  <HStack flexShrink={0} spacing={3}>
                    <SortIcon<ERequirementLibrarySortFields>
                      field={field}
                      currentSort={sort}
                      aria-label={`Sort ${getSortColumnHeader(field)} Icon`}
                    />
                    <Tooltip
                      label={t("requirementsLibrary.associationsInfo")}
                      placement="bottom-end"
                      shouldWrapChildren
                    >
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
          )
        })}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})
