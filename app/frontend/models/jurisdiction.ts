import { t } from "i18next"
import { Instance, types } from "mobx-state-tree"
import { Descendant } from "slate"
import { withEnvironment } from "../lib/with-environment"
import { EUserSortFields } from "../types/enums"
import { IContact } from "../types/types"
import { toCamelCase } from "../utils/utility-funcitons"
import { UserModel } from "./user"

export const JurisdictionModel = types
  .model("JurisdictionModel", {
    id: types.identifier,
    name: types.string,
    qualifiedName: types.string,
    reverseQualifiedName: types.string,
    localityType: types.string,
    qualifier: types.string,
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
    tableUsers: types.array(types.reference(UserModel)),
  })
  .extend(withEnvironment())
  .views((self) => ({
    getUserSortColumnHeader(field: EUserSortFields) {
      //@ts-ignore
      return t(`user.fields.${toCamelCase(field)}`)
    },
  }))
  .actions((self) => ({
    setTableUsers: (users) => {
      self.tableUsers = users.map((user) => user.id)
    },
  }))

export interface IJurisdiction extends Instance<typeof JurisdictionModel> {}
