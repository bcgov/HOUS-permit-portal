import { Instance, types } from "mobx-state-tree"
import { IFileData } from "../types/types"

const ExplainerDocumentModel = types.model("ExplainerDocumentModel", {
  id: types.identifier,
  scanStatus: types.maybeNull(types.string),
  file: types.maybeNull(types.frozen<IFileData>()),
  fileUrl: types.maybeNull(types.string),
  downloadUrl: types.maybeNull(types.string),
})

export const ExplainerModel = types.model("ExplainerModel", {
  id: types.identifier,
  introductionHtml: types.optional(types.string, ""),
  beforeYouApplyHtml: types.optional(types.string, ""),
  steps: types.optional(types.array(types.frozen<{ title: string; description: string }>()), []),
  links: types.optional(types.array(types.frozen<{ title: string; url: string }>()), []),
  relatedTemplateIds: types.optional(types.array(types.string), []),
  publishedAt: types.maybeNull(types.Date),
  updatedAt: types.maybeNull(types.Date),
  documents: types.optional(types.array(ExplainerDocumentModel), []),
})

export interface IExplainer extends Instance<typeof ExplainerModel> {}
