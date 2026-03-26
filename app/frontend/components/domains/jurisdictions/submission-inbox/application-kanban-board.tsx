import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Circle,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { colors } from "../../../../styles/theme/foundations/colors"
import { EPermitApplicationStatus } from "../../../../types/enums"
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
  EPermitApplicationStatus.inReview,
  EPermitApplicationStatus.revisionsRequested,
  EPermitApplicationStatus.resubmitted,
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
  const isSandbox = !!application.sandbox
  const isUnread = !application.isViewed

  return (
    <KanbanCard
      id={application.id}
      onMarkUnread={isUnread ? undefined : () => application.markAsUnviewed()}
      statusMenu={<ChangeStatusMenu application={application} />}
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
        <HStack spacing={2} mb={1}>
          {isUnread && <Circle size="8px" bg={"theme.blueActive"} flexShrink={0} />}
        </HStack>

        <Text fontWeight={700} fontSize="sm" noOfLines={1}>
          {application.number}
        </Text>
        <Text fontSize="xs" color="text.secondary" noOfLines={1} mb={1}>
          {application.nickname || application.number}
        </Text>

        <Text fontSize="xs" noOfLines={1}>
          {application.fullAddress}
        </Text>
      </Box>
    </KanbanCard>
  )
})

const ChangeStatusMenu = observer(function ChangeStatusMenu({ application }: { application: IPermitApplication }) {
  const { t } = useTranslation()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [pendingTransition, setPendingTransition] = useState<string | null>(null)

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

  if (application.allowedManualTransitions.length === 0) return null

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label={t("submissionInbox.changeStatus")}
          icon={<Icon as={Swap} />}
          size="xs"
          variant="ghost"
        />
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
