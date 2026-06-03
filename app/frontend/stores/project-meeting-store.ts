import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IProjectMeeting, ProjectMeetingModel } from "../models/project-meeting"
import { EProjectMeetingSortFields } from "../types/enums"
import { TSearchParams } from "../types/types"
import { convertToDate } from "../utils/utility-functions"

const nullableDate = (value: unknown) => (value ? convertToDate(value) : null)

const responseError = (data: unknown, problem: unknown) => {
  return (data as { errors?: unknown } | undefined)?.errors || problem
}

export const ProjectMeetingStoreModel = types
  .compose(
    types.model("ProjectMeetingStore", {
      projectMeetingsMap: types.map(ProjectMeetingModel),
      tableProjectMeetings: types.array(types.reference(ProjectMeetingModel)),
      currentProjectMeeting: types.maybeNull(types.reference(ProjectMeetingModel)),
    }),
    createSearchModel<EProjectMeetingSortFields>("searchProjectMeetings")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views(() => ({
    getProjectMeetingSortColumnHeader(field: EProjectMeetingSortFields) {
      const map = {
        [EProjectMeetingSortFields.submittedAt]: t("permitProject.meetings.columns.submitted_at"),
        [EProjectMeetingSortFields.projectDescription]: t("permitProject.meetings.columns.project_description"),
        [EProjectMeetingSortFields.status]: t("permitProject.meetings.columns.status"),
      }
      return map[field]
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(projectMeeting: Record<string, unknown>) {
      return {
        ...projectMeeting,
        submittedAt: nullableDate(projectMeeting.submittedAt),
        confirmedDate: nullableDate(projectMeeting.confirmedDate),
        scheduledAt: nullableDate(projectMeeting.scheduledAt),
        completedAt: nullableDate(projectMeeting.completedAt),
        closedAt: nullableDate(projectMeeting.closedAt),
        createdAt: nullableDate(projectMeeting.createdAt),
        updatedAt: nullableDate(projectMeeting.updatedAt),
      }
    },
    setCurrentProjectMeeting(projectMeetingId: string | null) {
      self.currentProjectMeeting = projectMeetingId as unknown as typeof self.currentProjectMeeting
    },
    resetCurrentProjectMeeting() {
      self.currentProjectMeeting = null
    },
    setTableProjectMeetings(projectMeetings: IProjectMeeting[]) {
      self.tableProjectMeetings = cast(projectMeetings.map((projectMeeting) => projectMeeting.id))
    },
  }))
  .actions((self) => ({
    searchProjectMeetings: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const currentPermitProjectId = self.rootStore?.permitProjectStore?.currentPermitProject?.id
      if (!currentPermitProjectId) return false

      const searchParams = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
      } as TSearchParams<EProjectMeetingSortFields>

      const response = yield self.environment.api.fetchProjectMeetings(currentPermitProjectId, searchParams)
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "projectMeetingsMap")
        self.setTableProjectMeetings(response.data.data)
        self.setPageFields(response.data.meta, opts)
      }

      return response.ok
    }),
    createProjectMeeting: flow(function* (permitProjectId: string) {
      const response = yield* toGenerator(self.environment.api.createProjectMeeting(permitProjectId))
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
        yield* toGenerator(self.rootStore.permitProjectStore.fetchPermitProject(permitProjectId))
        self.setCurrentProjectMeeting(response.data.data.id)
        return response.data.data as IProjectMeeting
      }
      return null
    }),
    fetchProjectMeeting: flow(function* (permitProjectId: string, id: string) {
      const response = yield* toGenerator(self.environment.api.fetchProjectMeeting(permitProjectId, id))
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
        self.setCurrentProjectMeeting(response.data.data.id)
        return response.data.data as IProjectMeeting
      }
      return null
    }),
    updateProjectMeeting: flow(function* (permitProjectId: string, id: string, params: Record<string, unknown>) {
      const response = yield* toGenerator(self.environment.api.updateProjectMeeting(permitProjectId, id, params))
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
        return { ok: true, data: response.data.data as IProjectMeeting }
      }
      return { ok: false, error: responseError(response.data, response.problem) }
    }),
    submitProjectMeeting: flow(function* (permitProjectId: string, id: string, params: Record<string, unknown> = {}) {
      const response = yield* toGenerator(self.environment.api.submitProjectMeeting(permitProjectId, id, params))
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
        yield* toGenerator(self.rootStore.permitProjectStore.fetchPermitProject(permitProjectId))
        return { ok: true, data: response.data.data as IProjectMeeting }
      }
      return { ok: false, error: responseError(response.data, response.problem) }
    }),
    cancelProjectMeeting: flow(function* (permitProjectId: string, id: string) {
      const response = yield* toGenerator(self.environment.api.cancelProjectMeeting(permitProjectId, id))
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
        yield* toGenerator(self.rootStore.permitProjectStore.fetchPermitProject(permitProjectId))
        return { ok: true, data: response.data.data as IProjectMeeting }
      }
      return { ok: false, error: responseError(response.data, response.problem) }
    }),
    transitionProjectMeetingStatus: flow(function* (
      permitProjectId: string,
      id: string,
      targetStatus: string,
      params: Record<string, unknown> = {}
    ) {
      const response = yield* toGenerator(
        self.environment.api.transitionProjectMeetingStatus(permitProjectId, id, targetStatus, params)
      )
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
        return { ok: true, data: response.data.data as IProjectMeeting }
      }
      return { ok: false, error: responseError(response.data, response.problem) }
    }),
  }))

export type IProjectMeetingStore = Instance<typeof ProjectMeetingStoreModel>
