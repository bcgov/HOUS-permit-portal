import { cast, flow, Instance, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IProjectPerson } from "../types/api-responses"
import { TSearchParams } from "../types/types"
import { setQueryParam } from "../utils/utility-functions"

interface IProjectPeopleFilters {
  access?: string[]
  roleTags?: string[]
}

export const ProjectPeopleStoreModel = types
  .compose(
    types.model("ProjectPeopleStore", {
      tablePeople: types.array(types.frozen<IProjectPerson>()),
      accessFilter: types.optional(types.array(types.string), []),
      roleFilter: types.optional(types.array(types.string), []),
      roleTags: types.optional(types.array(types.string), []),
    }),
    createSearchModel<never>("searchProjectPeople", "setProjectPeopleFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .actions((self) => ({
    setAccessFilter(access: string[]) {
      setQueryParam("access", access)
      self.accessFilter = cast(access)
    },
    setRoleFilter(role: string[]) {
      setQueryParam("role", role)
      self.roleFilter = cast(role)
    },
    setProjectPeopleFilters(queryParams: URLSearchParams) {
      const access = queryParams.get("access")
      const role = queryParams.get("role")
      self.accessFilter = cast(access ? access.split(",").filter(Boolean) : [])
      self.roleFilter = cast(role ? role.split(",").filter(Boolean) : [])
    },
  }))
  .actions((self) => ({
    searchProjectPeople: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const permitProjectId = self.rootStore.permitProjectStore.currentPermitProject?.id
      if (!permitProjectId) return false

      const searchParams = {
        query: self.query,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
        filters: {
          access: self.accessFilter.slice(),
          roleTags: self.roleFilter.slice(),
        },
      } as TSearchParams<never, IProjectPeopleFilters>

      const response = yield self.environment.api.fetchPermitProjectMemberships(permitProjectId, searchParams)
      if (response.ok) {
        self.tablePeople = cast(response.data?.data ?? [])
        self.roleTags = cast(response.data?.meta?.roleTags ?? [])
        self.setPageFields(response.data.meta, opts)
      }
      return response.ok
    }),
    resetFilters() {
      self.setQuery("")
      self.setAccessFilter([])
      self.setRoleFilter([])
      self.search()
    },
  }))

export interface IProjectPeopleStore extends Instance<typeof ProjectPeopleStoreModel> {}
