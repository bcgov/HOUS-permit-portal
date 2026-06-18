import { Instance, types } from "mobx-state-tree"
import { EReleaseNoteStatus } from "../types/enums"

export const ReleaseNoteModel = types.model("ReleaseNoteModel", {
  id: types.identifier,
  version: types.string,
  releaseDate: types.Date,
  releaseNotesUrl: types.string,
  status: types.enumeration(Object.values(EReleaseNoteStatus)),
  content: types.maybeNull(types.string),
  issues: types.maybeNull(types.string),
  updatedAt: types.Date,
})

export interface IReleaseNote extends Instance<typeof ReleaseNoteModel> {}
