import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { Descendant } from "slate"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EUserSortFields } from "../types/enums"
import { IContact, ISort } from "../types/types"
import { UserModel } from "./user"

export const JurisdictionModel = types
  .compose(
    types.model("JurisdictionModel", {
      id: types.identifier,
      name: types.string,
      qualifiedName: types.string,
      reverseQualifiedName: types.string,
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
      tableUsers: types.array(types.safeReference(UserModel)),
      query: types.maybeNull(types.string),
      sort: types.maybeNull(types.frozen<ISort<EUserSortFields>>()),
      currentPage: types.optional(types.number, 1),
      totalPages: types.maybeNull(types.number),
      totalCount: types.maybeNull(types.number),
      countPerPage: types.optional(types.number, 10),
    }),
    createSearchModel<EUserSortFields>("fetchUsers")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    getUserSortColumnHeader(field: EUserSortFields) {
      switch (field) {
        case EUserSortFields.role:
          return t("user.fields.role")
        case EUserSortFields.email:
          return t("user.fields.email")
        case EUserSortFields.name:
          return t("user.fields.name")
        case EUserSortFields.createdAt:
          return t("user.fields.createdAt")
        case EUserSortFields.lastSignIn:
          return t("user.fields.lastSignIn")
      }
    },
  }))
  .actions((self) => ({
    fetchUsers: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchJurisdictionUsers(self.id, {
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        self.rootStore.userStore.setUsers(response.data.data)
        self.tableUsers = cast(response.data.data.map((user) => user.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage

        return true
      }

      return false
    }),
  }))

export interface IJurisdiction extends Instance<typeof JurisdictionModel> {}
