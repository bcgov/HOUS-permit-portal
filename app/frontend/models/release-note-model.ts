import { Instance, types } from "mobx-state-tree"
import { EReleaseNoteStatus, EReleaseNoteType } from "../types/enums"

export const ReleaseNoteModel = types.model("ReleaseNoteModel", {
  id: types.identifier,
  releaseType: types.enumeration(Object.values(EReleaseNoteType)),
  version: types.maybeNull(types.string),
  name: types.maybeNull(types.string),
  displayLabel: types.maybeNull(types.string),
  releaseDate: types.Date,
  releaseNotesUrl: types.maybeNull(types.string),
  status: types.enumeration(Object.values(EReleaseNoteStatus)),
  content: types.maybeNull(types.string),
  issues: types.maybeNull(types.string),
  updatedAt: types.Date,
})

export interface IReleaseNote extends Instance<typeof ReleaseNoteModel> {}
