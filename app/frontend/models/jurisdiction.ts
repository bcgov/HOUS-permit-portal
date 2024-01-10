import { Instance, flow, types } from "mobx-state-tree"
import { Descendant } from "slate"
import { withEnvironment } from "../lib/with-environment"
import { IContact } from "../types/types"
import { UserModel } from "./user"

export const JurisdictionModel = types
  .model("JurisdictionModel", {
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
    users: types.array(UserModel),
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .extend(withEnvironment())
  .actions((self) => ({
    fetchUsers: flow(function* () {
      const { ok, data: response } = yield self.environment.api.fetchJurisdictionUsers(self.id)
      if (ok) self.users = response.data
      return ok
    }),
  }))

export interface IJurisdiction extends Instance<typeof JurisdictionModel> {}
