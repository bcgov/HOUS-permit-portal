import { t } from "i18next"
import { Instance, applySnapshot, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { EUserSortFields } from "../types/enums"
import { IContact, TLatLngTuple } from "../types/types"
import { toCamelCase } from "../utils/utility-functions"
import { PermitApplicationModel } from "./permit-application"
import { UserModel } from "./user"

export const JurisdictionModel = types
  .model("JurisdictionModel", {
    id: types.identifier,
    name: types.string,
    submissionEmail: types.maybeNull(types.string),
    qualifiedName: types.string,
    reverseQualifiedName: types.string,
    localityType: types.string,
    qualifier: types.string,
    reviewManagersSize: types.number,
    reviewersSize: types.number,
    permitApplicationsSize: types.number,
    descriptionHtml: types.maybeNull(types.string),
    checklistHtml: types.maybeNull(types.string),
    lookOutHtml: types.maybeNull(types.string),
    contactSummaryHtml: types.maybeNull(types.string),
    contacts: types.array(types.frozen<IContact>()),
    createdAt: types.Date,
    updatedAt: types.Date,
    tableUsers: types.array(types.reference(UserModel)),
    tablePermitApplications: types.array(types.reference(PermitApplicationModel)),
    boundryPoints: types.optional(types.array(types.frozen<TLatLngTuple>()), []),
    mapPosition: types.frozen<TLatLngTuple>(),
  })
  .extend(withEnvironment())
  .views((self) => ({
    getUserSortColumnHeader(field: EUserSortFields) {
      //@ts-ignore
      return t(`user.fields.${toCamelCase(field)}`)
    },
    get primaryContact() {
      if (self.contacts.length === 0) return null
      if (self.contacts.length === 1) return self.contacts[0]

      const sortByCreatedAt = R.sort<IContact>((a, b) => (a.createdAt as number) - (b.createdAt as number))

      return sortByCreatedAt(self.contacts)[0]
    },
  }))
  .actions((self) => ({
    setTableUsers: (users) => {
      self.tableUsers = users.map((user) => user.id)
    },
    setTablePermitApplications: (permitApplications) => {
      self.tablePermitApplications = permitApplications.map((pa) => pa.id)
    },
    update: flow(function* (params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.updateJurisdiction(self.id, params))
      if (ok) {
        applySnapshot(self, response.data)
      }
      return ok
    }),
  }))

export interface IJurisdiction extends Instance<typeof JurisdictionModel> {}
