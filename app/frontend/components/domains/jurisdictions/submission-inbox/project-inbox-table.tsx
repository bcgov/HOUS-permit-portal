import { Box, Circle, Flex, GridItem, HStack, Tag, Text, VStack } from "@chakra-ui/react"
import { Buildings } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../../models/permit-project"
import { IPermitProjectInboxStore } from "../../../../stores/submission-inbox-store"
import { EPermitProjectInboxSortFields, EProjectStatus } from "../../../../types/enums"
import { ISort } from "../../../../types/types"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { ModelSearchInput } from "../../../shared/base/model-search-input"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { SortIcon } from "../../../shared/sort-icon"

interface IProps {
  searchStore: IPermitProjectInboxStore
  projects: IPermitProject[]
}

const SORT_FIELDS = [
  EPermitProjectInboxSortFields.projectNumber,
  EPermitProjectInboxSortFields.address,
  EPermitProjectInboxSortFields.applications,
  EPermitProjectInboxSortFields.daysInQueue,
  EPermitProjectInboxSortFields.assigned,
  EPermitProjectInboxSortFields.status,
]

const statusColorMap: Record<string, { bg: string; color: string }> = {
  [EProjectStatus.inquiry]: { bg: "theme.blueLight", color: "text.primary" },
  [EProjectStatus.intake]: { bg: "theme.blueLight", color: "text.primary" },
  [EProjectStatus.onHold]: { bg: "theme.yellow", color: "text.primary" },
  [EProjectStatus.inReview]: { bg: "theme.yellow", color: "text.primary" },
  [EProjectStatus.awaitingPayment]: { bg: "theme.yellow", color: "text.primary" },
  [EProjectStatus.active]: { bg: "semantic.successLight", color: "semantic.success" },
  [EProjectStatus.inspections]: { bg: "semantic.successLight", color: "semantic.success" },
  [EProjectStatus.occupancy]: { bg: "semantic.successLight", color: "semantic.success" },
  [EProjectStatus.closed]: { bg: "greys.grey04", color: "text.secondary" },
}

export const ProjectInboxTable = observer(function ProjectInboxTable({ searchStore, projects }: IProps) {
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
      <SearchGrid templateColumns="2fr 1.5fr 1fr 1fr 1fr 1fr">
        <Box display="contents" role="rowgroup">
          <Box display="contents" role="row">
            <GridItem
              as={Flex}
              gridColumn="span 6"
              p={6}
              bg="greys.grey10"
              justifyContent="space-between"
              align="center"
            >
              <Text role="heading" fontWeight="bold">
                {totalCount != null
                  ? t("submissionInbox.projectCount", { count: totalCount })
                  : t("submissionInbox.projects")}
              </Text>
              <ModelSearchInput searchModel={searchStore} />
            </GridItem>
          </Box>
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
                  <SortIcon<EPermitProjectInboxSortFields>
                    field={field}
                    currentSort={sort as ISort<EPermitProjectInboxSortFields>}
                  />
                </Flex>
              </GridHeader>
            ))}
          </Box>
        </Box>

        {isSearching ? (
          <Flex py={50} gridColumn="span 6">
            <SharedSpinner />
          </Flex>
        ) : (
          projects.map((project) => (
            <Box key={project.id} className="project-inbox-grid-row" role="row" display="contents">
              <SearchGridItem>
                <HStack spacing={3}>
                  <Circle size="8px" bg="theme.blue" flexShrink={0} />
                  <Box p={1.5} borderRadius="sm" bg="greys.grey10" flexShrink={0}>
                    <Buildings size={16} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight={700} fontSize="sm">
                      {project.number}
                    </Text>
                    <Text fontSize="xs" color="text.secondary" noOfLines={1}>
                      {project.title}
                    </Text>
                  </VStack>
                </HStack>
              </SearchGridItem>

              <SearchGridItem>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm">{project.fullAddress}</Text>
                  {project.pid && (
                    <Text fontSize="xs" color="text.secondary">
                      PID {project.pid}
                    </Text>
                  )}
                </VStack>
              </SearchGridItem>

              <SearchGridItem>
                <Text fontSize="sm">
                  {project.totalPermitsCount > 0
                    ? `${project.newlySubmittedCount + project.resubmittedCount} of ${project.totalPermitsCount} received`
                    : "0 of 0 received"}
                </Text>
              </SearchGridItem>

              <SearchGridItem>
                {/* ### SUBMISSION INDEX STUB FEATURE - days in queue */}
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight={600}>
                    --
                  </Text>
                </VStack>
              </SearchGridItem>

              <SearchGridItem>
                {/* ### SUBMISSION INDEX STUB FEATURE - assigned */}
                <Text fontSize="sm" color="text.secondary">
                  Unassigned +
                </Text>
              </SearchGridItem>

              <SearchGridItem>
                <Tag
                  p={1}
                  bg={statusColorMap[project.rollupStatus]?.bg || "greys.grey04"}
                  color={statusColorMap[project.rollupStatus]?.color || "text.secondary"}
                  fontWeight="bold"
                  border="1px solid"
                  borderColor="border.light"
                  textTransform="uppercase"
                  minW="fit-content"
                  textAlign="center"
                  fontSize="xs"
                >
                  {/* @ts-ignore */}
                  {t(`permitProject.rollupStatus.${project.rollupStatus}`)}
                </Tag>
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
