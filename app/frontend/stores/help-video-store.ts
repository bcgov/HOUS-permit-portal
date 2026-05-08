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

export interface IHelpVideoStore extends Instance<typeof HelpVideoStoreModel> {}
