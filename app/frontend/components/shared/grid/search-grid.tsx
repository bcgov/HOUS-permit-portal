import { Grid, GridProps, VStack } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { ISearch } from "../../../lib/create-search-model"
import { ModelSearchInput } from "../base/model-search-input"
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
  searchModel?: ISearch
  searchLabel?: string
  toolbar?: ReactNode
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
  searchModel,
  searchLabel,
  toolbar,
  flex,
  minH,
  h,
  ...containerProps
}: ISearchGridProps) => {
  const header =
    toolbar ?? (searchModel && searchLabel ? <ModelSearchInput searchModel={searchModel} label={searchLabel} /> : null)

  const grid = (
    <Grid
      role={"table"}
      templateColumns={templateColumns}
      w="full"
      maxW={"full"}
      overflow={"auto"}
      {...(header && flex != null ? { flex: 1, minH: 0 } : { flex, minH, h })}
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

  if (!header) return grid

  return (
    <VStack
      align="flex-start"
      spacing={5}
      w="full"
      flex={flex}
      minH={minH}
      h={h}
      overflow={flex != null ? "hidden" : undefined}
    >
      {header}
      {grid}
    </VStack>
  )
}
