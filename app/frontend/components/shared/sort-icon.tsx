import { faSort, faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { ESortDirection } from "../../types/enums"
import { ISort } from "../../types/types"

export function SortIcon<TSortField>({ field, currentSort }: { field: TSortField; currentSort: ISort<TSortField> }) {
  if (currentSort?.field == field) {
    // this column is sorted
    switch (currentSort.direction) {
      case ESortDirection.ascending:
        return <FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faSortUp} />
      case ESortDirection.descending:
        return <FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faSortDown} />
      default:
        return <FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faSortDown} />
    }
  } else {
    return <FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faSort} />
  }
}
