import { CaretDown, CaretUp, CaretUpDown } from "@phosphor-icons/react"
import React from "react"
import { ESortDirection } from "../../types/enums"
import { ISort } from "../../types/types"

export function SortIcon<TSortField>({ field, currentSort }: { field: TSortField; currentSort: ISort<TSortField> }) {
  if (currentSort?.field == field) {
    // this column is sorted
    switch (currentSort.direction) {
      case ESortDirection.ascending:
        return <CaretUp size={16} />
      case ESortDirection.descending:
        return <CaretDown size={16} />
      default:
        return <CaretDown size={16} />
    }
  } else {
    return <CaretUpDown size={16} />
  }
}
