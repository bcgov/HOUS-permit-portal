import { Grid } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface ISearchGridProps {
  children: ReactNode
  templateColumns: string
}

export const SearchGrid = ({ children, templateColumns }: ISearchGridProps) => {
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
    >
      {children}
    </Grid>
  )
}
