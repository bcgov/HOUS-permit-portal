import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import { Chat } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { INote } from "../../../models/note"
import { SafeTipTapDisplay } from "../editor/safe-tiptap-display"
import { EmptyResultsBox } from "../grid/empty-results-box"
import { RouterLink } from "../navigation/router-link"

interface ProjectMeetingNotesListProps {
  notes: INote[]
  emptyDescription: string
  getMeetingPath: (note: INote) => string
}

export const ProjectMeetingNotesList = observer(
  ({ notes, emptyDescription, getMeetingPath }: ProjectMeetingNotesListProps) => {
    const { t } = useTranslation()

    if (notes.length === 0) {
      return (
        <EmptyResultsBox
          title={t("projectMeeting.detail.notes.emptyTitle")}
          description={emptyDescription}
          icon={<Chat size={18} />}
        />
      )
    }

    return (
      <VStack align="stretch" spacing={4}>
        {notes.map((note) => (
          <ProjectMeetingNoteCard
            key={note.id}
            note={note}
            meetingPath={note.projectMeetingId ? getMeetingPath(note) : undefined}
          />
        ))}
      </VStack>
    )
  }
)

const ProjectMeetingNoteCard = ({ note, meetingPath }: { note: INote; meetingPath?: string }) => {
  const { t } = useTranslation()
  const createdAt = note.createdAt ? format(note.createdAt, datefnsTableDateTimeFormat) : null

  return (
    <Box border="1px" borderColor="border.light" borderRadius="md" p={4}>
      <VStack align="stretch" spacing={2}>
        <HStack spacing={4} align="baseline">
          <Text fontWeight="bold">{note.authorName}</Text>
          {createdAt && (
            <Text color="text.secondary" fontSize="sm">
              {createdAt}
            </Text>
          )}
        </HStack>
        <SafeTipTapDisplay htmlContent={note.body} fontSize="md" />
        {meetingPath && (
          <RouterLink to={meetingPath} color="text.link" fontSize="sm">
            {t("submissionInbox.projectDetail.viewProjectMeeting")}
          </RouterLink>
        )}
      </VStack>
    </Box>
  )
}
