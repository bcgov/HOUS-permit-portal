import { GridItem, GridItemProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface ISearchGridItemProps extends GridItemProps {
  children: ReactNode
}

export const SearchGridItem = ({ children, ...rest }: ISearchGridItemProps) => {
  return (
    <GridItem
      p={4}
      display="flex"
      justifyContent="flex-start"
      alignItems="center"
      role="cell"
      color="text.primary"
      fontSize="sm"
      {...rest}
    >
      {children}
    </GridItem>
  )
}
