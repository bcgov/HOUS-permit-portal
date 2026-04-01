import { Grid, GridProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface ISearchGridRowProps extends GridProps {
  children: ReactNode
  isClickable?: boolean
}

export const SearchGridRow = ({ children, isClickable, onClick, ...rest }: ISearchGridRowProps) => {
  const clickable = isClickable ?? !!onClick

  return (
    <Grid
      role="row"
      gridColumn="1 / -1"
      templateColumns="subgrid"
      display="grid"
      onClick={onClick}
      _hover={
        clickable
          ? {
              bg: "greys.grey03",
              cursor: "pointer",
            }
          : undefined
      }
      borderBottom="1px"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
      {...rest}
    >
      {children}
    </Grid>
  )
}
