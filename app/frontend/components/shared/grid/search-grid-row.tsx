import { Grid, GridProps } from "@chakra-ui/react"
import React, { ReactNode, forwardRef } from "react"

interface ISearchGridRowProps extends GridProps {
  children: ReactNode
  isClickable?: boolean
}

export const SearchGridRow = forwardRef<HTMLDivElement, ISearchGridRowProps>(
  ({ children, isClickable, onClick, ...rest }, ref) => {
    const clickable = isClickable ?? !!onClick

    return (
      <Grid
        ref={ref}
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
)

SearchGridRow.displayName = "SearchGridRow"
