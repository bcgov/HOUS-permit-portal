import { Box, Circle, IconButton, Tooltip } from "@chakra-ui/react"
import { Tray } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"

interface IProps {
  onMarkUnread: () => void
}

export const SubmissionInboxMarkUnreadIconButton = observer(function SubmissionInboxMarkUnreadIconButton({
  onMarkUnread,
}: IProps) {
  const { t } = useTranslation()

  return (
    <Tooltip label={t("submissionInbox.markUnread")} hasArrow placement="top">
      <Box position="relative" display="inline-flex">
        <IconButton
          aria-label={t("submissionInbox.markUnread")}
          icon={<Tray size={16} />}
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
        <Circle size="6px" bg="theme.blueActive" position="absolute" top={0.5} right={0.5} />
      </Box>
    </Tooltip>
  )
})
