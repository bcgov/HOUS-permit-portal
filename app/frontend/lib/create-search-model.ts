import { flow, types } from "mobx-state-tree"
import { ESortDirection } from "../types/enums"
import { ISort, TVisibility } from "../types/types"
import { parseBoolean, setQueryParam } from "../utils/utility-functions"

interface IFetchOptions {
  reset?: boolean
  page?: number
  countPerPage?: number
}

export const createSearchModel = <TSortField, TFetchOptions extends IFetchOptions = IFetchOptions>(
  fetchDataActionName: string,
  setFiltersName?: string
) => {
  const model = types
    .model()
    .props({
      query: types.maybeNull(types.string),
      sort: types.maybeNull(types.frozen<ISort<TSortField>>()),
      currentPage: types.optional(types.number, 1),
      showArchived: types.maybeNull(types.boolean),
      visibility: types.maybeNull(types.frozen<TVisibility>()),
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
      setPageFields(metadata, opts?: { page?: number; countPerPage?: number }) {
        self.currentPage = opts?.page ?? metadata.currentPage ?? self.currentPage
        self.totalPages = metadata.totalPages ?? self.totalPages
        self.totalCount = metadata.totalCount ?? self.totalCount
        self.countPerPage = opts?.countPerPage ?? metadata.perPage ?? self.countPerPage
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
      setVisibility(value: TVisibility) {
        setQueryParam("visibility", value)
        self.visibility = value
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
        setQueryParam("sortField", undefined)
        setQueryParam("sortDirection", undefined)
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
        self.currentPage = page
        return yield self.fetchData({ page, ...opts })
      }),
      handleCountPerPageChange: flow(function* (countPerPage: number, opts?: TFetchOptions) {
        setQueryParam("countPerPage", countPerPage.toString())
        self.countPerPage = countPerPage
        return yield self.fetchData({ countPerPage, ...opts })
      }),
      resetAll() {
        self.resetPages()
        self.clearSort()
        self.setQuery(null)
      },
      syncWithUrl() {
        const queryParams = new URLSearchParams(location.search)
        const query = queryParams.get("query")
        const currentPage = queryParams.get("currentPage")
        const countPerPage = queryParams.get("countPerPage")
        const showArchived = queryParams.get("showArchived")
        const visibility = queryParams.get("visibility") as TVisibility
        const sortDirection = queryParams.get("sortDirection") as ESortDirection
        const sortField = queryParams.get("sortField")

        self.query = query ? decodeURIComponent(query) : null

        self.currentPage = currentPage ? parseInt(decodeURIComponent(currentPage)) : 1

        self.countPerPage = countPerPage ? parseInt(decodeURIComponent(countPerPage)) : 10
        self.showArchived = showArchived ? parseBoolean(showArchived) : false
        self.visibility = visibility
        self.sort = sortDirection && sortField ? { direction: sortDirection, field: sortField as TSortField } : null

        self.setFilters(queryParams)
      },
    }))

  return model
}

export interface ISearchable {
  search: (opts?: any) => Promise<any>
}

export interface ISearch {
  query: string | null
  setQuery: (query: string) => void
  search: (opts?: any) => Promise<any>
  showArchived: boolean | null
  setShowArchived: (bool: boolean) => void
  toggleShowArchived: () => Promise<void>
  sort: ISort<any> | null | undefined
  applySort: (sort: ISort<any>) => void
  clearSort: () => void
  toggleSort: (sortField: any, opts?: any) => Promise<any>
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number | null
  totalCount: number | null
  countPerPage: number
  setCountPerPage: (count: number) => void
  handlePageChange: (page: number, opts?: any) => Promise<any>
  handleCountPerPageChange: (count: number, opts?: any) => Promise<any>
  resetAll: () => void
  syncWithUrl: () => void
  isSearching: boolean
}
