import { applySnapshot, getSnapshot, Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { InfoDocumentFileModel } from "./info-document-file"

export const InfoDocumentModel = types
  .model("InfoDocumentModel", {
    id: types.identifier,
    title: types.string,
    description: types.maybeNull(types.string),
    topics: types.optional(types.array(types.string), []),
    sortOrder: types.number,
    publishedAt: types.maybeNull(types.Date),
    createdAt: types.optional(types.maybeNull(types.Date), null),
    updatedAt: types.optional(types.maybeNull(types.Date), null),
    documentFile: types.optional(types.maybeNull(InfoDocumentFileModel), null),
  })
  .actions((self) => ({
    __mergeUpdate(resourceData: Record<string, unknown>) {
      applySnapshot(self, R.mergeDeepLeft(resourceData, getSnapshot(self)) as any)
    },
  }))

export interface IInfoDocument extends Instance<typeof InfoDocumentModel> {}
