import { Box, Flex, GridItem, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { ERequirementTemplateSortFields } from "../../../types/enums"
import { Paginator } from "../base/inputs/paginator"
import { PerPageSelect } from "../base/inputs/per-page-select"
import { ModelSearchInput } from "../base/model-search-input"
import { SharedSpinner } from "../base/shared-spinner"
import { GridHeader } from "../grid/grid-header"
import { SearchGrid } from "../grid/search-grid"
import { SearchGridItem } from "../grid/search-grid-item"
import { SortIcon } from "../sort-icon"
import { VersionTag } from "../version-tag"
import { YesNoTag } from "../yes-no-tag"

interface RequirementTemplateGridProps {
  renderActions: (rt: any) => React.ReactNode // Replace 'any' with your actual type
}

export const RequirementTemplateGrid: React.FC<RequirementTemplateGridProps> = observer(({ renderActions }) => {
  const { requirementTemplateStore } = useMst()
  const {
    tableRequirementTemplates,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = requirementTemplateStore

  useSearch(requirementTemplateStore)

  return (
    <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
      <SearchGrid templateColumns="repeat(3, 1fr) 2fr repeat(3, 1fr)">
        <GridHeaders />

        {isSearching ? (
          <Flex py={50} gridColumn={"span 6"} width="100%" justifyContent="center">
            <SharedSpinner />
          </Flex>
        ) : (
          tableRequirementTemplates.map((rt) => (
            <Box key={rt.id} className={"requirements-template-grid-row"} role={"row"} display={"contents"}>
              <SearchGridItem fontWeight="bold">{rt.permitType.name}</SearchGridItem>
              <SearchGridItem fontWeight="bold">{rt.activity.name}</SearchGridItem>
              <SearchGridItem>
                <YesNoTag boolean={rt.firstNations} />
              </SearchGridItem>
              <SearchGridItem>{rt.description}</SearchGridItem>
              <SearchGridItem>
                {rt.publishedTemplateVersion?.versionDate ? (
                  <VersionTag versionDate={rt.publishedTemplateVersion.versionDate} />
                ) : null}
              </SearchGridItem>
              <SearchGridItem>{rt.jurisdictionsSize}</SearchGridItem>
              <SearchGridItem>{renderActions(rt)}</SearchGridItem>
            </Box>
          ))
        )}
      </SearchGrid>

      {/* Pagination Controls */}
      <Flex w={"full"} justifyContent={"space-between"}>
        <PerPageSelect
          handleCountPerPageChange={handleCountPerPageChange}
          countPerPage={countPerPage}
          totalCount={totalCount}
        />
        <Paginator
          current={currentPage}
          total={totalCount}
          totalPages={totalPages}
          pageSize={countPerPage}
          handlePageChange={handlePageChange}
          showLessItems={true}
        />
      </Flex>
    </VStack>
  )
})

const GridHeaders = observer(function GridHeaders() {
  const { requirementTemplateStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = requirementTemplateStore
  const { t } = useTranslation()

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 7"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"}>{t("requirementTemplate.index.tableHeading")}</Text>
          <ModelSearchInput searchModel={requirementTemplateStore} />
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {Object.values(ERequirementTemplateSortFields).map((field) => (
          <GridHeader key={field} role={"columnheader"}>
            <Flex
              w={"full"}
              as={"button"}
              justifyContent={"space-between"}
              cursor="pointer"
              onClick={() => toggleSort(field)}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              px={4}
            >
              <Text>{getSortColumnHeader(field)}</Text>
              <SortIcon<ERequirementTemplateSortFields> field={field} currentSort={sort} />
            </Flex>
          </GridHeader>
        ))}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})
