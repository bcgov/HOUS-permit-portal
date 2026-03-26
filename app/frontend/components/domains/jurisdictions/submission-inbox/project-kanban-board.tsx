import {
  Avatar,
  Box,
  Circle,
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
  VStack,
} from "@chakra-ui/react"
import { CalendarBlank, Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { EProjectState } from "../../../../types/enums"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"
import { IKanbanColumn, IReorderEvent, KanbanBoard } from "./kanban-board"
import { KanbanCard } from "./kanban-card"

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

const ProjectKanbanCard = observer(function ProjectKanbanCard({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()

  const received = project.newlySubmittedCount + project.resubmittedCount
  const total = project.totalPermitsCount
  const isUnread = !project.viewedAt

  return (
    <KanbanCard
      id={project.id}
      onMarkUnread={isUnread ? undefined : () => project.markAsUnviewed()}
      statusMenu={<ChangeStatusMenu project={project} />}
    >
      <Box as={Link} to={`projects/${project.id}/overview`} _hover={{ textDecoration: "none" }} display="block">
        <HStack spacing={2} mb={1}>
          {isUnread && <Circle size="8px" bg={"theme.blueActive"} flexShrink={0} />}
          {/* ### SUBMISSION INDEX STUB FEATURE */}
          <Icon as={CalendarBlank} color="text.secondary" boxSize={4} display="none" />
          <Text fontWeight={700} fontSize="sm" noOfLines={1}>
            {project.number}
          </Text>
        </HStack>

        <Text fontSize="xs" color="text.secondary" noOfLines={1} mb={1}>
          {project.title}
        </Text>

        <Text fontSize="xs" noOfLines={1}>
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

        <Box mt={2}>
          <RollupStatusBadge project={project} />
        </Box>
      </Box>

      <HStack mt={3} spacing={1}>
        <Avatar size="xs" name="BB" bg="theme.blueLight" color="text.primary" fontSize="2xs" />
        <IconButton
          aria-label="Add"
          icon={
            <Text fontSize="xs" fontWeight="bold">
              +
            </Text>
          }
          size="xs"
          variant="ghost"
          borderRadius="full"
          isDisabled
        />
      </HStack>
    </KanbanCard>
  )
})

const ChangeStatusMenu = observer(function ChangeStatusMenu({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()

  if (project.allowedManualTransitions.length === 0) return null

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label={t("submissionInbox.changeStatus")}
        icon={<Swap />}
        size="xs"
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
                  <Text fontSize="xs" color="text.secondary" noOfLines={1}>
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
