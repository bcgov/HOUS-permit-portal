import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { TCreateJurisdictionFormData } from "../components/domains/jurisdictions/new-jurisdiction-screen"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IJurisdiction, JurisdictionModel } from "../models/jurisdiction"
import { EJurisdictionSortFields } from "../types/enums"
import { IJurisdictionFilters, ISort } from "../types/types"
import { isUUID, toCamelCase } from "../utils/utility-functions"

export const JurisdictionStoreModel = types
  .compose(
    types.model("JurisdictionStore").props({
      jurisdictionMap: types.map(JurisdictionModel),
      tableJurisdictions: types.array(types.safeReference(JurisdictionModel)),
      currentJurisdiction: types.maybeNull(types.maybe(types.reference(JurisdictionModel))),
      sort: types.maybeNull(types.frozen<ISort<EJurisdictionSortFields>>()),
    }),
    createSearchModel<EJurisdictionSortFields>("searchJurisdictions")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EJurisdictionSortFields) {
      //@ts-ignore
      return t(`jurisdiction.fields.${toCamelCase(field)}`)
    },
    // View to get a Jurisdiction by id or slug
    getJurisdictionById(id: string) {
      if (!isUUID(id)) {
        Array.from(self.jurisdictionMap.values()).find((j) => j.slug == id)
      }

      return self.jurisdictionMap.get(id)
    },
    // View to get all jurisdictions as an array
    get jurisdictions() {
      return Array.from(self.jurisdictionMap.values())
    },
    get regionalDistrictLocalityType() {
      return "regional district"
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
    createJurisdiction: flow(function* (formData: TCreateJurisdictionFormData) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.createJurisdiction(formData))

      if (ok) {
        self.jurisdictionMap.put(response.data)
        return response.data
      }
    }),
    searchJurisdictions: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.searchJurisdictions({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "jurisdictionMap")
        self.tableJurisdictions = cast(response.data.data.map((jurisdiction) => jurisdiction.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
      }
      return response.ok
    }),
    fetchJurisdiction: flow(function* (id: string) {
      let jurisdiction = self.getJurisdictionById(id)
      if (!jurisdiction) {
        // Jurisdiction not found in the map, fetch from API
        const { ok, data: response } = yield self.environment.api.fetchJurisdiction(id)
        if (ok && response.data) {
          jurisdiction = response.data
          self.mergeUpdate(response.data, "jurisdictionMap")
        }
      }
      return jurisdiction
    }),
    fetchLocalityTypeOptions: flow(function* () {
      // Jurisdiction not found in the map, fetch from API
      const { ok, data: response } = yield self.environment.api.fetchLocalityTypeOptions()
      return response.data
    }),
    fetchJurisdictionOptions: flow(function* (filters: IJurisdictionFilters) {
      // Jurisdiction not found in the map, fetch from API
      const { ok, data: response } = yield self.environment.api.fetchJurisdictionOptions(filters)
      return response.data
    }),
    setCurrentJurisdiction(jurisdictionId) {
      self.currentJurisdiction = jurisdictionId
    },
    resetCurrentJurisdiction() {
      self.currentJurisdiction = null
    },
    setCurrentJurisdictionBySlug(slug) {
      const j = self.jurisdictions.find((j) => j.slug == slug)
      self.currentJurisdiction = j?.id
      return j?.id
    },
  }))

export interface IJurisdictionStore extends Instance<typeof JurisdictionStoreModel> {}
