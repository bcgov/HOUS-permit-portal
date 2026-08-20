import { VStack } from "@chakra-ui/react"
import { Chat } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { INote } from "../../../models/note"
import { EmptyResultsBox } from "../grid/empty-results-box"
import { RouterLink } from "../navigation/router-link"
import { NoteCard } from "../notes/note-card"

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
        {notes.map((note) => {
          const meetingPath = note.projectMeetingId ? getMeetingPath(note) : undefined

          return (
            <NoteCard
              key={note.id}
              note={note}
              footer={
                meetingPath && (
                  <RouterLink to={meetingPath} color="text.link" fontSize="sm">
                    {t("submissionInbox.projectDetail.viewProjectMeeting")}
                  </RouterLink>
                )
              }
            />
          )
        })}
      </VStack>
    )
  }
)
