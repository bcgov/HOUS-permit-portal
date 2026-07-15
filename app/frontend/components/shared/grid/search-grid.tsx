import { Grid, GridProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { EmptyResultsBox } from "./empty-results-box"

interface ISearchGridProps extends Partial<Omit<GridProps, "templateColumns">> {
  children: ReactNode
  templateColumns: string
  gridRowClassName?: string
  isEmpty?: boolean
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  emptyIcon?: React.ReactNode
  emptyState?: React.ReactNode
}

export const SearchGrid = ({
  sx,
  children,
  templateColumns,
  gridRowClassName,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyState,
  ...containerProps
}: ISearchGridProps) => {
  return (
    <Grid
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
      borderRadius={"sm"}
      {...containerProps}
    >
      {children}
      {isEmpty &&
        (emptyState ?? (
          <EmptyResultsBox
            gridColumn="1 / -1"
            m={4}
            title={emptyTitle}
            description={emptyDescription}
            icon={emptyIcon}
          />
        ))}
    </Grid>
  )
}
