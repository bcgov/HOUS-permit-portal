import { Instance, types } from "mobx-state-tree"
import { ENoteKind, ENoteableType } from "../types/enums"
import { INoteAttachmentDocument } from "../types/types"

export const NoteModel = types
  .model("Note", {
    id: types.identifier,
    body: types.string,
    kind: types.optional(types.enumeration(Object.values(ENoteKind)), ENoteKind.meeting),
    noteableType: types.enumeration(Object.values(ENoteableType)),
    noteableId: types.string,
    authorName: types.maybeNull(types.string),
    permitProjectId: types.maybeNull(types.string),
    permitApplicationId: types.maybeNull(types.string),
    noteableLabel: types.maybeNull(types.string),
    projectNumber: types.maybeNull(types.string),
    projectAddress: types.maybeNull(types.string),
    publishedAt: types.maybeNull(types.Date),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
    noteAttachmentDocuments: types.optional(types.array(types.frozen<INoteAttachmentDocument>()), []),
  })
  .views((self) => ({
    get projectMeetingId() {
      return self.noteableType === ENoteableType.ProjectMeeting ? self.noteableId : null
    },
  }))

export interface INote extends Instance<typeof NoteModel> {}
