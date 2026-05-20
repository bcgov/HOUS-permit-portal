import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { HelpVideoModel } from "../models/help-video"
import { HelpVideoSectionModel } from "../models/help-video-section"

export const HelpVideoStoreModel = types
  .model("HelpVideoStore", {
    helpVideoSectionMap: types.map(HelpVideoSectionModel),
    helpVideoMap: types.map(HelpVideoModel),
    currentHelpVideo: types.maybeNull(types.reference(HelpVideoModel)),
    isLoadingHelpVideoSections: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .actions((self) => ({
    __beforeMergeUpdate(sectionOrVideo) {
      if (sectionOrVideo.helpVideos) {
        self.mergeUpdateAll(sectionOrVideo.helpVideos, "helpVideoMap")

        return R.mergeRight(sectionOrVideo, {
          helpVideos: sectionOrVideo.helpVideos.map((video) => video.id),
        })
      }

      return sectionOrVideo
    },
  }))
  .views((self) => ({
    get helpVideoSections() {
      return Array.from(self.helpVideoSectionMap.values()).sort((a, b) => a.sortOrder - b.sortOrder)
    },

    getHelpVideoById(id: string) {
      return self.helpVideoMap.get(id)
    },

    get helpVideos() {
      return Array.from(self.helpVideoMap.values()).sort((a, b) => {
        if (a.helpVideoSectionId === b.helpVideoSectionId) return a.sortOrder - b.sortOrder
        const aSection = self.helpVideoSectionMap.get(a.helpVideoSectionId)
        const bSection = self.helpVideoSectionMap.get(b.helpVideoSectionId)
        return (aSection?.sortOrder ?? 0) - (bSection?.sortOrder ?? 0)
      })
    },

    getVideoCountForSection(sectionId: string) {
      return Array.from(self.helpVideoMap.values()).filter((video) => video.helpVideoSectionId === sectionId).length
    },

    getSectionTitle(sectionId: string) {
      return self.helpVideoSectionMap.get(sectionId)?.title ?? ""
    },
  }))
  .actions((self) => ({
    fetchHelpVideoSections: flow(function* () {
      self.isLoadingHelpVideoSections = true

      try {
        const { ok, data: response } = yield* toGenerator(self.environment.api.fetchHelpVideoSections())

        if (ok) {
          self.mergeUpdateAll(response.data, "helpVideoSectionMap")
        }

        return ok
      } finally {
        self.isLoadingHelpVideoSections = false
      }
    }),

    fetchHelpVideo: flow(function* (id: string) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.fetchHelpVideo(id))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "helpVideoMap")
        const helpVideo = self.getHelpVideoById(response.data.id)
        self.currentHelpVideo = helpVideo
        return helpVideo
      }

      return null
    }),

    setCurrentHelpVideo(id: string) {
      self.currentHelpVideo = self.getHelpVideoById(id)
    },
  }))
  .actions((self) => ({
    createHelpVideoSection: flow(function* (params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.createHelpVideoSection(params))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "helpVideoSectionMap")
        yield self.fetchHelpVideoSections()
      }
      return ok
    }),

    updateHelpVideoSection: flow(function* (id: string, params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.updateHelpVideoSection(id, params))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "helpVideoSectionMap")
        yield self.fetchHelpVideoSections()
      }
      return ok
    }),

    deleteHelpVideoSection: flow(function* (id: string) {
      const { ok } = yield* toGenerator(self.environment.api.deleteHelpVideoSection(id))
      if (ok) {
        self.helpVideoSectionMap.delete(id)
        yield self.fetchHelpVideoSections()
      }
      return ok
    }),

    reorderHelpVideoSections: flow(function* (orderedIds: string[]) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.reorderHelpVideoSections(orderedIds))
      if (ok && response.data) {
        self.mergeUpdateAll(response.data, "helpVideoSectionMap")
      }
      return ok
    }),

    reorderHelpVideosInSection: flow(function* (sectionId: string, orderedIds: string[]) {
      const { ok, data: response } = yield* toGenerator(
        self.environment.api.reorderHelpVideosInSection(sectionId, orderedIds)
      )
      if (ok && response.data) {
        self.mergeUpdate(response.data, "helpVideoSectionMap")
      }
      return ok
    }),

    createHelpVideo: flow(function* (params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.createHelpVideo(params))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "helpVideoMap")
        yield self.fetchHelpVideoSections()
      }
      return ok ? response.data : null
    }),

    updateHelpVideo: flow(function* (id: string, params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.updateHelpVideo(id, params))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "helpVideoMap")
        yield self.fetchHelpVideoSections()
      }
      return ok ? response.data : null
    }),

    deleteHelpVideo: flow(function* (id: string) {
      const { ok } = yield* toGenerator(self.environment.api.deleteHelpVideo(id))
      if (ok) {
        self.helpVideoMap.delete(id)
        yield self.fetchHelpVideoSections()
      }
      return ok
    }),

    publishHelpVideo: flow(function* (id: string) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.publishHelpVideo(id))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "helpVideoMap")
        yield self.fetchHelpVideoSections()
      }
      return ok
    }),

    unpublishHelpVideo: flow(function* (id: string) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.unpublishHelpVideo(id))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "helpVideoMap")
        yield self.fetchHelpVideoSections()
      }
      return ok
    }),
  }))

export interface IHelpVideoStore extends Instance<typeof HelpVideoStoreModel> {}
