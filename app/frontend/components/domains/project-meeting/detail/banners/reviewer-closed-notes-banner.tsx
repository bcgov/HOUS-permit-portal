import { Link, Text } from "@chakra-ui/react"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"

interface ReviewerClosedNotesBannerProps {
  internalNotesLink?: string | null
}

export const ReviewerClosedNotesBanner = ({ internalNotesLink }: ReviewerClosedNotesBannerProps) => {
  const { t } = useTranslation()

  return (
    <CustomMessageBox
      status={EFlashMessageStatus.info}
      title={t("projectMeeting.detail.reviewer.closedNotesTitle")}
      mb={4}
    >
      <Text fontSize="sm">
        <Trans
          i18nKey="projectMeeting.detail.reviewer.closedNotesDescription"
          components={{
            internalNotesLink: internalNotesLink ? (
              <Link as={RouterLink} to={internalNotesLink} color="text.link" textDecoration="underline" />
            ) : (
              <Text as="span" color="text.link" textDecoration="underline" />
            ),
          }}
        />
      </Text>
    </CustomMessageBox>
  )
}
