import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IProjectMeeting, ProjectMeetingModel } from "../models/project-meeting"
import { convertToDate } from "../utils/utility-functions"

const nullableDate = (value: any) => (value ? convertToDate(value) : null)

export const ProjectMeetingStoreModel = types
  .model("ProjectMeetingStore", {
    projectMeetingsMap: types.map(ProjectMeetingModel),
    currentProjectMeeting: types.maybeNull(types.reference(ProjectMeetingModel)),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .actions((self) => ({
    __beforeMergeUpdate(projectMeeting: any) {
      return {
        ...projectMeeting,
        submittedAt: nullableDate(projectMeeting.submittedAt),
        confirmedDate: nullableDate(projectMeeting.confirmedDate),
        createdAt: nullableDate(projectMeeting.createdAt),
        updatedAt: nullableDate(projectMeeting.updatedAt),
      }
    },
    setCurrentProjectMeeting(projectMeetingId: string | null) {
      self.currentProjectMeeting = projectMeetingId as any
    },
    resetCurrentProjectMeeting() {
      self.currentProjectMeeting = null
    },
  }))
  .actions((self) => ({
    createProjectMeeting: flow(function* (permitProjectId: string) {
      const response = yield* toGenerator(self.environment.api.createProjectMeeting(permitProjectId))
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
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
    updateProjectMeeting: flow(function* (permitProjectId: string, id: string, params: Record<string, any>) {
      const response = yield* toGenerator(self.environment.api.updateProjectMeeting(permitProjectId, id, params))
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
        return { ok: true, data: response.data.data as IProjectMeeting }
      }
      return { ok: false, error: response.data?.errors || response.problem }
    }),
    submitProjectMeeting: flow(function* (permitProjectId: string, id: string, params: Record<string, any> = {}) {
      const response = yield* toGenerator(self.environment.api.submitProjectMeeting(permitProjectId, id, params))
      if (response.ok) {
        self.mergeUpdate(response.data.data, "projectMeetingsMap")
        return { ok: true, data: response.data.data as IProjectMeeting }
      }
      return { ok: false, error: response.data?.errors || response.problem }
    }),
  }))

export interface IProjectMeetingStore extends Instance<typeof ProjectMeetingStoreModel> {}
