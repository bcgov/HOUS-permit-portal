import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { INote, NoteModel } from "../models/note"
import { INoteAttachmentDraft } from "../types/types"
import { convertToDate } from "../utils/utility-functions"

const nullableDate = (value: unknown) => (value ? convertToDate(value) : null)

const responseError = (data: unknown, problem: unknown) => {
  return (data as { errors?: unknown } | undefined)?.errors || problem
}

export const NoteStoreModel = types
  .model("NoteStore", {
    notesMap: types.map(NoteModel),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .actions((self) => ({
    __beforeMergeUpdate(note: Record<string, unknown>) {
      return {
        ...note,
        createdAt: nullableDate(note.createdAt),
        updatedAt: nullableDate(note.updatedAt),
      }
    },
  }))
  .actions((self) => ({
    fetchProjectMeetingNotes: flow(function* (projectMeetingId: string) {
      const response = yield* toGenerator(self.environment.api.fetchProjectMeetingNotes(projectMeetingId))
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "notesMap")
        self.rootStore.projectMeetingStore.projectMeetingsMap.get(projectMeetingId)?.setNotes(response.data.data)
        return response.data.data as INote[]
      }
      return []
    }),
    fetchPermitProjectNotes: flow(function* (permitProjectId: string) {
      const response = yield* toGenerator(self.environment.api.fetchPermitProjectNotes(permitProjectId))
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "notesMap")
        self.rootStore.permitProjectStore.permitProjectMap.get(permitProjectId)?.setNotes(response.data.data)
        return response.data.data as INote[]
      }
      return []
    }),
    createProjectMeetingNote: flow(function* (
      projectMeetingId: string,
      body: string,
      attachments: INoteAttachmentDraft[] = []
    ) {
      const response = yield* toGenerator(
        self.environment.api.createProjectMeetingNote(projectMeetingId, body, attachments)
      )
      if (response.ok) {
        self.mergeUpdate(response.data.data, "notesMap")

        const projectMeeting = self.rootStore.projectMeetingStore.projectMeetingsMap.get(projectMeetingId)
        if (projectMeeting) {
          projectMeeting.prependNote(response.data.data)
          projectMeeting.setNotesCount(projectMeeting.notesCount + 1)
        }

        const permitProjectId = response.data.data.permitProjectId
        if (permitProjectId) {
          self.rootStore.permitProjectStore.permitProjectMap.get(permitProjectId)?.prependNote(response.data.data)
        }

        return { ok: true, data: response.data.data as INote }
      }
      return { ok: false, error: responseError(response.data, response.problem) }
    }),
  }))

export interface INoteStore extends Instance<typeof NoteStoreModel> {}
