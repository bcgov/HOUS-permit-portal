import { useEffect } from "react"
import { ISearch, TFilterableStatus } from "../lib/create-search-model"
import { ESortDirection } from "../types/enums"
import { parseBoolean } from "../utils/utility-functions"

export const useSearch = (searchModel: ISearch, dependencyArray: any[] = []) => {
  useEffect(() => {
    // This is necessary for preventing failed calls, IE when the currentJursidiction for user search is undefined

    if (dependencyArray.some((dep) => dep == null)) return

    const queryParams = new URLSearchParams(location.search)
    const query = queryParams.get("query")
    const currentPage = queryParams.get("currentPage")
    const countPerPage = queryParams.get("countPerPage")
    const showArchived = queryParams.get("showArchived")
    const statusFilter = queryParams.get("statusFilter") as TFilterableStatus
    const sortDirection = queryParams.get("sortDirection") as ESortDirection
    const sortField = queryParams.get("sortField")

    if (query) searchModel.setQuery(decodeURIComponent(query))
    if (currentPage) searchModel.setCurrentPage(parseInt(decodeURIComponent(currentPage)))
    if (countPerPage) searchModel.setCountPerPage(parseInt(decodeURIComponent(countPerPage)))
    if (showArchived) searchModel.setShowArchived(parseBoolean(showArchived))
    if (statusFilter) searchModel.setStatusFilter(statusFilter)
    if (sortDirection && sortField) {
      searchModel.applySort({ direction: sortDirection, field: sortField })
    } else {
      searchModel.clearSort()
    }
    searchModel.fetchData({
      page: searchModel.currentPage,
      countPerPage: searchModel.countPerPage,
    })
  }, dependencyArray)
}
