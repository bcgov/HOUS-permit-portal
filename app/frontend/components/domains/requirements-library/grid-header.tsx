import { Tooltip } from "@/components/ui/tooltip"
import { Box, Flex, GridItem, HStack, Text } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { ERequirementLibrarySortFields } from "../../../types/enums"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

export const GridHeaders = observer(function GridHeaders() {
  const { requirementBlockStore } = useMst()
  const searchModel = requirementBlockStore

  const { sort, getSortColumnHeader, toggleSort } = searchModel
  const { t } = useTranslation()

  return (
    <Box display={"contents"} role={"rowgroup"} position="fixed">
      <Box display={"contents"} role={"row"}>
        <GridItem
          gridColumn={"span 6"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
          asChild
        >
          <Flex>
            <Text role={"heading"}>{t("requirementsLibrary.index.tableHeading")}</Text>
            <ModelSearchInput
              inputGroupProps={{
                position: "sticky",
                right: 6,
              }}
              searchModel={searchModel as ISearch}
            />
          </Flex>
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {Object.values(ERequirementLibrarySortFields).map((field) => (
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
              <button onClick={() => toggleSort(field)}>
                <Text>{getSortColumnHeader(field)}</Text>
                {field === ERequirementLibrarySortFields.associations ? (
                  <HStack w={"fit-content"} gap={3}>
                    <SortIcon<ERequirementLibrarySortFields>
                      field={field}
                      currentSort={sort}
                      aria-label={`Sort ${getSortColumnHeader(field)} Icon`}
                    />
                    <Tooltip content={t("requirementsLibrary.associationsInfo")}>
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
              </button>
            </Flex>
          </GridHeader>
        ))}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})
