import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { ISearch } from "../lib/create-search-model"
import { useMst } from "../setup/root"
import { ESortDirection } from "../types/enums"
import { parseBoolean } from "../utils/utility-functions"

interface IUseSearchOptions {
  /** Skip URL hydration; reset + fetch for nested drawers/modals. */
  nested?: boolean
}

export const useSearch = (
  searchModel: ISearch,
  dependencyArray: any[] = [],
  { nested = false }: IUseSearchOptions = {}
) => {
  // Reset currents
  const { jurisdictionId } = useParams()
  const { permitApplicationId } = useParams()
  const {
    jurisdictionStore: { resetCurrentJurisdiction },
    permitApplicationStore: { resetCurrentPermitApplication },
  } = useMst()

  useEffect(() => {
    if (!jurisdictionId) resetCurrentJurisdiction()
    if (!permitApplicationId) resetCurrentPermitApplication()
  }, [jurisdictionId, permitApplicationId])

  useEffect(() => {
    // This is necessary for preventing failed calls, IE when the currentJursidiction for user search is undefined
    if (dependencyArray.some((dep) => dep == null)) return

    if (nested) {
      searchModel.resetAll()
      searchModel.fetchData({ reset: true })
      return () => {
        searchModel.resetAll()
      }
    }

    const queryParams = new URLSearchParams(location.search)
    const query = queryParams.get("query")
    const currentPage = queryParams.get("currentPage")
    const countPerPage = queryParams.get("countPerPage")
    const showArchived = queryParams.get("showArchived")
    const sortDirection = queryParams.get("sortDirection") as ESortDirection
    const sortField = queryParams.get("sortField")

    if (query) searchModel.setQuery(decodeURIComponent(query))
    if (currentPage) {
      searchModel.setCurrentPage(parseInt(decodeURIComponent(currentPage)))
    } else {
      searchModel.setCurrentPage(1)
    }
    if (countPerPage) searchModel.setCountPerPage(parseInt(decodeURIComponent(countPerPage)))
    searchModel.setShowArchived(showArchived ? parseBoolean(showArchived) : false)

    if (sortDirection && sortField) {
      searchModel.applySort({ direction: sortDirection, field: sortField })
    } else {
      searchModel.clearSort()
    }

    searchModel.setFilters(queryParams)

    searchModel.fetchData({
      page: searchModel.currentPage,
      countPerPage: searchModel.countPerPage,
    })
  }, [...dependencyArray, nested])
}
