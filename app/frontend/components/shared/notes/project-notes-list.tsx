import { VStack } from "@chakra-ui/react"
import { Chat } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { INote } from "../../../models/note"
import { EmptyResultsBox } from "../grid/empty-results-box"
import { RouterLink } from "../navigation/router-link"
import { NoteCard } from "./note-card"

interface ProjectNotesListProps {
  notes: INote[]
  emptyDescription: string
  getMeetingPath: (note: INote) => string
  getApplicationPath?: (note: INote) => string
}

export const ProjectNotesList = observer(
  ({ notes, emptyDescription, getMeetingPath, getApplicationPath }: ProjectNotesListProps) => {
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
          const applicationPath = note.permitApplicationId ? getApplicationPath?.(note) : undefined
          const kindLabel =
            note.kind === "applicant_message"
              ? t("submissionInbox.projectDetail.noteToApplicant")
              : note.kind === "submitter_message"
                ? t("submissionInbox.projectDetail.messageFromSubmitter")
                : t("submissionInbox.projectDetail.meetingNote")
          const subjectPath = meetingPath || applicationPath
          const subjectLabel =
            note.noteableLabel || (meetingPath ? t("submissionInbox.projectDetail.viewProjectMeeting") : null)

          return (
            <NoteCard
              key={note.id}
              note={note}
              label={kindLabel}
              footer={
                subjectPath &&
                subjectLabel && (
                  <RouterLink to={subjectPath} color="text.link" fontSize="sm">
                    {subjectLabel}
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
