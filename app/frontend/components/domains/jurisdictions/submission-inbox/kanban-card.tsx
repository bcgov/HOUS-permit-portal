import { Box, Circle, HStack, IconButton, Spinner, Tooltip } from "@chakra-ui/react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowsDownUp, UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { SubmissionInboxMarkUnreadIconButton } from "./submission-inbox-mark-unread-icon-button"

interface IProps {
  id: string
  isUnread?: boolean
  onMarkUnread?: () => void
  statusMenu?: ReactNode
  avatars?: ReactNode
  onAssigneeClick?: (e: React.MouseEvent) => void
  isAssigneeLoading?: boolean
  children: ReactNode
}

export const KanbanCard = observer(function KanbanCard({
  id,
  isUnread,
  onMarkUnread,
  statusMenu,
  avatars,
  onAssigneeClick,
  isAssigneeLoading,
  children,
}: IProps) {
  const { t } = useTranslation()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  // Lock the active drag to the vertical axis only (avoids horizontal jitter next to overflow-x columns).
  const dragTransform = transform && isDragging ? { ...transform, x: 0 } : transform

  const style = {
    transform: CSS.Transform.toString(dragTransform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      bg="white"
      borderRadius="md"
      border="1px solid"
      borderColor="border.light"
      pt={3}
      px={3}
      pb={3}
      role="group"
      cursor="pointer"
      _hover={{ shadow: "sm", bg: "gray.50" }}
      _active={{ bg: "background.blueLight" }}
      position="relative"
    >
      {isUnread && <Circle size="10px" bg="theme.blueActive" position="absolute" top={5} right={4} />}

      {children}

      <HStack spacing={0} mt={1} justifyContent="space-between">
        <HStack spacing={1}>
          {avatars}
          {onAssigneeClick && (
            <Tooltip label={t("permitCollaboration.sidebar.title")} hasArrow placement="top">
              <IconButton
                aria-label={t("permitCollaboration.sidebar.title")}
                icon={isAssigneeLoading ? <Spinner size="xs" /> : <UserPlus size={16} />}
                size="sm"
                minW={7}
                h={7}
                variant="ghost"
                onClick={onAssigneeClick}
                isDisabled={isAssigneeLoading}
              />
            </Tooltip>
          )}
        </HStack>
        <HStack spacing={0}>
          <Tooltip label={t("submissionInbox.reorder")} hasArrow placement="top">
            <IconButton
              aria-label={t("submissionInbox.reorder")}
              icon={<ArrowsDownUp size={16} />}
              size="sm"
              minW={7}
              h={7}
              variant="ghost"
              cursor="grab"
              {...attributes}
              {...listeners}
            />
          </Tooltip>
          {statusMenu}
          {onMarkUnread && <SubmissionInboxMarkUnreadIconButton onMarkUnread={onMarkUnread} />}
        </HStack>
      </HStack>
    </Box>
  )
})
