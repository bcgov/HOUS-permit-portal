import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react"
import { Chat, Download } from "@phosphor-icons/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { INote } from "../../../../../models/note"
import { EProjectMeetingStatus } from "../../../../../types/enums"
import { INoteAttachmentDraft } from "../../../../../types/types"
import { isTipTapEmpty } from "../../../../../utils/utility-functions"
import { EmptyResultsBox } from "../../../../shared/grid/empty-results-box"
import { NoteCard } from "../../../../shared/notes/note-card"
import { NoteComposer } from "../../../../shared/notes/note-composer"
import { useNoteAttachments } from "../../../../shared/notes/use-note-attachments"
import { MeetingNotesVisibilityBanner } from "../banners/meeting-notes-visibility-banner"
import { DetailSection } from "../detail-section"

interface MeetingNotesSectionProps {
  status: EProjectMeetingStatus
  notes?: INote[]
  showVisibilityBanner?: boolean
  canAddNote?: boolean
  isAddingNote?: boolean
  onAddNote?: (body: string, attachments: INoteAttachmentDraft[]) => Promise<boolean>
  onDownloadNotes?: () => void
}

export const MeetingNotesSection = ({
  status,
  notes = [],
  showVisibilityBanner = false,
  canAddNote = false,
  isAddingNote = false,
  onAddNote,
  onDownloadNotes,
}: MeetingNotesSectionProps) => {
  const { t } = useTranslation()
  const [body, setBody] = useState("")
  const { attachments, isUploading, addFiles, removeAttachment, clearAttachments } = useNoteAttachments()
  const addNoteDisabled = isAddingNote || isUploading || isTipTapEmpty(body)

  const handleAddNote = async () => {
    if (!onAddNote || addNoteDisabled) return

    const ok = await onAddNote(body, attachments)
    if (ok) {
      setBody("")
      clearAttachments()
    }
  }

  return (
    <DetailSection title={t("projectMeeting.detail.notes.title")}>
      {showVisibilityBanner && <MeetingNotesVisibilityBanner />}

      {canAddNote && (
        <Box mb={4}>
          <Text fontWeight="bold" mb={2}>
            {t("projectMeeting.detail.notes.addNote")}
          </Text>
          <NoteComposer
            body={body}
            onChange={setBody}
            placeholder={t("projectMeeting.detail.notes.addNotePlaceholder")}
            attachments={attachments}
            isUploading={isUploading}
            onAddFiles={addFiles}
            onRemoveAttachment={removeAttachment}
          />
        </Box>
      )}

      {(canAddNote || notes.length > 0) && (
        <HStack spacing={3} mb={4}>
          {canAddNote && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNote}
              isDisabled={addNoteDisabled}
              isLoading={isAddingNote}
            >
              {t("projectMeeting.detail.notes.addNote")}
            </Button>
          )}
          {notes.length > 0 && (
            <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} onClick={onDownloadNotes}>
              {t("projectMeeting.detail.notes.downloadAll")}
            </Button>
          )}
        </HStack>
      )}

      <Text fontWeight="bold" mb={3}>
        {t("projectMeeting.detail.notes.reviewerNotes")}
      </Text>
      {notes.length === 0 ? (
        <EmptyResultsBox
          title={t("projectMeeting.detail.notes.emptyTitle")}
          description={t("projectMeeting.detail.notes.emptyDescription")}
          icon={<Chat size={18} />}
        />
      ) : (
        <VStack align="stretch" spacing={4}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </VStack>
      )}
    </DetailSection>
  )
}
