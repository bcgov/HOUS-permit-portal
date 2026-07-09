import { Instance, types } from "mobx-state-tree"

export const HelpVideoDocumentModel = types.model("HelpVideoDocumentModel", {
  id: types.identifier,
  type: types.string,
  scanStatus: types.maybeNull(types.string),
  helpVideoId: types.maybeNull(types.string),
  file: types.maybeNull(types.frozen()),
})

export interface IHelpVideoDocument extends Instance<typeof HelpVideoDocumentModel> {}
