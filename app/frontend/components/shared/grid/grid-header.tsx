import { GridItem, GridItemProps } from "@chakra-ui/react"
import React from "react"

export const GridHeader = (props: GridItemProps) => {
  return (
    <GridItem
      css={{
        "& button": {
          fontSize: "inherit",
          fontWeight: "inherit",
        },
      }}
      fontSize="16px"
      fontWeight="bold"
      py={5}
      color="text.secondary"
      borderBottom="1px solid"
      borderColor="border.light"
      role="columnheader"
      {...props}
    />
  )
}
