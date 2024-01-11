import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IJurisdiction, JurisdictionModel } from "../models/jurisdiction"
import { EJurisdictionSortFields } from "../types/enums"
import { ISort } from "../types/types"

export const JurisdictionStoreModel = types
  .compose(
    types.model("JurisdictionStore").props({
      jurisdictionMap: types.map(JurisdictionModel),
      tableJurisdictions: types.array(types.safeReference(JurisdictionModel)),
      currentJurisdiction: types.maybe(types.reference(types.late(() => JurisdictionModel))),
      sort: types.maybeNull(types.frozen<ISort<EJurisdictionSortFields>>()),
    }),
    createSearchModel<EJurisdictionSortFields>("fetchJurisdictions")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    // View to get a Jurisdiction by id
    getJurisdictionById(id: string) {
      return self.jurisdictionMap.get(id)
    },
    // View to get all jurisdictions as an array
    get jurisdictions() {
      return Array.from(self.jurisdictionMap.values())
    },
    getSortColumnHeader(field: EJurisdictionSortFields) {
      switch (field) {
        case EJurisdictionSortFields.reverseQualifiedName:
          return t("jurisdiction.fields.reverse_qualified_name")
        case EJurisdictionSortFields.reviewManagersSize:
          return t("jurisdiction.fields.review_managers_size")
        case EJurisdictionSortFields.reviewersSize:
          return t("jurisdiction.fields.reviewers_size")
        case EJurisdictionSortFields.permitApplicationsSize:
          return t("jurisdiction.fields.permit_applications_size")
        case EJurisdictionSortFields.templatesUsed:
          return t("jurisdiction.fields.templates_used")
      }
    },
  }))
  .actions((self) => ({
    // Action to add a new Jurisdiction
    addJurisdiction(jurisdiction: IJurisdiction) {
      self.jurisdictionMap.put(jurisdiction)
    },
    // Action to remove a Jurisdiction
    removeJurisdiction(id: string) {
      self.jurisdictionMap.delete(id)
    },
    // Example of an asynchronous action to fetch jurisdictions from an API
    fetchJurisdictions: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      // const { ok, data: response } = yield self.environment.api.fetchJurisdictions()
      // if (ok) R.map((j) => self.jurisdictionMap.put(j), response.data)
      // return ok

      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchJurisdictions({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        R.map((jurisdiction) => self.jurisdictionMap.put(jurisdiction), response.data.data)
        self.tableJurisdictions = cast(response.data.data.map((jurisdiction) => jurisdiction.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage

        return true
      }

      return false
    }),
    fetchJurisdiction: flow(function* (id: string) {
      let jurisdiction = self.getJurisdictionById(id)
      if (!jurisdiction) {
        // Jurisdiction not found in the map, fetch from API
        const { ok, data: response } = yield self.environment.api.fetchJurisdiction(id)
        if (ok && response.data) {
          jurisdiction = JurisdictionModel.create(response.data)
          self.jurisdictionMap.put(jurisdiction)
        }
      }
      return jurisdiction
    }),
    setCurrentJurisdiction(jurisdictionId) {
      self.currentJurisdiction = jurisdictionId
    },
  }))

export interface IJurisdictionStore extends Instance<typeof JurisdictionStoreModel> {}
