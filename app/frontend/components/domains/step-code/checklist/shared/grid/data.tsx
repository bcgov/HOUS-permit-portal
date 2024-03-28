import { GridItem, GridItemProps } from "@chakra-ui/react"
import React from "react"

export function GridData({ children, ...rest }: GridItemProps) {
  return (
    <GridItem
      display="flex"
      flexDirection="column"
      alignItems="start"
      justifyContent="start"
      h="100%"
      py={2.5}
      px={4}
      borderColor="borders.light"
      borderTopWidth={1}
      borderLeftWidth={1}
      {...rest}
    >
      {children}
    </GridItem>
  )
}
