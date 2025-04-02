import { IStateTreeNode } from "mobx-state-tree"
import * as R from "ramda"

declare namespace MSTMixins.WithMerge {
  export interface ModelData {
    id: string | number
  }
}

export const withMerge =
  <T extends MSTMixins.WithMerge.ModelData>() =>
  (self: IStateTreeNode) => ({
    actions: {
      /**
       * Updates existing model with new data or adds new model with data
       *
       * @exmple
       * ```
       * mergeUpdate({ id: 1, ...data }, 'dataMap')
       * ```
       *
       * @param resourceData - Raw model data
       * @param collectionName - The property name of the collection you with to update
       * @typeParam T - Typeof the MST Model
       */
      mergeUpdate(resourceData: T, collectionName: string) {
        let resourceDataToUpdate = resourceData
        if (self["__beforeMergeUpdate"]) {
          resourceDataToUpdate = self["__beforeMergeUpdate"](resourceData)
        }

        const existingResource = self[collectionName].get(resourceData.id) || {}

        /**
         * if the resource requires additional merge logic
         * (e.g. contains a map of models with non-API props),
         * it can define a __mergeUpdate action to correctly merge in the new data.
         * This prevents non-API (e.g. UI/UX) fields on the map model from being overridden
         */
        if (existingResource["__mergeUpdate"]) {
          existingResource["__mergeUpdate"](resourceDataToUpdate)
        } else {
          const newData = R.mergeDeepLeft(resourceDataToUpdate, existingResource)
          self[collectionName].put(newData)
        }
      },
      /**
       * Updates existing model with new data or adds new model with data
       *
       * @exmple
       * ```
       * mergeUpdate([{ id: 1, ...data }], 'dataMap')
       * ```
       *
       * @param resourceData - Raw model data array
       * @param collectionName - The property name of the collection you with to update
       * @typeParam T - Typeof the MST Model
       */
      mergeUpdateAll(resourceData: T[], collectionName: string) {
        if (!resourceData) return

        let resourceDataToUpdate = resourceData
        if (self["__beforeMergeUpdateAll"]) {
          resourceDataToUpdate = self["__beforeMergeUpdateAll"](resourceData)
        }
        resourceDataToUpdate.forEach((data) => {
          this.mergeUpdate(data, collectionName)
        })
      },
    },
  })
