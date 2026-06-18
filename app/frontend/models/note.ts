import { Instance, types } from "mobx-state-tree"
import { ENoteableType } from "../types/enums"

export const NoteModel = types
  .model("Note", {
    id: types.identifier,
    body: types.string,
    noteableType: types.enumeration(Object.values(ENoteableType)),
    noteableId: types.string,
    authorName: types.maybeNull(types.string),
    permitProjectId: types.maybeNull(types.string),
    projectNumber: types.maybeNull(types.string),
    projectAddress: types.maybeNull(types.string),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .views((self) => ({
    get projectMeetingId() {
      return self.noteableType === ENoteableType.ProjectMeeting ? self.noteableId : null
    },
  }))

export interface INote extends Instance<typeof NoteModel> {}
