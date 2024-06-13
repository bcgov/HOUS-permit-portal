import { flow, Instance, types } from "mobx-state-tree"
import { ESortDirection } from "../types/enums"
import { ISort } from "../types/types"
import { setQueryParam } from "../utils/utility-functions"

interface IFetchOptions {
  reset?: boolean
  page?: number
  countPerPage?: number
}

export const createSearchModel = <TSortField, TFetchOptions extends IFetchOptions = IFetchOptions>(
  fetchDataActionName: string,
  setFiltersName: string
) =>
  types
    .model()
    .props({
      query: types.maybeNull(types.string),
      sort: types.maybeNull(types.frozen<ISort<TSortField>>()),
      currentPage: types.optional(types.number, 1),
      showArchived: types.optional(types.boolean, false),
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
        setQueryParam("currentPage", "1")
      },
      setCountPerPage(countPerPage: number) {
        setQueryParam("countPerPage", countPerPage.toString())
        self.countPerPage = countPerPage
      },
      setCurrentPage(currentPage: number) {
        setQueryParam("currentPage", currentPage.toString())
        self.currentPage = currentPage
      },
      setQuery(query: string) {
        setQueryParam("query", query)
        self.query = !!query?.trim() ? query : null
      },
      setShowArchived(bool) {
        setQueryParam("showArchived", bool.toString())
        self.showArchived = bool
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
      setFilters: (queryParams: URLSearchParams) => {
        if (setFiltersName in self) {
          return self[setFiltersName](queryParams)
        }
        throw new Error("set filters must be implemented in the derived model for filters to work")
      },
    }))
    .actions((self) => ({
      search: flow(function* (opts?: TFetchOptions) {
        return yield self.fetchData({ reset: true, ...opts })
      }),
      applySort(sort: ISort<TSortField>) {
        setQueryParam("sortDirection", sort.direction)
        setQueryParam("sortField", sort.field as string)
        self.sort = sort
      },
      clearSort() {
        setQueryParam("sort", undefined)
        self.sort = null
      },
    }))
    .actions((self) => ({
      toggleSort: flow(function* (sortField: TSortField, opts?: TFetchOptions) {
        // calculate the next sort state based on current sort
        // descending -> ascending -> unsorted
        if (self.sort && self.sort.field == sortField && self.sort.direction == ESortDirection.ascending) {
          // return to unsorted state
          self.clearSort()
        } else {
          // apply the next sort state
          const direction =
            self.sort?.field == sortField && self.sort?.direction == ESortDirection.descending
              ? ESortDirection.ascending
              : ESortDirection.descending
          self.applySort({ field: sortField, direction, ...opts })
        }
        yield self.fetchData(opts)
      }),
      toggleShowArchived: flow(function* () {
        self.setShowArchived(!self.showArchived)
      }),
      handlePageChange: flow(function* (page: number, opts?: TFetchOptions) {
        setQueryParam("currentPage", page.toString())
        return yield self.fetchData({ page, ...opts })
      }),
      handleCountPerPageChange: flow(function* (countPerPage: number, opts?: TFetchOptions) {
        setQueryParam("countPerPage", countPerPage.toString())
        return yield self.fetchData({ countPerPage, ...opts })
      }),
      resetAll() {
        self.resetPages()
        self.applySort(null)
        self.setQuery(null)
      },
    }))

export interface ISearch extends Instance<ReturnType<typeof createSearchModel>> {}
