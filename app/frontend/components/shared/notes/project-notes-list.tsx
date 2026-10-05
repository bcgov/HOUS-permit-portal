import { HStack, VStack } from "@chakra-ui/react"
import { Chat } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { INote } from "../../../models/note"
import { ENoteableType } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { InboxFilter } from "../filters/inbox-filter"
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
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])

    if (notes.length === 0) {
      return (
        <EmptyResultsBox
          title={t("projectMeeting.detail.notes.emptyTitle")}
          description={emptyDescription}
          icon={<Chat size={18} />}
        />
      )
    }

    const typeOptions: IOption[] = [
      { value: ENoteableType.ProjectMeeting, label: t("permitProject.notes.filters.projectMeeting") },
      { value: ENoteableType.SubmissionVersion, label: t("permitProject.notes.filters.submissionVersion") },
    ]
    const authorOptions: IOption[] = [...new Set(notes.flatMap((note) => (note.authorName ? [note.authorName] : [])))]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ value: name, label: name }))
    const filteredNotes = notes.filter((note) => {
      const typeOk = selectedTypes.length === 0 || selectedTypes.includes(note.noteableType)
      const authorOk = selectedAuthors.length === 0 || selectedAuthors.includes(note.authorName ?? "")
      return typeOk && authorOk
    })

    return (
      <VStack align="stretch" spacing={4}>
        <HStack spacing={2} flexWrap="wrap">
          <InboxFilter
            title={t("permitProject.notes.filters.type")}
            isMulti
            value={selectedTypes}
            onChange={(value) => setSelectedTypes(value as string[])}
            options={typeOptions}
            onApply={() => {}}
          />
          <InboxFilter
            title={t("permitProject.notes.filters.author")}
            isMulti
            value={selectedAuthors}
            onChange={(value) => setSelectedAuthors(value as string[])}
            options={authorOptions}
            onApply={() => {}}
          />
        </HStack>
        {filteredNotes.length === 0 ? (
          <EmptyResultsBox
            title={t("projectMeeting.detail.notes.emptyTitle")}
            description={t("permitProject.notes.filters.noMatches")}
            icon={<Chat size={18} />}
          />
        ) : (
          filteredNotes.map((note) => {
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
          })
        )}
      </VStack>
    )
  }
)
