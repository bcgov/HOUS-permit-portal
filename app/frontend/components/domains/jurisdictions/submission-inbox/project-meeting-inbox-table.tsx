import { Box, Link as ChakraLink, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { CalendarBlank, Chat } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"
import { datefnsTableDateFormat, datefnsTableDateTimeFormat } from "../../../../constants"
import { ISearch } from "../../../../lib/create-search-model"
import { IProjectMeeting } from "../../../../models/project-meeting"
import { EProjectMeetingSortFields } from "../../../../types/enums"
import { ISort } from "../../../../types/types"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { UnreadIndicatorDot } from "../../../shared/base/unread-indicator-dot"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { ProjectMeetingStatusTag } from "../../../shared/project-meetings/project-meeting-status-tag"
import { SortIcon } from "../../../shared/sort-icon"

interface IProps {
  searchStore: ISearch
  projectMeetings: IProjectMeeting[]
  getSortColumnHeader?: (field: EProjectMeetingSortFields) => string
  getRowPath?: (projectMeeting: IProjectMeeting) => string
  noResultsDescription?: React.ReactNode
  hideProjectNumber?: boolean
}

const BASE_SORT_FIELDS = [
  EProjectMeetingSortFields.projectAddress,
  EProjectMeetingSortFields.contactName,
  EProjectMeetingSortFields.submittedAt,
  EProjectMeetingSortFields.confirmedDate,
  EProjectMeetingSortFields.status,
]

const FULL_SORT_FIELDS = [EProjectMeetingSortFields.projectNumber, ...BASE_SORT_FIELDS]

const FULL_TEMPLATE_COLUMNS =
  "36px minmax(150px, 1.1fr) minmax(190px, 1.4fr) minmax(150px, 1fr) minmax(130px, 0.9fr) minmax(150px, 1fr) minmax(110px, auto) minmax(80px, 0.5fr)"
const WITHOUT_PROJECT_NUMBER_TEMPLATE_COLUMNS =
  "36px minmax(190px, 1.4fr) minmax(150px, 1fr) minmax(130px, 0.9fr) minmax(150px, 1fr) minmax(110px, auto) minmax(80px, 0.5fr)"

export const ProjectMeetingInboxTable = observer(function ProjectMeetingInboxTable({
  searchStore,
  projectMeetings,
  getSortColumnHeader,
  getRowPath,
  noResultsDescription,
  hideProjectNumber = false,
}: IProps) {
  const { t } = useTranslation()
  const {
    toggleSort,
    sort,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = searchStore

  const sortFields = hideProjectNumber ? BASE_SORT_FIELDS : FULL_SORT_FIELDS
  const columnCount = sortFields.length + 2 // unread indicator + notes

  const listShowsNoResults = !isSearching && totalCount !== null && totalCount === 0
  const { resetFilters } = searchStore as ISearch & { resetFilters?: () => void }
  const storeGetSortColumnHeader = (
    searchStore as { getSortColumnHeader?: (field: EProjectMeetingSortFields) => string }
  ).getSortColumnHeader
  const sortColumnHeader = (field: EProjectMeetingSortFields) =>
    getSortColumnHeader?.(field) ?? storeGetSortColumnHeader?.(field) ?? field

  const renderListBody = () => {
    if (isSearching) {
      return (
        <Flex py={50} gridColumn={`span ${columnCount}`}>
          <SharedSpinner />
        </Flex>
      )
    }

    if (listShowsNoResults) return null

    return projectMeetings.map((projectMeeting) => (
      <ProjectMeetingInboxRow
        key={projectMeeting.id}
        projectMeeting={projectMeeting}
        getRowPath={getRowPath}
        hideProjectNumber={hideProjectNumber}
      />
    ))
  }

  const gridStickyHeaderSx = {
    "[role='columnheader']": {
      position: "sticky",
      top: 0,
      zIndex: 1,
      bg: "white",
    },
    ".project-meeting-inbox-grid-row:hover > div": {
      bg: "gray.50",
    },
    ".project-meeting-inbox-grid-row:active > div": {
      bg: "background.blueLight",
    },
  }

  return (
    <Flex direction="column" flex={1} minH={0} minW={0} w="full" align="stretch">
      <Box flex={1} minH={0} overflow="auto">
        <SearchGrid
          templateColumns={hideProjectNumber ? WITHOUT_PROJECT_NUMBER_TEMPLATE_COLUMNS : FULL_TEMPLATE_COLUMNS}
          gridRowClassName="project-meeting-inbox-grid-row"
          overflow="visible"
          sx={gridStickyHeaderSx}
          isEmpty={listShowsNoResults}
          emptyTitle={t("submissionInbox.noMatchingMeetingsTitle")}
          emptyIcon={<CalendarBlank size={18} />}
          emptyDescription={
            resetFilters ? (
              <Text fontSize="sm">
                {t("submissionInbox.noMatchingMeetingsDescription")}{" "}
                <ChakraLink as="button" onClick={() => resetFilters()} textDecoration="underline">
                  {t("submissionInbox.clearAllFilters")}
                </ChakraLink>
              </Text>
            ) : (
              (noResultsDescription ?? t("submissionInbox.noMatchingMeetingsDescription"))
            )
          }
        >
          <Box display="contents" role="rowgroup">
            <Box display="contents" role="row">
              <GridHeader role="columnheader">
                <Flex w="full" justifyContent="center" borderRight="1px solid" borderColor="border.light" />
              </GridHeader>
              {sortFields.map((field) => (
                <SortableHeader
                  key={field}
                  field={field}
                  label={sortColumnHeader(field)}
                  sort={sort as ISort<EProjectMeetingSortFields>}
                  onToggleSort={toggleSort}
                />
              ))}
              <GridHeader role="columnheader">
                <Text px={3}>{t("submissionInbox.meetingColumns.notes")}</Text>
              </GridHeader>
            </Box>
          </Box>

          {renderListBody()}
        </SearchGrid>
      </Box>
      {!listShowsNoResults && (
        <Flex
          w="full"
          flexShrink={0}
          justifyContent="space-between"
          align="center"
          pt={5}
          borderTopWidth="1px"
          borderTopColor="border.light"
          bg="white"
        >
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
      )}
    </Flex>
  )
})

const SortableHeader = ({
  field,
  label,
  sort,
  onToggleSort,
}: {
  field: EProjectMeetingSortFields
  label: string
  sort: ISort<EProjectMeetingSortFields>
  onToggleSort: (field: EProjectMeetingSortFields) => void
}) => (
  <GridHeader role="columnheader">
    <Flex
      w="full"
      as="button"
      justifyContent="space-between"
      cursor="pointer"
      onClick={() => onToggleSort(field)}
      borderRight="1px solid"
      borderColor="border.light"
      px={3}
    >
      <Text textAlign="left">{label}</Text>
      <SortIcon<EProjectMeetingSortFields> field={field} currentSort={sort} />
    </Flex>
  </GridHeader>
)

const formatDate = (date?: Date | null) => (date ? format(date, datefnsTableDateFormat) : "—")

const ProjectMeetingInboxRow = observer(function ProjectMeetingInboxRow({
  projectMeeting,
  getRowPath,
  hideProjectNumber = false,
}: {
  projectMeeting: IProjectMeeting
  getRowPath?: (projectMeeting: IProjectMeeting) => string
  hideProjectNumber?: boolean
}) {
  const { t } = useTranslation()
  const { jurisdictionId } = useParams()
  const rowPath = getRowPath?.(projectMeeting) ?? `/jurisdictions/${jurisdictionId}/meetings/${projectMeeting.id}`
  const meetingTime = projectMeeting.confirmedDate
    ? format(projectMeeting.confirmedDate, datefnsTableDateTimeFormat)
    : t("permitProject.meetings.pendingTime")

  return (
    <Box
      as={Link}
      to={rowPath}
      className="project-meeting-inbox-grid-row"
      role="row"
      display="contents"
      cursor="pointer"
      _hover={{ textDecoration: "none" }}
    >
      <SearchGridItem justifyContent="center">
        <UnreadIndicatorDot isUnread={!projectMeeting.viewedAt} />
      </SearchGridItem>

      {!hideProjectNumber && (
        <SearchGridItem>
          <VStack align="start" spacing={0}>
            <Text fontWeight={700} fontSize="sm" color="text.link">
              {projectMeeting.projectNumber || "—"}
            </Text>
            {projectMeeting.projectDescription && (
              <Text fontSize="xs" color="text.secondary" noOfLines={1}>
                {projectMeeting.projectDescription}
              </Text>
            )}
          </VStack>
        </SearchGridItem>
      )}

      <SearchGridItem>
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" noOfLines={1}>
            {projectMeeting.projectAddress || "—"}
          </Text>
          {projectMeeting.projectPid ? (
            <Text fontSize="xs" color="text.secondary">
              PID {projectMeeting.projectPid}
            </Text>
          ) : (
            <Text fontSize="xs" color="text.secondary">
              —
            </Text>
          )}
        </VStack>
      </SearchGridItem>

      <SearchGridItem>
        <Text fontSize="sm" noOfLines={1}>
          {projectMeeting.contactName || "—"}
        </Text>
      </SearchGridItem>

      <SearchGridItem>
        <Text fontSize="sm">{formatDate(projectMeeting.submittedAt)}</Text>
      </SearchGridItem>

      <SearchGridItem>
        <Text fontSize="sm">{meetingTime}</Text>
      </SearchGridItem>

      <SearchGridItem>
        <ProjectMeetingStatusTag status={projectMeeting.status} fontSize="xs" />
      </SearchGridItem>

      <SearchGridItem>
        <HStack spacing={1} color="text.secondary">
          <Chat size={14} />
          <Text fontSize="sm">{projectMeeting.notesCount}</Text>
        </HStack>
      </SearchGridItem>
    </Box>
  )
})
