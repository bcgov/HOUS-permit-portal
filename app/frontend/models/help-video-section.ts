import { Instance, types } from "mobx-state-tree"
import { HelpVideoModel } from "./help-video"

export const HelpVideoSectionModel = types.model("HelpVideoSectionModel", {
  id: types.identifier,
  title: types.string,
  description: types.maybeNull(types.string),
  sortOrder: types.number,
  helpVideos: types.optional(types.array(types.safeReference(HelpVideoModel)), []),
})

export interface IHelpVideoSection extends Instance<typeof HelpVideoSectionModel> {}
