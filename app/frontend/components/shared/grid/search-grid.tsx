import { Grid, GridProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface ISearchGridProps extends Partial<Omit<GridProps, "templateColumns">> {
  children: ReactNode
  templateColumns: string
}

export const SearchGrid = ({ children, templateColumns, ...containerProps }: ISearchGridProps) => {
  return (
    <Grid
      mt={3}
      role={"table"}
      templateColumns={templateColumns}
      w="full"
      maxW={"full"}
      overflow={"auto"}
      sx={{
        borderCollapse: "separate",
        ".requirements-library-grid-row:not(:last-of-type) > div": {
          borderBottom: "1px solid",
          borderColor: "border.light",
        },
      }}
      border={"1px solid"}
      borderColor={"border.light"}
      borderRadius={"sm"}
      {...containerProps}
    >
      {children}
    </Grid>
  )
}
