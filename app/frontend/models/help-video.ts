import { Instance, types } from "mobx-state-tree"
import { HelpVideoDocumentModel } from "./help-video-document"

export const HelpVideoModel = types.model("HelpVideoModel", {
  id: types.identifier,
  helpVideoSectionId: types.string,
  title: types.string,
  slug: types.maybeNull(types.string),
  descriptionHtml: types.maybeNull(types.string),
  sortOrder: types.number,
  publishedAt: types.maybeNull(types.Date),
  createdAt: types.optional(types.maybeNull(types.Date), null),
  updatedAt: types.optional(types.maybeNull(types.Date), null),
  videoUrl: types.optional(types.maybeNull(types.string), null),
  captionUrl: types.optional(types.maybeNull(types.string), null),
  transcriptUrl: types.optional(types.maybeNull(types.string), null),
  videoDocument: types.optional(types.maybeNull(HelpVideoDocumentModel), null),
  captionDocument: types.optional(types.maybeNull(HelpVideoDocumentModel), null),
  transcriptDocument: types.optional(types.maybeNull(HelpVideoDocumentModel), null),
})

export interface IHelpVideo extends Instance<typeof HelpVideoModel> {}
