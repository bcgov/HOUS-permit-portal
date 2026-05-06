import { Tooltip } from "@/components/ui/tooltip"
import { Box, Circle, HStack, IconButton, Menu, Portal, Spinner } from "@chakra-ui/react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowsDownUp, DotsSixVertical, UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { EReorderDirection } from "./kanban-board"
import { SubmissionInboxMarkUnreadIconButton } from "./submission-inbox-mark-unread-icon-button"

const REORDER_MENU_ITEMS = [
  { direction: EReorderDirection.top, labelKey: "submissionInbox.moveToTop" as const, needsUp: true },
  { direction: EReorderDirection.up, labelKey: "submissionInbox.moveUp" as const, needsUp: true },
  { direction: EReorderDirection.down, labelKey: "submissionInbox.moveDown" as const, needsUp: false },
  { direction: EReorderDirection.bottom, labelKey: "submissionInbox.moveToBottom" as const, needsUp: false },
]

interface IProps {
  id: string
  isUnread?: boolean
  onMarkUnread?: () => void
  statusMenu?: ReactNode
  avatars?: ReactNode
  onAssigneeClick?: (e: React.MouseEvent) => void
  isAssigneeLoading?: boolean
  onMove?: (direction: EReorderDirection) => void
  isFirst?: boolean
  isLast?: boolean
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
  onMove,
  isFirst,
  isLast,
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

  const canMoveUp = !!onMove && !isFirst
  const canMoveDown = !!onMove && !isLast
  const showReorderMenu = canMoveUp || canMoveDown

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
      <HStack position="absolute" top={2} right={2} gap={1} align="center" zIndex={1}>
        {isUnread && <Circle size="10px" bg="theme.blueActive" flexShrink={0} />}
        <Tooltip
          content={t("submissionInbox.dragToReorder")}
          showArrow
          positioning={{
            placement: "top",
          }}
        >
          <IconButton
            aria-label={t("submissionInbox.reorder")}
            size="xs"
            minW={5}
            h={5}
            variant="ghost"
            color="gray.500"
            _hover={{ bg: "gray.100" }}
            cursor="grab"
            {...attributes}
            {...listeners}
          >
            <DotsSixVertical size={16} weight="bold" />
          </IconButton>
        </Tooltip>
      </HStack>
      {children}
      <HStack gap={0} mt={1} justifyContent="space-between">
        <HStack gap={1}>
          {avatars}
          {onAssigneeClick && (
            <Tooltip
              content={t("permitCollaboration.sidebar.title")}
              showArrow
              positioning={{
                placement: "top",
              }}
            >
              <IconButton
                aria-label={t("permitCollaboration.sidebar.title")}
                size="sm"
                minW={7}
                h={7}
                variant="ghost"
                onClick={onAssigneeClick}
                disabled={isAssigneeLoading}
              >
                {isAssigneeLoading ? <Spinner size="xs" /> : <UserPlus size={16} />}
              </IconButton>
            </Tooltip>
          )}
        </HStack>
        <HStack gap={0}>
          {showReorderMenu && (
            <Menu.Root>
              <Tooltip
                content={t("submissionInbox.reorder")}
                showArrow
                positioning={{
                  placement: "top",
                }}
              >
                <Menu.Trigger asChild>
                  <IconButton
                    aria-label={t("submissionInbox.reorder")}
                    icon={<ArrowsDownUp size={16} />}
                    size="sm"
                    minW={7}
                    h={7}
                    variant="ghost"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                    }}
                  ></IconButton>
                </Menu.Trigger>
              </Tooltip>
              <Portal>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      {REORDER_MENU_ITEMS.map(({ direction, labelKey, needsUp }) => (
                        <Menu.Item
                          key={direction}
                          fontSize="sm"
                          disabled={needsUp ? !canMoveUp : !canMoveDown}
                          onSelect={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onMove?.(direction)
                          }}
                          value="item-0"
                        >
                          {t(labelKey)}
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Portal>
            </Menu.Root>
          )}
          {statusMenu}
          {onMarkUnread && <SubmissionInboxMarkUnreadIconButton onMarkUnread={onMarkUnread} />}
        </HStack>
      </HStack>
    </Box>
  )
})
