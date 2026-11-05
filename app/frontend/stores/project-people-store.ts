import { cast, flow, Instance, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EProjectAccess, EProjectContactDesignation } from "../types/enums"
import { IProjectInvitation, IProjectPerson, TSearchParams } from "../types/types"
import { setQueryParam } from "../utils/utility-functions"

const isProjectAccess = (value: string): value is EProjectAccess =>
  (Object.values(EProjectAccess) as string[]).includes(value)

interface IProjectPeopleFilters {
  access?: EProjectAccess[]
  roleTags?: string[]
}

export const ProjectPeopleStoreModel = types
  .compose(
    types.model("ProjectPeopleStore", {
      tablePeople: types.array(types.frozen<IProjectPerson>()),
      accessFilter: types.optional(types.array(types.string), []),
      roleFilter: types.optional(types.array(types.string), []),
      roleTags: types.optional(types.array(types.string), []),
      primaryContactName: types.maybeNull(types.string),
      alternateContactName: types.maybeNull(types.string),
    }),
    createSearchModel<never>("searchProjectPeople", "setProjectPeopleFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .actions((self) => ({
    setAccessFilter(access: string[]) {
      const values = access.filter(isProjectAccess)
      setQueryParam("access", values)
      self.accessFilter = cast(values)
    },
    setRoleFilter(role: string[]) {
      setQueryParam("role", role)
      self.roleFilter = cast(role)
    },
    setProjectPeopleFilters(queryParams: URLSearchParams) {
      const access = queryParams.get("access")
      const role = queryParams.get("role")
      self.accessFilter = cast(access ? access.split(",").filter(isProjectAccess) : [])
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
        self.primaryContactName = response.data?.meta?.primaryContactName ?? null
        self.alternateContactName = response.data?.meta?.alternateContactName ?? null
        self.setPageFields(response.data.meta, opts)
      }
      return response.ok
    }),
    createProjectPerson: flow(function* (params: {
      firstName: string
      lastName: string
      email: string
      roleTags?: string[]
      contactDesignation?: EProjectContactDesignation
      access?: EProjectAccess
    }) {
      const permitProjectId = self.rootStore.permitProjectStore.currentPermitProject?.id
      if (!permitProjectId) return null

      const response = yield self.environment.api.createPermitProjectMembership(permitProjectId, params)
      if (!response.ok || !response.data?.data) return null

      const created: IProjectPerson = response.data.data
      yield self.search()
      return created
    }),
    reinviteProjectPerson: flow(function* (membershipId: string, email?: string) {
      const permitProjectId = self.rootStore.permitProjectStore.currentPermitProject?.id
      if (!permitProjectId) return null

      const response = yield self.environment.api.reinvitePermitProjectMembership(permitProjectId, membershipId, email)
      if (!response.ok || !response.data?.data) return null

      const updated: IProjectPerson = response.data.data
      yield self.search()
      return updated
    }),
    updateProjectPerson: flow(function* (
      membershipId: string,
      params: {
        roleTags?: string[]
        contactDesignation?: EProjectContactDesignation
        access?: EProjectAccess
      }
    ) {
      const permitProjectId = self.rootStore.permitProjectStore.currentPermitProject?.id
      if (!permitProjectId) return null

      const response = yield self.environment.api.updatePermitProjectMembership(permitProjectId, membershipId, params)
      if (!response.ok || !response.data?.data) return null

      const updated: IProjectPerson = response.data.data
      yield self.search()
      if (!self.tablePeople.some((person) => person.id === updated.id)) return null

      self.tablePeople = cast(self.tablePeople.map((person) => (person.id === updated.id ? updated : person)))
      return updated
    }),
    destroyProjectPerson: flow(function* (membershipId: string) {
      const permitProjectId = self.rootStore.permitProjectStore.currentPermitProject?.id
      if (!permitProjectId) return false

      const response = yield self.environment.api.destroyPermitProjectMembership(permitProjectId, membershipId)
      if (!response.ok) return false

      yield self.search()
      self.tablePeople = cast(self.tablePeople.filter((person) => person.id !== membershipId))
      return true
    }),
    fetchProjectInvitation: flow(function* (token: string) {
      const response = yield self.environment.api.fetchProjectInvitation(token)
      if (!response.ok || !response.data?.data) return null

      return response.data.data as IProjectInvitation
    }),
    acceptProjectInvitation: flow(function* (token: string) {
      const response = yield self.environment.api.acceptProjectInvitation(token)
      if (!response.ok || !response.data?.data) return null

      return response.data.data as { permitProjectId: string; projectTitle: string }
    }),
    declineProjectInvitation: flow(function* (token: string) {
      const response = yield self.environment.api.declineProjectInvitation(token)
      if (!response.ok || !response.data?.data) return null

      return response.data.data as { projectTitle: string }
    }),
    resetFilters() {
      self.setQuery("")
      self.setAccessFilter([])
      self.setRoleFilter([])
      self.search()
    },
  }))

export interface IProjectPeopleStore extends Instance<typeof ProjectPeopleStoreModel> {}
