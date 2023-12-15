import { Instance, types } from "mobx-state-tree"
import { IContact } from "../types/types"

export const JurisdictionModel = types.model("JurisdictionModel", {
  id: types.identifier,
  name: types.string,
  description: types.maybeNull(types.string),
  // JSONB data type can be represented as a frozen type
  checklistSlateData: types.maybeNull(types.frozen()),
  contacts: types.array(types.frozen<IContact>()),
  lookOutSlateData: types.maybeNull(types.frozen()),
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IJurisdiction extends Instance<typeof JurisdictionModel> {}
