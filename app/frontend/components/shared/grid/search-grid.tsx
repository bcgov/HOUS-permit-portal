import { Grid, GridProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface ISearchGridProps extends Partial<Omit<GridProps, "templateColumns">> {
  children: ReactNode
  templateColumns: string
  gridRowClassName?: string
}

export const SearchGrid = ({
  sx,
  children,
  templateColumns,
  gridRowClassName,
  ...containerProps
}: ISearchGridProps) => {
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
        ...(gridRowClassName
          ? {
              [`.${gridRowClassName}:not(:last-of-type) > div`]: {
                borderBottom: "1px solid",
                borderColor: "border.light",
              },
            }
          : {}),
        "[role='row']:not(:last-child) > [role='cell']": {
          borderBottom: "1px solid",
          borderColor: "border.light",
        },
        ...sx,
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
