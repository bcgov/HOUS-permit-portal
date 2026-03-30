import {
  Avatar,
  Box,
  Circle,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Tag,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { Buildings, UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { IPermitProjectInboxStore } from "../../../../stores/submission-inbox-store"
import { EPermitProjectInboxSortFields, EProjectState } from "../../../../types/enums"
import { ISort } from "../../../../types/types"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
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

const statusColorMap: Record<string, { bg: string; color: string }> = {
  [EProjectState.draft]: { bg: "greys.grey04", color: "text.secondary" },
  [EProjectState.queued]: { bg: "theme.blueLight", color: "text.primary" },
  [EProjectState.waiting]: { bg: "theme.yellow", color: "text.primary" },
  [EProjectState.inProgress]: { bg: "theme.yellow", color: "text.primary" },
  [EProjectState.ready]: { bg: "semantic.successLight", color: "semantic.success" },
  [EProjectState.permitIssued]: { bg: "semantic.successLight", color: "semantic.success" },
  [EProjectState.active]: { bg: "semantic.successLight", color: "semantic.success" },
  [EProjectState.complete]: { bg: "semantic.successLight", color: "semantic.success" },
  [EProjectState.closed]: { bg: "greys.grey04", color: "text.secondary" },
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
      <SearchGrid
        templateColumns="2fr 1.5fr 1fr 1fr 1fr 1fr"
        gridRowClassName="project-inbox-grid-row"
        sx={{
          ".project-inbox-grid-row:hover > div": {
            bg: "blue.50",
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
          </Box>
        </Box>

        {isSearching ? (
          <Flex py={50} gridColumn="span 6">
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
                <Tag
                  p={1}
                  bg={statusColorMap[project.state]?.bg || "greys.grey04"}
                  color={statusColorMap[project.state]?.color || "text.secondary"}
                  fontWeight="bold"
                  border="1px solid"
                  borderColor="border.light"
                  textTransform="uppercase"
                  minW="fit-content"
                  textAlign="center"
                  fontSize="xs"
                >
                  {/* @ts-ignore */}
                  {t(`submissionInbox.projectStates.${project.state}`)}
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
