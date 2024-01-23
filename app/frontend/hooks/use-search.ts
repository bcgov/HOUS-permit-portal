import { useEffect } from "react"
import { ISearch } from "../lib/create-search-model"

export const useSearch = (searchModel: ISearch) => {
  useEffect(() => {
    if (!searchModel) return

    const queryParams = new URLSearchParams(location.search)
    const query = queryParams.get("query")
    const currentPage = queryParams.get("currentPage")
    const countPerPage = queryParams.get("countPerPage")
    const sort = queryParams.get("sort")

    if (query) searchModel.setQuery(decodeURIComponent(query))
    if (currentPage) searchModel.setCurrentPage(parseInt(decodeURIComponent(currentPage)))
    if (countPerPage) searchModel.setCountPerPage(parseInt(decodeURIComponent(countPerPage)))
    if (sort) searchModel.applySort(JSON.parse(decodeURIComponent(sort)))

    searchModel.fetchData({
      page: searchModel.currentPage,
      countPerPage: searchModel.countPerPage,
    })
  }, [searchModel])
}
