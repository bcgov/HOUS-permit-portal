import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import { Clock } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { INote } from "../../../models/note"
import { SafeTipTapDisplay } from "../editor/safe-tiptap-display"
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
        <Box border="1px" borderColor="border.light" borderRadius="md" p={4}>
          <HStack align="start" spacing={2}>
            <Clock size={18} />
            <Box>
              <Text fontWeight="bold" mb={1}>
                {t("projectMeeting.detail.notes.emptyTitle")}
              </Text>
              <Text fontSize="sm">{emptyDescription}</Text>
            </Box>
          </HStack>
        </Box>
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
