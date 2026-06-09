import { Instance, types } from "mobx-state-tree"

export const NoteModel = types.model("Note", {
  id: types.identifier,
  body: types.string,
  noteableType: types.string,
  noteableId: types.string,
  authorName: types.maybeNull(types.string),
  authorEmail: types.maybeNull(types.string),
  projectMeetingId: types.maybeNull(types.string),
  permitProjectId: types.maybeNull(types.string),
  projectNumber: types.maybeNull(types.string),
  projectAddress: types.maybeNull(types.string),
  noteableLabel: types.maybeNull(types.string),
  createdAt: types.maybeNull(types.Date),
  updatedAt: types.maybeNull(types.Date),
})

export interface INote extends Instance<typeof NoteModel> {}
