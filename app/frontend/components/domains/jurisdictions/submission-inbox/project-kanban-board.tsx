import {
  Avatar,
  Badge,
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
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react"
import {
  Buildings,
  CalendarBlank,
  CaretDoubleLeft,
  CaretDoubleRight,
  DotsSixVertical,
  EyeSlash,
  Swap,
} from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { EProjectState } from "../../../../types/enums"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"

interface IProps {
  projects: IPermitProject[]
  stateCounts: Record<string, number>
  collapsedColumns: string[]
  onToggleColumn: (columnState: EProjectState) => void
}

const KANBAN_COLUMNS: EProjectState[] = [
  EProjectState.queued,
  EProjectState.waiting,
  EProjectState.inProgress,
  EProjectState.ready,
  EProjectState.permitIssued,
  EProjectState.active,
  EProjectState.complete,
]

export const ProjectKanbanBoard = observer(function ProjectKanbanBoard({
  projects,
  stateCounts,
  collapsedColumns,
  onToggleColumn,
}: IProps) {
  const { t } = useTranslation()

  const groupedProjects = useMemo(() => {
    const groups: Record<string, IPermitProject[]> = {}
    for (const col of KANBAN_COLUMNS) {
      groups[col] = []
    }
    for (const project of projects) {
      if (groups[project.state]) {
        groups[project.state].push(project)
      }
    }
    return groups
  }, [projects, projects.length])

  return (
    <Flex w="full" overflowX="auto" gap={4} pb={4} minH="400px" align="start">
      {KANBAN_COLUMNS.map((columnState) => {
        const columnProjects = groupedProjects[columnState] || []
        const isEmpty = columnProjects.length === 0
        const isManuallyCollapsed = !isEmpty && collapsedColumns.includes(columnState)
        const isCollapsed = isEmpty || isManuallyCollapsed
        const displayedCount = columnProjects.length
        const totalCount = stateCounts[columnState] ?? displayedCount

        return (
          <VStack
            key={columnState}
            minW={isCollapsed ? "auto" : "260px"}
            maxW={isCollapsed ? "60px" : "320px"}
            flex={isCollapsed ? "0" : "1"}
            bg="greys.grey03"
            borderRadius="lg"
            p={3}
            align="stretch"
            spacing={3}
          >
            {isCollapsed ? (
              <>
                {!isEmpty && (
                  <IconButton
                    aria-label="Expand column"
                    icon={<CaretDoubleRight />}
                    size="xs"
                    variant="ghost"
                    alignSelf="center"
                    onClick={() => onToggleColumn(columnState)}
                  />
                )}
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  textTransform="uppercase"
                  color="text.secondary"
                  sx={{ writingMode: "vertical-lr" }}
                  whiteSpace="nowrap"
                >
                  {/* @ts-ignore */}
                  {t(`submissionInbox.projectStatuses.${columnState}`)}
                </Text>
                <Badge
                  borderRadius="full"
                  py={2}
                  px={1}
                  fontSize="2xs"
                  bg="white"
                  color="text.secondary"
                  border="1px solid"
                  borderColor="border.light"
                  sx={{ writingMode: "vertical-lr" }}
                  whiteSpace="nowrap"
                  alignSelf="center"
                >
                  {displayedCount} of {totalCount}
                </Badge>
              </>
            ) : (
              <>
                <HStack justify="space-between">
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="text.secondary">
                    {/* @ts-ignore */}
                    {t(`submissionInbox.projectStatuses.${columnState}`)}
                  </Text>
                  <HStack spacing={1}>
                    <Badge
                      borderRadius="full"
                      px={2}
                      fontSize="xs"
                      bg="white"
                      color="text.secondary"
                      border="1px solid"
                      borderColor="border.light"
                    >
                      {displayedCount} of {totalCount}
                    </Badge>
                    <IconButton
                      aria-label="Collapse column"
                      icon={<CaretDoubleLeft />}
                      size="xs"
                      variant="ghost"
                      onClick={() => onToggleColumn(columnState)}
                    />
                  </HStack>
                </HStack>
                {columnProjects.map((project) => (
                  <KanbanCard key={project.id} project={project} />
                ))}
              </>
            )}
          </VStack>
        )
      })}
    </Flex>
  )
})

const KanbanCard = observer(function KanbanCard({ project }: { project: IPermitProject }) {
  const { t } = useTranslation()

  const received = project.newlySubmittedCount + project.resubmittedCount
  const total = project.totalPermitsCount
  const isUnread = !project.viewedAt

  return (
    <Box
      bg="white"
      borderRadius="md"
      border="1px solid"
      borderColor="border.light"
      p={3}
      role="group"
      cursor="pointer"
      _hover={{ shadow: "sm" }}
      position="relative"
    >
      {/* Hover action buttons */}
      <HStack
        position="absolute"
        top={2}
        right={2}
        spacing={0}
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.15s"
      >
        <IconButton aria-label="Move" icon={<DotsSixVertical />} size="xs" variant="ghost" cursor="grab" />
        <ChangeStatusMenu project={project} />
        <IconButton
          aria-label={t("submissionInbox.markUnread")}
          icon={<EyeSlash />}
          size="xs"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            project.markAsUnviewed()
          }}
        />
      </HStack>

      <Box as={Link} to={`projects/${project.id}/overview`} _hover={{ textDecoration: "none" }} display="block">
        {/* Header row: unread dot + icons + number */}
        <HStack spacing={2} mb={1}>
          <Circle size="8px" bg={isUnread ? "theme.blueActive" : "transparent"} flexShrink={0} />
          {/* ### SUBMISSION INDEX STUB FEATURE */}
          <Icon as={CalendarBlank} color="text.secondary" boxSize={4} display="none" />
          <Box p={1} borderRadius="sm" bg="greys.grey10" flexShrink={0}>
            <Buildings size={14} />
          </Box>
        </HStack>

        {/* Project number + title */}
        <Text fontWeight={700} fontSize="sm" noOfLines={1}>
          {project.number}
        </Text>
        <Text fontSize="xs" color="text.secondary" noOfLines={1} mb={1}>
          {project.title}
        </Text>

        {/* Address + PID */}
        <Text fontSize="xs" noOfLines={1}>
          {project.shortAddress}
        </Text>
        {project.pid && (
          <Text fontSize="xs" color="text.secondary">
            PID {project.pid}
          </Text>
        )}

        {/* Application count */}
        <Text fontSize="xs" color="text.secondary" mt={1}>
          {/* @ts-ignore */}
          {t("submissionInbox.applicationsReceived", { received, total })}
        </Text>

        {/* Days in queue stub */}
        <Text fontSize="xs" color="text.secondary">
          {/* @ts-ignore */}
          {t("submissionInbox.daysInQueue", { count: "--" })}
        </Text>

        {/* Rollup status */}
        <Box mt={2}>
          <RollupStatusBadge project={project} />
        </Box>
      </Box>

      {/* Bottom row: avatar placeholder + add button */}
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
    </Box>
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
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      />
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
            {t(`submissionInbox.projectStatuses.${transition}`)}
          </MenuItem>
        ))}
      </MenuList>
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
                <HStack key={idx} spacing={2}>
                  <PermitApplicationStatusTag
                    status={entry.status}
                    size="sm"
                    px={1.5}
                    py={0.5}
                    fontSize="2xs"
                    flexShrink={0}
                  />
                  <Text fontSize="xs" color="text.secondary" noOfLines={1}>
                    {entry.nickname || "—"}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
})
