import { GridItemProps } from "@chakra-ui/react"
import React from "react"
import { GridRowHeader } from "../shared/grid/row-header"

export const RowHeader = (props: GridItemProps) => {
  return React.createElement(GridRowHeader, { fontWeight: "bold", justifyContent: "start", ...props })
}
