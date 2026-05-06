import { Tooltip } from "@/components/ui/tooltip"
import { Box, Icon, IconButton, Menu, Portal, Text } from "@chakra-ui/react"
import { Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { useMst } from "../../../../setup/root"
import { colors } from "../../../../styles/theme/foundations/colors"
import { ECollaborationType, EPermitApplicationStatus } from "../../../../types/enums"
import { DesignatedCollaboratorAssignmentModal } from "../../permit-application/collaborator-management/designated-collaborator-assignment-modal"
import { EReorderDirection, IKanbanColumn, IReorderEvent, KanbanBoard } from "./kanban-board"
import { KanbanCard } from "./kanban-card"
import { renderAssignPlusIconTrigger, ReviewAssigneesRow } from "./review-assignees-row"

interface IProps {
  applications: IPermitApplication[]
  stateCounts: Record<string, number>
  columnTotals?: Record<string, number>
  unreadCounts?: Record<string, number>
  collapsedColumns: string[]
  onToggleColumn: (columnKey: string) => void
  onShowMore?: (columnKey: string) => void
  onReorder?: (event: IReorderEvent) => void
}

const APPLICATION_KANBAN_COLUMNS: EPermitApplicationStatus[] = [
  EPermitApplicationStatus.newlySubmitted,
  EPermitApplicationStatus.revisionsRequested,
  EPermitApplicationStatus.resubmitted,
  EPermitApplicationStatus.inReview,
  EPermitApplicationStatus.approved,
  EPermitApplicationStatus.issued,
  EPermitApplicationStatus.withdrawn,
]

export const ApplicationKanbanBoard = observer(function ApplicationKanbanBoard({
  applications,
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
      APPLICATION_KANBAN_COLUMNS.map((status) => ({
        key: status,
        // @ts-ignore
        label: t(`submissionInbox.applicationStatuses.${status}`),
      })),
    [t]
  )

  const itemsKey = applications.map((a) => `${a.id}:${a.status}:${a.inboxSortOrder ?? ""}:${a.isViewed}`).join(",")
  const items = useMemo(
    () =>
      applications.map((a) => ({
        ...a,
        id: a.id,
        columnKey: a.status,
        sortOrder: a.inboxSortOrder,
        isUnread: !a.isViewed,
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
      emptyColumnMessage={t("submissionInbox.noFilteredResultsWithStatus")}
      collapsedColumns={collapsedColumns}
      onToggleColumn={onToggleColumn}
      onShowMore={onShowMore}
      onReorder={onReorder}
      renderCard={(item, context) => {
        const application = applications.find((a) => a.id === item.id)
        if (!application) return null
        return (
          <ApplicationKanbanCard
            key={application.id}
            application={application}
            isFirst={context.isFirst}
            isLast={context.isLast}
            onMove={context.onMove}
          />
        )
      }}
    />
  )
})

const SANDBOX_STRIPE_BG = `repeating-linear-gradient(
  45deg,
  ${colors.background.sandboxStripe} 5px,
  ${colors.background.sandboxStripe} 10px,
  rgba(0, 0, 0, 0) 10px,
  rgba(0, 0, 0, 0) 20px
)`

const ApplicationKanbanCard = observer(function ApplicationKanbanCard({
  application,
  isFirst,
  isLast,
  onMove,
}: {
  application: IPermitApplication
  isFirst?: boolean
  isLast?: boolean
  onMove?: (direction: EReorderDirection) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { permitApplicationStore } = useMst()
  const isSandbox = !!application.sandbox
  const isUnread = !application.isViewed

  const primaryAssignee = application.designatedReviewer?.collaborator?.user ?? null
  const additionalCollaborations = application.getCollaborationAssignees(ECollaborationType.review)

  return (
    <KanbanCard
      id={application.id}
      isUnread={isUnread}
      onMarkUnread={isUnread ? undefined : () => application.markAsUnviewed()}
      statusMenu={<ChangeStatusMenu application={application} />}
      isFirst={isFirst}
      isLast={isLast}
      onMove={onMove}
      avatars={
        <ReviewAssigneesRow primaryAssignee={primaryAssignee}>
          <DesignatedCollaboratorAssignmentModal
            permitApplication={application}
            collaborationType={ECollaborationType.review}
            additionalCollaborations={additionalCollaborations}
            onBeforeOpen={async () => {
              await permitApplicationStore.fetchPermitApplication(application.id, true)
            }}
            renderTrigger={renderAssignPlusIconTrigger({
              ariaLabel: t("permitCollaboration.sidebar.title"),
              size: "sm",
            })}
          />
        </ReviewAssigneesRow>
      }
    >
      {isSandbox && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="6px"
          bg="background.sandboxBase"
          bgImage={SANDBOX_STRIPE_BG}
          borderTopRadius="md"
        />
      )}
      <Box
        display="block"
        color="inherit"
        textDecoration="none"
        _hover={{ textDecoration: "none", color: "inherit" }}
        _visited={{ color: "inherit" }}
        _active={{ color: "inherit" }}
        asChild
      >
        <Link to={`/permit-applications/${application.id}`}>
          <Box pr={8}>
            <Text fontWeight={700} fontSize="md" lineClamp={2}>
              {application.nickname}
            </Text>
            <Text fontSize="xs" color="text.secondary" lineClamp={1}>
              {application.number}
            </Text>
          </Box>
          <Text fontSize="xs" lineClamp={1} mt={1.5}>
            {application.shortAddress}
          </Text>
          {application.pid && (
            <Text fontSize="xs" color="text.secondary">
              PID {application.pid}
            </Text>
          )}
          {application.projectId && application.projectNumber && (
            <Text fontSize="xs" mt={1}>
              {/* @ts-ignore */}
              {t("submissionInbox.project")}{" "}
              <Box
                as="span"
                color="text.link"
                fontWeight={600}
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigate(`projects/${application.projectId}/overview`)
                }}
              >
                {application.projectNumber}
              </Box>
            </Text>
          )}
          {application.daysInQueue != null && (
            <Text fontSize="xs" color="text.secondary" mt={2.5}>
              {/* @ts-ignore */}
              {t("submissionInbox.daysInQueue", { count: application.daysInQueue })}
            </Text>
          )}
        </Link>
      </Box>
    </KanbanCard>
  )
})

const ChangeStatusMenu = observer(function ChangeStatusMenu({ application }: { application: IPermitApplication }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const showRevisionsRequestedLink = application.status === EPermitApplicationStatus.inReview

  if (application.allowedManualTransitions.length === 0 && !showRevisionsRequestedLink) return null

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
              {application.allowedManualTransitions.map((transition) => (
                <Menu.Item
                  key={transition}
                  fontSize="sm"
                  onSelect={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    application.transitionStatus(transition)
                  }}
                  value="item-0"
                >
                  {/* @ts-ignore */}
                  {t(`submissionInbox.applicationStatuses.${transition}`)}
                </Menu.Item>
              ))}
              {showRevisionsRequestedLink && (
                <Menu.Item
                  fontSize="sm"
                  onSelect={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate(`/permit-applications/${application.id}`)
                  }}
                  value="item-1"
                >
                  {/* @ts-ignore */}
                  {t(`submissionInbox.applicationStatuses.${EPermitApplicationStatus.revisionsRequested}`)}
                </Menu.Item>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Portal>
    </Menu.Root>
  )
})
