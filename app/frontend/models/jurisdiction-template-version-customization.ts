import { Instance, types } from "mobx-state-tree"
import { ITemplateCustomization } from "../types/types"

export const JurisdictionTemplateVersionCustomizationModel = types
  .model("JurisdictionTemplateVersionCustomizationModel")
  .props({
    // this needs to be string as the JurisdictionTemplateVersionCustomizationModel is needs to be stored in
    // a map where the key is not it's own id
    id: types.string,
    jurisdictionId: types.string,
    customizations: types.frozen<ITemplateCustomization>({}),
  })

export interface IJurisdictionTemplateVersionCustomization
  extends Instance<typeof JurisdictionTemplateVersionCustomizationModel> {}
