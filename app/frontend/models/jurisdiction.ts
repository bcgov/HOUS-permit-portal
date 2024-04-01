import { t } from "i18next"
import { Instance, applySnapshot, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EUserSortFields } from "../types/enums"
import { IContact, IPermitTypeSubmissionContact, TLatLngTuple } from "../types/types"
import { toCamelCase } from "../utils/utility-functions"
import { PermitApplicationModel } from "./permit-application"
import { UserModel } from "./user"

export const JurisdictionModel = types
  .model("JurisdictionModel", {
    id: types.identifier,
    slug: types.string,
    name: types.string,
    submissionEmail: types.maybeNull(types.string),
    qualifiedName: types.string,
    reverseQualifiedName: types.string,
    regionalDistrictName: types.maybeNull(types.string),
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
    permitTypeSubmissionContacts: types.array(types.frozen<IPermitTypeSubmissionContact>()),
    createdAt: types.Date,
    updatedAt: types.Date,
    tableUsers: types.array(types.reference(UserModel)),
    tablePermitApplications: types.array(types.reference(PermitApplicationModel)),
    boundryPoints: types.optional(types.array(types.frozen<TLatLngTuple>()), []),
    mapPosition: types.frozen<TLatLngTuple>(),
    mapZoom: types.maybeNull(types.number),
    energyStepRequired: types.maybeNull(types.number),
    zeroCarbonStepRequired: types.maybeNull(types.number),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
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
    getPermitTypeSubmissionContact(id: string): IPermitTypeSubmissionContact {
      return self.permitTypeSubmissionContacts.find((c) => c.id == id)
    },
    get isSubmissionContactSetupComplete() {
      const permitTypes = self.rootStore.permitClassificationStore.permitTypes

      const hasValidContactForAllPermitTypes = permitTypes.every((permitType) => {
        //   checks if there is at least one confirmed email for each permit type
        return self.permitTypeSubmissionContacts.some(
          (c) => c.permitTypeId == permitType.id && c.email && c.confirmedAt
        )
      })

      return hasValidContactForAllPermitTypes
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
