import {
  Box,
  Circle,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Spinner,
  Tooltip,
} from "@chakra-ui/react"
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
      <HStack position="absolute" top={2} right={2} spacing={1} align="center" zIndex={1}>
        {isUnread && <Circle size="10px" bg="theme.blueActive" flexShrink={0} />}
        <Tooltip label={t("submissionInbox.dragToReorder")} hasArrow placement="top">
          <IconButton
            aria-label={t("submissionInbox.reorder")}
            icon={<DotsSixVertical size={16} weight="bold" />}
            size="xs"
            minW={5}
            h={5}
            variant="ghost"
            color="gray.500"
            _hover={{ bg: "gray.100" }}
            cursor="grab"
            {...attributes}
            {...listeners}
          />
        </Tooltip>
      </HStack>

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
          {showReorderMenu && (
            <Menu>
              <Tooltip label={t("submissionInbox.reorder")} hasArrow placement="top">
                <MenuButton
                  as={IconButton}
                  aria-label={t("submissionInbox.reorder")}
                  icon={<ArrowsDownUp size={16} />}
                  size="sm"
                  minW={7}
                  h={7}
                  variant="ghost"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                  }}
                />
              </Tooltip>
              <Portal>
                <MenuList zIndex={10}>
                  {REORDER_MENU_ITEMS.map(({ direction, labelKey, needsUp }) => (
                    <MenuItem
                      key={direction}
                      fontSize="sm"
                      isDisabled={needsUp ? !canMoveUp : !canMoveDown}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onMove?.(direction)
                      }}
                    >
                      {t(labelKey)}
                    </MenuItem>
                  ))}
                </MenuList>
              </Portal>
            </Menu>
          )}
          {statusMenu}
          {onMarkUnread && <SubmissionInboxMarkUnreadIconButton onMarkUnread={onMarkUnread} />}
        </HStack>
      </HStack>
    </Box>
  )
})
