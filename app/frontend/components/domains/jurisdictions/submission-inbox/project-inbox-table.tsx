import {
  Box,
  Circle,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { Info, Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { IPermitProjectInboxStore } from "../../../../stores/submission-inbox-store"
import { EInboxViewMode, EPermitProjectInboxSortFields } from "../../../../types/enums"
import { ISort } from "../../../../types/types"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { ProjectStateTag } from "../../../shared/permit-projects/project-state-tag"
import { SortIcon } from "../../../shared/sort-icon"
import { InboxNoMatchingEmpty } from "./inbox-no-matching-empty"
import { ProjectReviewCollaboratorsModal } from "./project-designated-reviewer-modal"
import { ProjectInboxPermitApplicationsPopover } from "./project-inbox-permit-applications-popover"
import { renderAssignPlusIconTrigger, ReviewAssigneesRow } from "./review-assignees-row"
import { SubmissionInboxMarkUnreadIconButton } from "./submission-inbox-mark-unread-icon-button"

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
  EPermitProjectInboxSortFields.state,
]

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

  const listShowsNoResults = !isSearching && totalCount !== null && totalCount === 0

  const renderListBody = () => {
    if (isSearching) {
      return (
        <Flex py={50} gridColumn="span 7">
          <SharedSpinner />
        </Flex>
      )
    }
    if (listShowsNoResults) {
      return (
        <Flex py={4} gridColumn="span 7" w="full" justify="flex-start">
          <InboxNoMatchingEmpty viewMode={EInboxViewMode.projects} onClearFilters={() => searchStore.resetFilters()} />
        </Flex>
      )
    }
    return projects.map((project) => (
      <Box
        key={project.id}
        as={Link}
        to={`projects/${project.id}/overview`}
        className="project-inbox-grid-row"
        role="row"
        display="contents"
        cursor="pointer"
        _hover={{ textDecoration: "none" }}
      >
        <SearchGridItem>
          <HStack spacing={3}>
            <Circle size="8px" bg={!project.viewedAt ? "theme.blueActive" : "transparent"} flexShrink={0} />

            <Text fontWeight={700} fontSize="sm">
              {project.number}
            </Text>
          </HStack>
        </SearchGridItem>

        <SearchGridItem>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" noOfLines={1}>
              {project.shortAddress || project.fullAddress || "—"}
            </Text>
            {project.pid ? (
              <Text fontSize="xs" color="text.secondary">
                PID {project.pid}
              </Text>
            ) : (
              <Text fontSize="xs" color="text.secondary">
                —
              </Text>
            )}
          </VStack>
        </SearchGridItem>

        <SearchGridItem>
          <ProjectInboxPermitApplicationsPopover
            project={project}
            renderTrigger={
              <Text fontSize="sm">
                {project.totalPermitsCount > 0
                  ? `${project.inQueueCount} of ${project.totalPermitsCount} received`
                  : "0 of 0 received"}
              </Text>
            }
          />
        </SearchGridItem>

        <SearchGridItem>
          {project.daysInQueue != null ? (
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight={600}>
                {project.formattedDaysInQueue}
              </Text>
              <Text fontSize="xs" color="text.secondary">
                {t("submissionInbox.waitingSince")}
              </Text>
              <Text fontSize="xs" color="text.secondary">
                {project.formattedEnqueuedAt}
              </Text>
            </VStack>
          ) : (
            <Text fontSize="sm" color="text.secondary">
              —
            </Text>
          )}
        </SearchGridItem>

        <SearchGridItem
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <ProjectAssignedCell project={project} />
        </SearchGridItem>

        <SearchGridItem>
          <ProjectStateTag state={project.state} fontSize="xs" />
        </SearchGridItem>

        <SearchGridItem
          px={1}
          justifyContent="center"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <HStack spacing={0}>
            <ProjectActionsMenu project={project} />
            {!!project.viewedAt && (
              <SubmissionInboxMarkUnreadIconButton onMarkUnread={() => project.markAsUnviewed()} />
            )}
          </HStack>
        </SearchGridItem>
      </Box>
    ))
  }

  const gridStickyHeaderSx = {
    "[role='columnheader']": {
      position: "sticky",
      top: 0,
      zIndex: 1,
      bg: "white",
    },
  }

  return (
    <Flex direction="column" flex={1} minH={0} minW={0} w="full" align="stretch">
      <Box flex={1} minH={0} overflow="auto">
        <SearchGrid
          templateColumns="2fr 1.5fr 1fr 1fr 1fr 1fr 72px"
          gridRowClassName="project-inbox-grid-row"
          overflow="visible"
          sx={{
            ...gridStickyHeaderSx,
            ".project-inbox-grid-row:hover > div": {
              bg: "gray.50",
            },
            ".project-inbox-grid-row:active > div": {
              bg: "background.blueLight",
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
                    <HStack spacing={1}>
                      <Text textAlign="left">{getSortColumnHeader(field)}</Text>
                      {field === EPermitProjectInboxSortFields.daysInQueue && (
                        <Tooltip label={t("submissionInbox.daysWithUsTooltip")} hasArrow placement="top">
                          <Flex align="center">
                            <Icon as={Info} boxSize={3.5} color="text.secondary" />
                          </Flex>
                        </Tooltip>
                      )}
                    </HStack>
                    <SortIcon<EPermitProjectInboxSortFields>
                      field={field}
                      currentSort={sort as ISort<EPermitProjectInboxSortFields>}
                    />
                  </Flex>
                </GridHeader>
              ))}
              <GridHeader role="columnheader" />
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

const ProjectAssignedCell = observer(function ProjectAssignedCell({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()

  const primaryAssignee = project.reviewDelegatee?.user ?? null

  return (
    <ReviewAssigneesRow primaryAssignee={primaryAssignee} emptyText={t("ui.unassigned")}>
      <ProjectReviewCollaboratorsModal
        project={project}
        onBeforeOpen={async () => {
          await permitProjectStore.fetchPermitProject(project.id)
        }}
        renderTrigger={renderAssignPlusIconTrigger({
          ariaLabel: t("permitCollaboration.projectSidebar.projectReviewCollaborators"),
        })}
      />
    </ReviewAssigneesRow>
  )
})

const ProjectActionsMenu = observer(function ProjectActionsMenu({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()
  const hasTransitions = project.allowedManualTransitions.length > 0

  if (!hasTransitions) return null

  return (
    <Menu>
      <Tooltip label={t("submissionInbox.changeStatus")} hasArrow placement="top">
        <MenuButton
          as={IconButton}
          aria-label={t("submissionInbox.changeStatus")}
          icon={<Icon as={Swap} boxSize={4} />}
          size="sm"
          minW={7}
          h={7}
          variant="ghost"
        />
      </Tooltip>
      <Portal>
        <MenuList zIndex={10}>
          {project.allowedManualTransitions.map((transition) => (
            <MenuItem
              key={transition}
              fontSize="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                project.transitionState(transition)
              }}
            >
              {/* @ts-ignore */}
              {t(`submissionInbox.projectStates.${transition}`)}
            </MenuItem>
          ))}
        </MenuList>
      </Portal>
    </Menu>
  )
})
