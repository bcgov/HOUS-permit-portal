import { Instance, types } from "mobx-state-tree"

export const InfoDocumentFileModel = types.model("InfoDocumentFileModel", {
  id: types.identifier,
  scanStatus: types.maybeNull(types.string),
  infoDocumentId: types.maybeNull(types.string),
  file: types.maybeNull(types.frozen()),
  fileUrl: types.optional(types.maybeNull(types.string), null),
  downloadUrl: types.optional(types.maybeNull(types.string), null),
})

export interface IInfoDocumentFile extends Instance<typeof InfoDocumentFileModel> {}
