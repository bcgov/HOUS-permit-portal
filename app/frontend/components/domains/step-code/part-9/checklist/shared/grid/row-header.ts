import { GridItem, GridItemProps } from "@chakra-ui/react"
import React from "react"

export const GridRowHeader = (props: GridItemProps) => {
  return React.createElement(GridItem, {
    py: 2.5,
    px: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "center",
    borderColor: "borders.light",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    ...props,
  })
}
