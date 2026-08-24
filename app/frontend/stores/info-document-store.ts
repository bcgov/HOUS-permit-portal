import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { InfoDocumentModel } from "../models/info-document"
import { ETagType } from "../types/enums"

export const InfoDocumentStoreModel = types
  .model("InfoDocumentStore", {
    infoDocumentMap: types.map(InfoDocumentModel),
    isLoadingInfoDocuments: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get infoDocuments() {
      return Array.from(self.infoDocumentMap.values()).sort((a, b) => a.sortOrder - b.sortOrder)
    },

    getInfoDocumentById(id: string) {
      return self.infoDocumentMap.get(id)
    },
  }))
  .actions((self) => ({
    fetchInfoDocuments: flow(function* () {
      self.isLoadingInfoDocuments = true

      try {
        const { ok, data: response } = yield* toGenerator(self.environment.api.fetchInfoDocuments())
        if (ok) {
          self.mergeUpdateAll(response.data, "infoDocumentMap")
        }
        return ok
      } finally {
        self.isLoadingInfoDocuments = false
      }
    }),

    fetchInfoDocument: flow(function* (id: string) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.fetchInfoDocument(id))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "infoDocumentMap")
        return self.getInfoDocumentById(response.data.id)
      }
      return null
    }),

    createInfoDocument: flow(function* (params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.createInfoDocument(params))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "infoDocumentMap")
      }
      return ok ? response.data : null
    }),

    updateInfoDocument: flow(function* (id: string, params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.updateInfoDocument(id, params))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "infoDocumentMap")
      }
      return ok ? response.data : null
    }),

    deleteInfoDocument: flow(function* (id: string) {
      const { ok } = yield* toGenerator(self.environment.api.deleteInfoDocument(id))
      if (ok) {
        self.infoDocumentMap.delete(id)
      }
      return ok
    }),

    publishInfoDocument: flow(function* (id: string) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.publishInfoDocument(id))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "infoDocumentMap")
      }
      return ok
    }),

    unpublishInfoDocument: flow(function* (id: string) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.unpublishInfoDocument(id))
      if (ok && response.data) {
        self.mergeUpdate(response.data, "infoDocumentMap")
      }
      return ok
    }),

    searchTopics: flow(function* (query: string) {
      const response = yield* toGenerator(
        self.environment.api.searchTags({
          query,
          taggableTypes: [ETagType.infoDocument],
        })
      )

      if (response.ok) {
        return response.data
      }

      return []
    }),

    reorderInfoDocuments: flow(function* (orderedIds: string[]) {
      const previousOrders = new Map(
        Array.from(self.infoDocumentMap.values()).map((document) => [document.id, document.sortOrder])
      )
      orderedIds.forEach((id, index) => {
        const document = self.infoDocumentMap.get(id)
        if (document) document.sortOrder = index
      })

      const { ok, data: response } = yield* toGenerator(self.environment.api.reorderInfoDocuments(orderedIds))
      if (ok && response.data) {
        self.mergeUpdateAll(response.data, "infoDocumentMap")
      } else {
        previousOrders.forEach((sortOrder, id) => {
          const document = self.infoDocumentMap.get(id)
          if (document) document.sortOrder = sortOrder
        })
      }
      return ok
    }),
  }))

export interface IInfoDocumentStore extends Instance<typeof InfoDocumentStoreModel> {}
