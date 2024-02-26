import { Instance, types } from "mobx-state-tree"
import { ETemplateVerionStatus } from "../types/enums"
import { IDenormalizedTemplate } from "../types/types"

export const TemplateVersionModel = types.model("TemplateVersionModel").props({
  id: types.identifier,
  status: types.enumeration(Object.values(ETemplateVerionStatus)),
  versionDate: types.Date,
  denormalizedTemplateJson: types.maybeNull(types.frozen<IDenormalizedTemplate>()),
  isFullyLoaded: types.optional(types.boolean, false),
})

export interface ITemplateVersion extends Instance<typeof TemplateVersionModel> {}
