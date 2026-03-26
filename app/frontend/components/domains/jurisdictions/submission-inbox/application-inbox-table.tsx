import { Box, Circle, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { IPermitApplicationInboxStore } from "../../../../stores/submission-inbox-store"
import { EPermitApplicationInboxSortFields } from "../../../../types/enums"
import { ISort } from "../../../../types/types"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"
import { SortIcon } from "../../../shared/sort-icon"

interface IProps {
  searchStore: IPermitApplicationInboxStore
  applications: IPermitApplication[]
}

const SORT_FIELDS = [
  EPermitApplicationInboxSortFields.number,
  EPermitApplicationInboxSortFields.permitClassification,
  EPermitApplicationInboxSortFields.submitter,
  EPermitApplicationInboxSortFields.submittedAt,
  EPermitApplicationInboxSortFields.status,
]

export const ApplicationInboxTable = observer(function ApplicationInboxTable({ searchStore, applications }: IProps) {
  const { t } = useTranslation()
  const {
    toggleSort,
    sort,
    getSortColumnHeader,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = searchStore

  return (
    <VStack w="full" spacing={5}>
      <SearchGrid
        templateColumns="2fr 1.5fr 1fr 1fr 1fr"
        gridRowClassName="application-inbox-grid-row"
        sx={{
          ".application-inbox-grid-row:hover > div": {
            bg: "greys.grey04",
          },
        }}
      >
        <Box display="contents" role="rowgroup">
          <Box display="contents" role="row">
            {SORT_FIELDS.map((field) => (
              <GridHeader key={field} role="columnheader">
                <Flex
                  w="full"
                  as="button"
                  justifyContent="space-between"
                  cursor="pointer"
                  onClick={() => toggleSort(field)}
                  borderRight="1px solid"
                  borderColor="border.light"
                  px={4}
                >
                  <Text textAlign="left">{getSortColumnHeader(field)}</Text>
                  <SortIcon<EPermitApplicationInboxSortFields>
                    field={field}
                    currentSort={sort as ISort<EPermitApplicationInboxSortFields>}
                  />
                </Flex>
              </GridHeader>
            ))}
          </Box>
        </Box>

        {isSearching ? (
          <Flex py={50} gridColumn="span 5">
            <SharedSpinner />
          </Flex>
        ) : (
          applications.map((application) => (
            <Box
              key={application.id}
              className="application-inbox-grid-row"
              role="row"
              display="contents"
              cursor="pointer"
              _hover={{ textDecoration: "none" }}
            >
              <SearchGridItem>
                <HStack spacing={3}>
                  <Circle size="8px" bg="transparent" flexShrink={0} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight={700} fontSize="sm">
                      {application.number}
                    </Text>
                    <Text fontSize="xs" color="text.secondary" noOfLines={1}>
                      {application.nickname || "—"}
                    </Text>
                  </VStack>
                </HStack>
              </SearchGridItem>

              <SearchGridItem>
                <Text fontSize="sm" noOfLines={1}>
                  {application.permitType?.name || "—"}
                </Text>
              </SearchGridItem>

              <SearchGridItem>
                <Text fontSize="sm" color="text.secondary">
                  {/* ### SUBMISSION INDEX STUB FEATURE - submitter */}—
                </Text>
              </SearchGridItem>

              <SearchGridItem>
                <Text fontSize="sm" color="text.secondary">
                  {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : "—"}
                </Text>
              </SearchGridItem>

              <SearchGridItem>
                <PermitApplicationStatusTag status={application.status} size="sm" px={2} py={0.5} fontSize="xs" />
              </SearchGridItem>
            </Box>
          ))
        )}
      </SearchGrid>
      <Flex w="full" justifyContent="space-between">
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
          showLessItems
        />
      </Flex>
    </VStack>
  )
})
