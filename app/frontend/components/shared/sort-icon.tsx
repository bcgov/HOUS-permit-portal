import { CaretDown, CaretUp, CaretUpDown, IconProps } from "@phosphor-icons/react"
import React from "react"
import { ESortDirection } from "../../types/enums"
import { ISort } from "../../types/types"

export function SortIcon<TSortField>({
  field,
  currentSort,
  ...rest
}: {
  field: TSortField
  currentSort: ISort<TSortField>
} & IconProps) {
  if (currentSort?.field == field) {
    // this column is sorted
    switch (currentSort.direction) {
      case ESortDirection.ascending:
        return <CaretUp size={16} {...rest} />
      case ESortDirection.descending:
        return <CaretDown size={16} {...rest} />
      default:
        return <CaretDown size={16} {...rest} />
    }
  } else {
    return <CaretUpDown size={16} {...rest} />
  }
}
