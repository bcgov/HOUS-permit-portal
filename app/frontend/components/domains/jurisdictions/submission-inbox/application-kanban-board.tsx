import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import { Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { useMst } from "../../../../setup/root"
import { colors } from "../../../../styles/theme/foundations/colors"
import { ECollaborationType, EPermitApplicationStatus } from "../../../../types/enums"
import { SharedAvatar } from "../../../shared/user/shared-avatar"
import { CollaboratorsSidebarDrawer } from "../../permit-application/collaborator-management/collaborators-sidebar"
import { IKanbanColumn, IReorderEvent, KanbanBoard } from "./kanban-board"
import { KanbanCard } from "./kanban-card"

interface IProps {
  applications: IPermitApplication[]
  stateCounts: Record<string, number>
  columnTotals?: Record<string, number>
  collapsedColumns: string[]
  onToggleColumn: (columnKey: string) => void
  onShowMore?: (columnKey: string) => void
  onReorder?: (event: IReorderEvent) => void
}

const APPLICATION_KANBAN_COLUMNS: EPermitApplicationStatus[] = [
  EPermitApplicationStatus.newlySubmitted,
  EPermitApplicationStatus.resubmitted,
  EPermitApplicationStatus.inReview,
  EPermitApplicationStatus.revisionsRequested,
  EPermitApplicationStatus.approved,
  EPermitApplicationStatus.issued,
  EPermitApplicationStatus.withdrawn,
]

export const ApplicationKanbanBoard = observer(function ApplicationKanbanBoard({
  applications,
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
      APPLICATION_KANBAN_COLUMNS.map((status) => ({
        key: status,
        // @ts-ignore
        label: t(`submissionInbox.applicationStatuses.${status}`),
      })),
    [t]
  )

  const itemsKey = applications.map((a) => `${a.id}:${a.status}:${a.inboxSortOrder ?? ""}`).join(",")
  const items = useMemo(
    () => applications.map((a) => ({ ...a, id: a.id, columnKey: a.status, sortOrder: a.inboxSortOrder })),
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
        const application = applications.find((a) => a.id === item.id)
        if (!application) return null
        return <ApplicationKanbanCard key={application.id} application={application} />
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
}: {
  application: IPermitApplication
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { permitApplicationStore } = useMst()
  const isSandbox = !!application.sandbox
  const isUnread = !application.isViewed
  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure()
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(false)

  const designatedReviewer = application.designatedReviewer
  const designatedReviewerUser = designatedReviewer?.collaborator?.user

  const blockAssignees = application.getCollaborationAssignees(ECollaborationType.review)
  const seenUserIds = new Set(designatedReviewerUser ? [designatedReviewerUser.id] : [])
  const uniqueAssigneeUsers: { name: string; id: string; role: string }[] = []
  for (const collab of blockAssignees) {
    const user = collab.collaborator?.user
    if (user && !seenUserIds.has(user.id)) {
      seenUserIds.add(user.id)
      uniqueAssigneeUsers.push({ name: user.name, id: user.id, role: user.role })
    }
  }

  const MAX_VISIBLE_AVATARS = 3
  const allAvatarUsers = [
    ...(designatedReviewerUser
      ? [
          {
            name: designatedReviewerUser.name,
            id: designatedReviewerUser.id,
            role: designatedReviewerUser.role,
            isDesignated: true,
          },
        ]
      : []),
    ...uniqueAssigneeUsers.map((u) => ({ ...u, isDesignated: false })),
  ]
  const visibleAvatars = allAvatarUsers.slice(0, MAX_VISIBLE_AVATARS)
  const overflowCount = allAvatarUsers.length - MAX_VISIBLE_AVATARS

  const handleOpenSidebar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoadingSidebar(true)
    try {
      await permitApplicationStore.fetchPermitApplication(application.id, true)
    } finally {
      setIsLoadingSidebar(false)
    }
    onSidebarOpen()
  }

  return (
    <KanbanCard
      id={application.id}
      isUnread={isUnread}
      onMarkUnread={isUnread ? undefined : () => application.markAsUnviewed()}
      statusMenu={<ChangeStatusMenu application={application} />}
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
        as={Link}
        to={`/permit-applications/${application.id}`}
        display="block"
        color="inherit"
        textDecoration="none"
        _hover={{ textDecoration: "none", color: "inherit" }}
        _visited={{ color: "inherit" }}
        _active={{ color: "inherit" }}
      >
        <Box pr={4}>
          <Text fontWeight={700} fontSize="sm" noOfLines={2}>
            {application.nickname}
          </Text>
          <Text fontSize="xs" color="text.secondary" noOfLines={1}>
            {application.number}
          </Text>
        </Box>

        <Text fontSize="xs" noOfLines={1} mt={1.5}>
          {application.shortAddress}
        </Text>
        {application.pid && (
          <Text fontSize="2xs" color="text.secondary">
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
      </Box>

      {isSidebarOpen && (
        <CollaboratorsSidebarDrawer
          permitApplication={application}
          collaborationType={ECollaborationType.review}
          isOpen={isSidebarOpen}
          onClose={onSidebarClose}
        />
      )}
    </KanbanCard>
  )
})

const ChangeStatusMenu = observer(function ChangeStatusMenu({ application }: { application: IPermitApplication }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [pendingTransition, setPendingTransition] = useState<string | null>(null)

  const showRevisionsRequestedLink = application.status === EPermitApplicationStatus.inReview

  const handleTransition = useCallback(
    (target: string) => {
      if (target === EPermitApplicationStatus.issued) {
        setPendingTransition(target)
        onConfirmOpen()
      } else {
        application.transitionStatus(target)
      }
    },
    [application, onConfirmOpen]
  )

  const confirmTransition = useCallback(() => {
    if (pendingTransition) {
      application.transitionStatus(pendingTransition)
    }
    onConfirmClose()
    setPendingTransition(null)
  }, [application, pendingTransition, onConfirmClose])

  if (application.allowedManualTransitions.length === 0 && !showRevisionsRequestedLink) return null

  return (
    <>
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
            {application.allowedManualTransitions.map((transition) => (
              <MenuItem
                key={transition}
                fontSize="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleTransition(transition)
                }}
              >
                {/* @ts-ignore */}
                {t(`submissionInbox.applicationStatuses.${transition}`)}
              </MenuItem>
            ))}
            {showRevisionsRequestedLink && (
              <MenuItem
                fontSize="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigate(`/permit-applications/${application.id}`)
                }}
              >
                {/* @ts-ignore */}
                {t(`submissionInbox.applicationStatuses.${EPermitApplicationStatus.revisionsRequested}`)}
              </MenuItem>
            )}
          </MenuList>
        </Portal>
      </Menu>

      <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {/* @ts-ignore */}
              {t("submissionInbox.confirmIssuePermit.title")}
            </AlertDialogHeader>

            {/* @ts-ignore */}
            <AlertDialogBody>{t("submissionInbox.confirmIssuePermit.body")}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onConfirmClose}>
                {t("ui.cancel")}
              </Button>
              <Button colorScheme="blue" onClick={confirmTransition} ml={3}>
                {/* @ts-ignore */}
                {t("submissionInbox.confirmIssuePermit.confirm")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
})
