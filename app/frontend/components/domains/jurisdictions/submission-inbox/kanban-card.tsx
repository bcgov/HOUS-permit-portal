import { Box, HStack, IconButton } from "@chakra-ui/react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DotsSixVertical, EyeSlash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface IProps {
  id: string
  onMarkUnread?: () => void
  statusMenu?: ReactNode
  children: ReactNode
}

export const KanbanCard = observer(function KanbanCard({ id, onMarkUnread, statusMenu, children }: IProps) {
  const { t } = useTranslation()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
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
      p={3}
      role="group"
      cursor="pointer"
      _hover={{ shadow: "sm" }}
      position="relative"
    >
      <HStack position="absolute" top={1} right={1} spacing={1}>
        <IconButton
          aria-label="Move"
          icon={<DotsSixVertical size={16} />}
          size="sm"
          minW={7}
          h={7}
          variant="ghost"
          cursor="grab"
          {...attributes}
          {...listeners}
        />
        {statusMenu}
        {onMarkUnread && (
          <IconButton
            aria-label={t("submissionInbox.markUnread")}
            icon={<EyeSlash size={16} />}
            size="sm"
            minW={7}
            h={7}
            variant="ghost"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMarkUnread()
            }}
          />
        )}
      </HStack>

      {children}
    </Box>
  )
})
