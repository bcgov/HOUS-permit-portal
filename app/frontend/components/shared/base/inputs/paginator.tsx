import { Box, Button, IconButton } from "@chakra-ui/react"
import { css } from "@emotion/react"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Pagination, { PaginationProps } from "rc-pagination"
import "rc-pagination/assets/index.css"

import { observer } from "mobx-react-lite"
import React from "react"

interface IPaginatorProps extends Omit<PaginationProps, "itemRender"> {
  handlePageChange: (page: number) => void | Promise<void>
  totalPages: number
}

export const Paginator = observer(({ handlePageChange, totalPages, ...paginationProps }: IPaginatorProps) => {
  // Inline CSS to remove border from rc-pagination-item
  const paginationItemStyle = css`
    .rc-pagination-item {
      border: none !important;
    }

    .rc-pagination-item::after {
      display: none !important;
    }

    .rc-pagination-options {
      display: none !important;
    }
  `

  const ItemRender = (pageToTransitionTo: number, type: string, element: React.ReactNode) => {
    if (type === "page") {
      return (
        <Button
          variant={pageToTransitionTo === paginationProps.current ? "primary" : "primaryInverse"}
          border={pageToTransitionTo === paginationProps.current ? undefined : 0}
          size="sm"
          mx={1}
          onClick={() => handlePageChange(pageToTransitionTo)}
        >
          {pageToTransitionTo}
        </Button>
      )
    }
    if (type === "prev") {
      return (
        <IconButton
          variant="primaryInverse"
          border={0}
          size="sm"
          mx={1}
          icon={
            <Box color="theme.blue">
              <FontAwesomeIcon style={{ height: 16, width: 16 }} icon={faChevronLeft} />
            </Box>
          }
          onClick={() => handlePageChange(pageToTransitionTo)}
          aria-label={"previous page"}
          _after={{ display: "none !important" }}
          isDisabled={pageToTransitionTo === 0}
        ></IconButton>
      )
    }
    if (type === "next") {
      return (
        <IconButton
          variant="primaryInverse"
          border={0}
          size="sm"
          mx={1}
          icon={
            <Box color="theme.blue">
              <FontAwesomeIcon style={{ height: 16, width: 16 }} icon={faChevronRight} />
            </Box>
          }
          onClick={() => handlePageChange(pageToTransitionTo)}
          aria-label={"next page"}
          _after={{ display: "none !important" }}
          isDisabled={totalPages === pageToTransitionTo && pageToTransitionTo === paginationProps.current}
        ></IconButton>
      )
    }
    return element
  }

  return (
    <Box display="flex" justifyContent="center" css={paginationItemStyle}>
      <Pagination
        style={{ border: 0 }}
        itemRender={ItemRender}
        {...paginationProps}
        onChange={() => console.log("changed")}
      />
    </Box>
  )
})
