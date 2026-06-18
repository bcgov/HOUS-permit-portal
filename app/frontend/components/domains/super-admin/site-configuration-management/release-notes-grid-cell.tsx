import { Box, GridItemProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"

type ReleaseNotesGridCellProps = GridItemProps & {
  children: ReactNode
}

export function ReleaseNotesGridCell({ children, ...rest }: ReleaseNotesGridCellProps) {
  return (
    <SearchGridItem minH={15} py={5} px={4} borderColor="border.light" fontSize="sm" lineHeight={1.5} {...rest}>
      <Box w="full" minW="min-content" display="flex" alignItems="center" justifyContent="inherit" whiteSpace="nowrap">
        {children}
      </Box>
    </SearchGridItem>
  )
}
