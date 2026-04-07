import {
  Avatar,
  Box,
  Circle,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { DotsThreeVertical, UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { IPermitProjectInboxStore } from "../../../../stores/submission-inbox-store"
import { EPermitProjectInboxSortFields } from "../../../../types/enums"
import { ISort } from "../../../../types/types"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { ProjectStateTag } from "../../../shared/permit-projects/project-state-tag"
import { SortIcon } from "../../../shared/sort-icon"
import { SharedAvatar } from "../../../shared/user/shared-avatar"
import { ProjectCollaboratorsSidebar } from "./project-collaborators-sidebar"

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

const MAX_VISIBLE_AVATARS = 3

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
      <SearchGrid
        templateColumns="2fr 1.5fr 1fr 1fr 1fr 1fr 48px"
        gridRowClassName="project-inbox-grid-row"
        sx={{
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
                  <Text textAlign="left">{getSortColumnHeader(field)}</Text>
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

        {isSearching ? (
          <Flex py={50} gridColumn="span 7">
            <SharedSpinner />
          </Flex>
        ) : (
          projects.map((project) => (
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
                <Text fontSize="sm">
                  {project.totalPermitsCount > 0
                    ? `${project.newlySubmittedCount + project.resubmittedCount} of ${project.totalPermitsCount} received`
                    : "0 of 0 received"}
                </Text>
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

              <SearchGridItem>
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
                <ProjectActionsMenu project={project} />
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

const ProjectAssignedCell = observer(function ProjectAssignedCell({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(false)

  const collaborators = project.aggregatedReviewCollaborators
  const designated = collaborators.filter((c) => c.isDesignated)
  const others = collaborators.filter((c) => !c.isDesignated)
  const allAvatarUsers = [...designated, ...others]
  const visibleAvatars = allAvatarUsers.slice(0, MAX_VISIBLE_AVATARS)
  const overflowCount = allAvatarUsers.length - MAX_VISIBLE_AVATARS

  const handleOpenSidebar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoadingSidebar(true)
    try {
      await permitProjectStore.fetchPermitProject(project.id)
    } finally {
      setIsLoadingSidebar(false)
    }
    onOpen()
  }

  return (
    <>
      <HStack spacing={1}>
        {visibleAvatars.length > 0 ? (
          <>
            {visibleAvatars.map((user) => (
              <SharedAvatar
                key={user.id}
                size="xs"
                name={user.name}
                role={user.role}
                fontSize="2xs"
                border={user.isDesignated ? "2px solid" : undefined}
                borderColor={user.isDesignated ? "theme.blueActive" : undefined}
              />
            ))}
            {overflowCount > 0 && (
              <Avatar
                size="xs"
                name={`+${overflowCount}`}
                getInitials={(name) => name}
                bg="gray.200"
                color="text.primary"
                fontSize="2xs"
              />
            )}
          </>
        ) : (
          <Text fontSize="sm" color="text.secondary">
            {t("ui.unassigned")}
          </Text>
        )}
        <IconButton
          aria-label={t("permitCollaboration.sidebar.title")}
          icon={isLoadingSidebar ? <Spinner size="xs" /> : <UserPlus size={14} />}
          size="xs"
          variant="ghost"
          borderRadius="full"
          onClick={handleOpenSidebar}
          isDisabled={isLoadingSidebar}
        />
      </HStack>

      {isOpen && <ProjectCollaboratorsSidebar project={project} isOpen={isOpen} onClose={onClose} />}
    </>
  )
})

const ProjectActionsMenu = observer(function ProjectActionsMenu({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()
  const hasTransitions = project.allowedManualTransitions.length > 0
  const canMarkUnread = !!project.viewedAt

  if (!hasTransitions && !canMarkUnread) return null

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Actions"
        icon={<DotsThreeVertical size={16} weight="bold" />}
        size="sm"
        variant="ghost"
      />
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
          {hasTransitions && canMarkUnread && <MenuDivider />}
          {canMarkUnread && (
            <MenuItem
              fontSize="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                project.markAsUnviewed()
              }}
            >
              {t("submissionInbox.markUnread")}
            </MenuItem>
          )}
        </MenuList>
      </Portal>
    </Menu>
  )
})
