import { Tooltip } from "@/components/ui/tooltip"
import { Box, Circle, Flex, HStack, Icon, IconButton, Menu, Portal, Text, VStack } from "@chakra-ui/react"
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
        className="project-inbox-grid-row"
        role="row"
        display="contents"
        cursor="pointer"
        _hover={{ textDecoration: "none" }}
        asChild
      >
        <Link key={project.id} to={`projects/${project.id}/overview`}>
          <SearchGridItem>
            <HStack gap={3}>
              <Circle size="8px" bg={!project.viewedAt ? "theme.blueActive" : "transparent"} flexShrink={0} />

              <Text fontWeight={700} fontSize="sm">
                {project.number}
              </Text>
            </HStack>
          </SearchGridItem>
          <SearchGridItem>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" lineClamp={1}>
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
              <VStack align="start" gap={0}>
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
            <HStack gap={0}>
              <ProjectActionsMenu project={project} />
              {!!project.viewedAt && (
                <SubmissionInboxMarkUnreadIconButton onMarkUnread={() => project.markAsUnviewed()} />
              )}
            </HStack>
          </SearchGridItem>
        </Link>
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
          templateColumns="minmax(160px, 2fr) minmax(180px, 1.5fr) minmax(160px, 1fr) minmax(140px, 1fr) minmax(160px, 1fr) minmax(120px, 1fr) 72px"
          gridRowClassName="project-inbox-grid-row"
          overflow="visible"
          css={{
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
                    justifyContent="space-between"
                    cursor="pointer"
                    borderRight="1px solid"
                    borderColor="border.light"
                    px={3}
                    asChild
                  >
                    <button onClick={() => toggleSort(field)}>
                      <HStack gap={1}>
                        <Text textAlign="left">{getSortColumnHeader(field)}</Text>
                        {field === EPermitProjectInboxSortFields.daysInQueue && (
                          <Tooltip
                            content={t("submissionInbox.daysWithUsTooltip")}
                            showArrow
                            positioning={{
                              placement: "top",
                            }}
                          >
                            <Flex align="center">
                              <Icon boxSize={3.5} color="text.secondary" asChild>
                                <Info />
                              </Icon>
                            </Flex>
                          </Tooltip>
                        )}
                      </HStack>
                      <SortIcon<EPermitProjectInboxSortFields>
                        field={field}
                        currentSort={sort as ISort<EPermitProjectInboxSortFields>}
                      />
                    </button>
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
    <Menu.Root>
      <Tooltip
        content={t("submissionInbox.changeStatus")}
        showArrow
        positioning={{
          placement: "top",
        }}
      >
        <Menu.Trigger asChild>
          <IconButton
            aria-label={t("submissionInbox.changeStatus")}
            icon={
              <Icon boxSize={4} asChild>
                <Swap />
              </Icon>
            }
            size="sm"
            minW={7}
            h={7}
            variant="ghost"
          ></IconButton>
        </Menu.Trigger>
      </Tooltip>
      <Portal>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {project.allowedManualTransitions.map((transition) => (
                <Menu.Item
                  key={transition}
                  fontSize="sm"
                  onSelect={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    project.transitionState(transition)
                  }}
                  value="item-0"
                >
                  {/* @ts-ignore */}
                  {t(`submissionInbox.projectStates.${transition}`)}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Portal>
    </Menu.Root>
  )
})
