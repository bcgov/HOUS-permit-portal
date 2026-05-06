import { GridItem, GridItemProps } from "@chakra-ui/react"
import React from "react"

export const GridColumnHeader = (props: GridItemProps) => {
  return React.createElement(GridItem, {
    bg: "greys.grey03",
    py: 2.5,
    px: 4,
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    color: "text.primary",
    fontWeight: "bold",
    fontSize: "sm",
    borderColor: "borders.light",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    ...props,
  })
}
