import { applySnapshot, getSnapshot, Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { IHelpVideoNavigationNeighbor } from "../types/types"
import { HelpVideoDocumentModel } from "./help-video-document"

export const HelpVideoModel = types
  .model("HelpVideoModel", {
    id: types.identifier,
    helpVideoSectionId: types.string,
    title: types.string,
    slug: types.maybeNull(types.string),
    description: types.maybeNull(types.string),
    aboutHtml: types.maybeNull(types.string),
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
    previousHelpVideo: types.optional(types.maybeNull(types.frozen<IHelpVideoNavigationNeighbor>()), null),
    nextHelpVideo: types.optional(types.maybeNull(types.frozen<IHelpVideoNavigationNeighbor>()), null),
  })
  .actions((self) => ({
    __mergeUpdate(resourceData: Record<string, unknown>) {
      const withNeighborDefaults = {
        previousHelpVideo: null,
        nextHelpVideo: null,
        ...resourceData,
      }
      applySnapshot(self, R.mergeDeepLeft(withNeighborDefaults, getSnapshot(self)) as any)
    },
  }))

export interface IHelpVideo extends Instance<typeof HelpVideoModel> {}
