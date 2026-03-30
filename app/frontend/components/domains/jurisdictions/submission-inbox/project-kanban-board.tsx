import {
  Avatar,
  Box,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { CalendarBlank, Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { EProjectState } from "../../../../types/enums"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"
import { SharedAvatar } from "../../../shared/user/shared-avatar"
import { IKanbanColumn, IReorderEvent, KanbanBoard } from "./kanban-board"
import { KanbanCard } from "./kanban-card"
import { ProjectCollaboratorsSidebar } from "./project-collaborators-sidebar"

interface IProps {
  projects: IPermitProject[]
  stateCounts: Record<string, number>
  columnTotals?: Record<string, number>
  collapsedColumns: string[]
  onToggleColumn: (columnState: string) => void
  onShowMore?: (columnState: string) => void
  onReorder?: (event: IReorderEvent) => void
}

const KANBAN_COLUMNS: EProjectState[] = [
  EProjectState.queued,
  EProjectState.waiting,
  EProjectState.inProgress,
  EProjectState.ready,
  EProjectState.permitIssued,
  EProjectState.active,
  EProjectState.complete,
  EProjectState.closed,
]

export const ProjectKanbanBoard = observer(function ProjectKanbanBoard({
  projects,
  stateCounts,
  columnTotals,
  collapsedColumns,
  onToggleColumn,
  onShowMore,
  onReorder,
}: IProps) {
  const { t } = useTranslation()

  const columns: IKanbanColumn[] = useMemo(
    () =>
      KANBAN_COLUMNS.map((state) => ({
        key: state,
        // @ts-ignore
        label: t(`submissionInbox.projectStates.${state}`),
      })),
    [t]
  )

  const itemsKey = projects.map((p) => `${p.id}:${p.state}:${p.inboxSortOrder ?? ""}`).join(",")
  const items = useMemo(
    () => projects.map((p) => ({ ...p, id: p.id, columnKey: p.state, sortOrder: p.inboxSortOrder })),
    [itemsKey]
  )

  return (
    <KanbanBoard
      columns={columns}
      items={items}
      stateCounts={stateCounts}
      columnTotals={columnTotals}
      collapsedColumns={collapsedColumns}
      onToggleColumn={onToggleColumn}
      onShowMore={onShowMore}
      onReorder={onReorder}
      renderCard={(item) => {
        const project = projects.find((p) => p.id === item.id)
        if (!project) return null
        return <ProjectKanbanCard key={project.id} project={project} />
      }}
    />
  )
})

const MAX_VISIBLE_AVATARS = 3

const ProjectKanbanCard = observer(function ProjectKanbanCard({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure()
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(false)

  const received = project.newlySubmittedCount + project.resubmittedCount
  const total = project.totalPermitsCount
  const isUnread = !project.viewedAt

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
    onSidebarOpen()
  }

  return (
    <KanbanCard
      id={project.id}
      isUnread={isUnread}
      onMarkUnread={isUnread ? undefined : () => project.markAsUnviewed()}
      statusMenu={<ChangeStatusMenu project={project} />}
      onAssigneeClick={handleOpenSidebar}
      isAssigneeLoading={isLoadingSidebar}
      avatars={
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
      }
    >
      <Box
        as={Link}
        to={`projects/${project.id}/overview`}
        display="block"
        color="inherit"
        textDecoration="none"
        _hover={{ textDecoration: "none", color: "inherit" }}
        _visited={{ color: "inherit" }}
        _active={{ color: "inherit" }}
      >
        <Box pr={4}>
          <HStack spacing={2}>
            {/* ### SUBMISSION INDEX STUB FEATURE */}
            <Icon as={CalendarBlank} color="text.secondary" boxSize={4} display="none" />
            <Text fontWeight={700} fontSize="sm" noOfLines={1}>
              {project.number}
            </Text>
          </HStack>
        </Box>

        <Text fontSize="xs" color="text.secondary" noOfLines={1}>
          {project.title}
        </Text>

        <Text fontSize="xs" noOfLines={1} mt={1.5}>
          {project.shortAddress}
        </Text>
        {project.pid && (
          <Text fontSize="2xs" color="text.secondary">
            PID {project.pid}
          </Text>
        )}

        <Text fontSize="xs" color="text.secondary" mt={1}>
          {/* @ts-ignore */}
          {t("submissionInbox.applicationsReceived", { received, total })}
        </Text>

        {project.daysInQueue != null && (
          <Text fontSize="xs" color="text.secondary">
            {/* @ts-ignore */}
            {t("submissionInbox.daysInQueue", { count: project.daysInQueue })}
          </Text>
        )}

        <Box mt={2.5}>
          <RollupStatusBadge project={project} />
        </Box>
      </Box>

      {isSidebarOpen && (
        <ProjectCollaboratorsSidebar project={project} isOpen={isSidebarOpen} onClose={onSidebarClose} />
      )}
    </KanbanCard>
  )
})

const ChangeStatusMenu = observer(function ChangeStatusMenu({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()

  if (project.allowedManualTransitions.length === 0) return null

  return (
    <Menu>
      <Tooltip label={t("submissionInbox.changeStatus")} hasArrow placement="top">
        <MenuButton
          as={IconButton}
          aria-label={t("submissionInbox.changeStatus")}
          icon={<Swap size={16} />}
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

const RollupStatusBadge = observer(function RollupStatusBadge({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()
  const rollupStatus = project.inboxRollupStatus
  const sortedStatuses = project.inboxSortedApplicationStatuses

  if (sortedStatuses.length === 0) return null

  const badge = (
    <PermitApplicationStatusTag status={rollupStatus} size="sm" px={2} py={0.5} fontSize="2xs" cursor="default" />
  )

  if (sortedStatuses.length <= 1) return badge

  return (
    <Popover trigger="hover" placement="bottom-start" isLazy flip={false}>
      <PopoverTrigger>{badge}</PopoverTrigger>

      <Portal>
        <PopoverContent w="auto" minW="220px" maxW="320px" onClick={(e) => e.preventDefault()}>
          <PopoverBody p={3}>
            <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" color="text.secondary" mb={2}>
              {t("submissionInbox.permitApplicationStatuses")}
            </Text>
            <VStack align="stretch" spacing={1}>
              {sortedStatuses.map((entry, idx) => (
                <HStack key={idx} spacing={2} justify="space-between">
                  <Text
                    as={Link}
                    to={`/permit-applications/${entry.id}`}
                    fontSize="xs"
                    color="text.link"
                    noOfLines={1}
                    _hover={{ textDecoration: "underline" }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    {entry.nickname || "—"}
                  </Text>
                  <PermitApplicationStatusTag
                    status={entry.status}
                    size="sm"
                    px={1.5}
                    py={0.5}
                    fontSize="2xs"
                    flexShrink={0}
                  />
                </HStack>
              ))}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
})
