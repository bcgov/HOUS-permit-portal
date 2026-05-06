import { Box, HStack, Icon, Text } from "@chakra-ui/react"
import { CalendarBlank } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { EProjectState } from "../../../../types/enums"
import { ChangeProjectStateMenu } from "./change-project-state-menu"
import { EReorderDirection, IKanbanColumn, IReorderEvent, KanbanBoard } from "./kanban-board"
import { KanbanCard } from "./kanban-card"
import { ProjectReviewCollaboratorsModal } from "./project-designated-reviewer-modal"
import { ProjectInboxPermitApplicationsPopover } from "./project-inbox-permit-applications-popover"
import { renderAssignPlusIconTrigger, ReviewAssigneesRow } from "./review-assignees-row"

interface IProps {
  projects: IPermitProject[]
  stateCounts: Record<string, number>
  columnTotals?: Record<string, number>
  unreadCounts?: Record<string, number>
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
  unreadCounts,
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
      unreadCounts={unreadCounts}
      emptyColumnMessage={t("submissionInbox.noFilteredResultsWithState")}
      collapsedColumns={collapsedColumns}
      onToggleColumn={onToggleColumn}
      onShowMore={onShowMore}
      onReorder={onReorder}
      renderCard={(item, context) => {
        const project = projects.find((p) => p.id === item.id)
        if (!project) return null
        return (
          <ProjectKanbanCard
            key={project.id}
            project={project}
            isFirst={context.isFirst}
            isLast={context.isLast}
            onMove={context.onMove}
          />
        )
      }}
    />
  )
})

const ProjectKanbanCard = observer(function ProjectKanbanCard({
  project,
  isFirst,
  isLast,
  onMove,
}: {
  project: IPermitProject
  isFirst?: boolean
  isLast?: boolean
  onMove?: (direction: EReorderDirection) => void
}) {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()

  const received = project.inQueueCount
  const total = project.totalPermitsCount
  const isUnread = !project.viewedAt

  const primaryAssignee = project.reviewDelegatee?.user ?? null

  return (
    <KanbanCard
      id={project.id}
      isUnread={isUnread}
      onMarkUnread={isUnread ? undefined : () => project.markAsUnviewed()}
      statusMenu={<ChangeProjectStateMenu project={project} compact />}
      isFirst={isFirst}
      isLast={isLast}
      onMove={onMove}
      avatars={
        <ReviewAssigneesRow primaryAssignee={primaryAssignee}>
          <ProjectReviewCollaboratorsModal
            project={project}
            onBeforeOpen={async () => {
              await permitProjectStore.fetchPermitProject(project.id)
            }}
            renderTrigger={renderAssignPlusIconTrigger({
              ariaLabel: t("permitCollaboration.projectSidebar.projectReviewCollaborators"),
              size: "sm",
            })}
          />
        </ReviewAssigneesRow>
      }
    >
      <Box
        display="block"
        color="inherit"
        textDecoration="none"
        _hover={{ textDecoration: "none", color: "inherit" }}
        _visited={{ color: "inherit" }}
        _active={{ color: "inherit" }}
        asChild
      >
        <Link to={`projects/${project.id}/overview`}>
          <Box pr={12}>
            <HStack gap={2}>
              {/* ### SUBMISSION INDEX STUB FEATURE */}
              <Icon color="text.secondary" boxSize={4} display="none" asChild>
                <CalendarBlank />
              </Icon>
              <Text fontWeight={700} fontSize="md" lineClamp={1}>
                {project.number}
              </Text>
            </HStack>
          </Box>
          <Text fontSize="xs" lineClamp={1} mt={1.5}>
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
        </Link>
      </Box>
    </KanbanCard>
  )
})
