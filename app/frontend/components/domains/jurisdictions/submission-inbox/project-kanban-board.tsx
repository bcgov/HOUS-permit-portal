import { Avatar, Box, HStack, Icon, IconButton, Spinner, Text } from "@chakra-ui/react"
import { CalendarBlank, UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { EProjectState } from "../../../../types/enums"
import { SharedAvatar } from "../../../shared/user/shared-avatar"
import { ChangeProjectStateMenu } from "./change-project-state-menu"
import { IKanbanColumn, IReorderEvent, KanbanBoard } from "./kanban-board"
import { KanbanCard } from "./kanban-card"
import { ProjectReviewCollaboratorsPopover } from "./project-designated-reviewer-popover"
import { ProjectInboxPermitApplicationsPopover } from "./project-inbox-permit-applications-popover"

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

  const itemsKey = projects.map((p) => `${p.id}:${p.state}:${p.inboxSortOrder ?? ""}:${p.viewedAt ?? ""}`).join(",")
  const items = useMemo(
    () =>
      projects.map((p) => ({
        ...p,
        id: p.id,
        columnKey: p.state,
        sortOrder: p.inboxSortOrder,
        isUnread: !p.viewedAt,
      })),
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

  const received = project.inQueueCount
  const total = project.totalPermitsCount
  const isUnread = !project.viewedAt

  const allCollaborators = project.aggregatedReviewCollaborators
  const visibleAssignees = allCollaborators.slice(0, MAX_VISIBLE_AVATARS)
  const overflowCount = allCollaborators.length - MAX_VISIBLE_AVATARS

  return (
    <KanbanCard
      id={project.id}
      isUnread={isUnread}
      onMarkUnread={isUnread ? undefined : () => project.markAsUnviewed()}
      statusMenu={<ChangeProjectStateMenu project={project} compact />}
      avatars={
        <>
          {visibleAssignees.map((user) => (
            <SharedAvatar key={user.id} size="xs" name={user.name} role={user.role} fontSize="2xs" />
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
          <ProjectReviewCollaboratorsPopover
            project={project}
            onBeforeOpen={async () => {
              await permitProjectStore.fetchPermitProject(project.id)
            }}
            renderTrigger={({ isLoading, collaborationCount, onClick, isDisabled }) => (
              <IconButton
                aria-label={t("permitCollaboration.projectSidebar.projectReviewCollaborators")}
                icon={isLoading ? <Spinner size="xs" /> : <UserPlus size={16} />}
                size="sm"
                minW={7}
                h={7}
                variant="ghost"
                onClick={onClick}
                isDisabled={isDisabled}
              />
            )}
          />
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
            <Text fontWeight={700} fontSize="md" noOfLines={1}>
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
          <Text fontSize="xs" color="text.secondary">
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
          <ProjectInboxPermitApplicationsPopover project={project} />
        </Box>
      </Box>
    </KanbanCard>
  )
})
