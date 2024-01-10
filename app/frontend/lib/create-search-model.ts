import { flow, Instance, types } from "mobx-state-tree"
import { ESortDirection } from "../types/enums"
import { ISort } from "../types/types"

interface IFetchOptions {
  reset?: boolean
  page?: number
  countPerPage?: number
}

export const createSearchModel = <TSortField, TFetchOptions extends IFetchOptions = IFetchOptions>(
  fetchDataActionName: string
) =>
  types
    .model()
    .props({
      query: types.maybeNull(types.string),
      sort: types.maybeNull(types.frozen<ISort<TSortField>>()),
      currentPage: types.optional(types.number, 1),
      totalPages: types.maybeNull(types.number),
      totalCount: types.maybeNull(types.number),
      countPerPage: types.optional(types.number, 10),
      isSearching: types.optional(types.boolean, false),
    })
    .actions((self) => ({
      resetPages() {
        self.currentPage = 1
        self.totalPages = null
        self.totalCount = null
      },
      setCountPerPage(countPerPage: number) {
        self.countPerPage = countPerPage
      },
      setQuery(query: string) {
        self.query = !!query?.trim() ? query : null
      },
      fetchData: flow(function* (opts?: TFetchOptions) {
        if (fetchDataActionName in self) {
          self.isSearching = true
          const result = yield self[fetchDataActionName](opts)
          self.isSearching = false
          return result
        }
        throw new Error("fetch action must be implemented in the derived model for search to work")
      }),
    }))
    .actions((self) => ({
      search: flow(function* (opts?: TFetchOptions) {
        return yield self.fetchData({ reset: true, ...opts })
      }),
      applySort: flow(function* (sort: ISort<TSortField>, opts?: TFetchOptions) {
        self.sort = sort
        return yield self.fetchData(opts)
      }),
      clearSort: flow(function* (opts?: TFetchOptions) {
        self.sort = null
        return yield self.fetchData(opts)
      }),
    }))
    .actions((self) => ({
      toggleSort: flow(function* (sortField: TSortField, opts?: TFetchOptions) {
        // calculate the next sort state based on current sort
        // descending -> ascending -> unsorted
        if (self.sort && self.sort.field == sortField && self.sort.direction == ESortDirection.ascending) {
          // return to unsorted state
          yield self.clearSort(opts)
        } else {
          // apply the next sort state
          const direction =
            self.sort?.field == sortField && self.sort?.direction == ESortDirection.descending
              ? ESortDirection.ascending
              : ESortDirection.descending
          yield self.applySort({ field: sortField, direction, ...opts })
        }
      }),
      handlePageChange: flow(function* (page: number, opts?: TFetchOptions) {
        return yield self.fetchData({ page, ...opts })
      }),
      handleCountPerPageChange: flow(function* (countPerPage: number, opts?: TFetchOptions) {
        return yield self.fetchData({ countPerPage, ...opts })
      }),
    }))

export interface ISearch extends Instance<ReturnType<typeof createSearchModel>> {}
