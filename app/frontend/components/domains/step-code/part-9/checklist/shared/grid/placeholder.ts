import { GridItem, GridItemProps } from "@chakra-ui/react"
import React from "react"

export const GridPlaceholder = (props: GridItemProps) => {
  return React.createElement(GridItem, {
    bg: "greys.grey04",
    borderTopWidth: 1,
    borderColor: "borders.light",
    ...props,
  })
}
