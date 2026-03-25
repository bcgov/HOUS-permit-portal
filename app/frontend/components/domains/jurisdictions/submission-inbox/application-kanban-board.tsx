import { Box, Circle, HStack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { EPermitApplicationStatus } from "../../../../types/enums"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"
import { IKanbanColumn, KanbanBoard } from "./kanban-board"
import { KanbanCard } from "./kanban-card"

interface IProps {
  applications: IPermitApplication[]
  stateCounts: Record<string, number>
  collapsedColumns: string[]
  onToggleColumn: (columnKey: string) => void
  overflowBanner?: React.ReactNode
}

const APPLICATION_KANBAN_COLUMNS: EPermitApplicationStatus[] = [
  EPermitApplicationStatus.newlySubmitted,
  EPermitApplicationStatus.inReview,
  EPermitApplicationStatus.revisionsRequested,
  EPermitApplicationStatus.resubmitted,
  EPermitApplicationStatus.approved,
]

export const ApplicationKanbanBoard = observer(function ApplicationKanbanBoard({
  applications,
  stateCounts,
  collapsedColumns,
  onToggleColumn,
  overflowBanner,
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

  const items = useMemo(
    () => applications.map((a) => ({ ...a, id: a.id, columnKey: a.status })),
    [applications, applications.length]
  )

  return (
    <KanbanBoard
      columns={columns}
      items={items}
      stateCounts={stateCounts}
      collapsedColumns={collapsedColumns}
      onToggleColumn={onToggleColumn}
      overflowBanner={overflowBanner}
      renderCard={(item) => {
        const application = applications.find((a) => a.id === item.id)
        if (!application) return null
        return <ApplicationKanbanCard key={application.id} application={application} />
      }}
    />
  )
})

const ApplicationKanbanCard = observer(function ApplicationKanbanCard({
  application,
}: {
  application: IPermitApplication
}) {
  const { t } = useTranslation()

  return (
    <KanbanCard id={application.id}>
      <Box _hover={{ textDecoration: "none" }} display="block">
        <HStack spacing={2} mb={1}>
          <Circle size="8px" bg="transparent" flexShrink={0} />
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

        <Box mt={2}>
          <PermitApplicationStatusTag status={application.status} size="sm" px={2} py={0.5} fontSize="2xs" />
        </Box>
      </Box>
    </KanbanCard>
  )
})
