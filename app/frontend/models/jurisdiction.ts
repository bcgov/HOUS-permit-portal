import { Instance, types } from "mobx-state-tree"
import { Descendant } from "slate"
import { IContact } from "../types/types"

export const JurisdictionModel = types.model("JurisdictionModel", {
  id: types.identifier,
  name: types.string,
  qualifiedName: types.string,
  reviewManagersSize: types.number,
  reviewersSize: types.number,
  permitApplicationsSize: types.number,
  description: types.maybeNull(types.string),
  // JSONB data type can be represented as a frozen type
  checklistSlateData: types.maybeNull(types.frozen<Descendant[]>()),
  lookOutSlateData: types.maybeNull(types.frozen<Descendant[]>()),
  contacts: types.array(types.frozen<IContact>()),
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IJurisdiction extends Instance<typeof JurisdictionModel> {}
