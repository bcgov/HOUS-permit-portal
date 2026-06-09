import { Box, Button, Text } from "@chakra-ui/react"
import { Download } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EProjectMeetingStatus } from "../../../../../types/enums"
import { MeetingNotesVisibilityBanner } from "../banners/meeting-notes-visibility-banner"
import { ReviewerClosedNotesBanner } from "../banners/reviewer-closed-notes-banner"
import { DetailSection } from "../detail-section"

interface MeetingNotesSectionProps {
  status: EProjectMeetingStatus
  showVisibilityBanner?: boolean
  internalNotesLink?: string | null
}

export const MeetingNotesSection = ({
  status,
  showVisibilityBanner = false,
  internalNotesLink,
}: MeetingNotesSectionProps) => {
  const { t } = useTranslation()
  const showClosedBanner = showVisibilityBanner && status === EProjectMeetingStatus.closed

  return (
    <DetailSection title={t("projectMeeting.detail.notes.title")}>
      {showVisibilityBanner && <MeetingNotesVisibilityBanner />}
      {showClosedBanner && <ReviewerClosedNotesBanner internalNotesLink={internalNotesLink} />}

      {/* MEETING NOTES TODO */}
      {/* Future work: reviewer-authored notes feed (Figma shows threaded cards by author + timestamp), */}
      {/* "Download all notes" export, add-note composer for open/scheduled states, */}
      {/* and backend storage/authorization distinct from requester `meetingNotes` field. */}
      {/* Closed state: show Figma closed alert (implemented in banner) but no note list yet. */}
      <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} isDisabled mb={4}>
        {t("projectMeeting.detail.notes.downloadAll")}
      </Button>
      <Box border="1px" borderColor="border.light" borderRadius="md" p={4}>
        <Text fontWeight="bold" mb={1}>
          {t("projectMeeting.detail.notes.reviewerNotes")}
        </Text>
        <Text color="text.secondary">{t("projectMeeting.detail.notes.emptyDescription")}</Text>
      </Box>
    </DetailSection>
  )
}
