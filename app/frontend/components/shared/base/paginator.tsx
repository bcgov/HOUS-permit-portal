import { Box, Button, IconButton } from "@chakra-ui/react"
import { css } from "@emotion/react"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Pagination from "rc-pagination"
import "rc-pagination/assets/index.css"

import React, { useState } from "react"

export const Paginator = ({}) => {
  // TODO: provide a store to get methods and state from
  const [currentPage, setCurrentPage] = useState(1)

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // You can also fetch new data based on the page number here
  }

  const ItemRender = (current: number, type: string, element: React.ReactNode) => {
    // debugger
    if (type === "page") {
      return (
        <Button
          variant={current === currentPage ? "primary" : "primaryInverse"}
          border={current === currentPage ? undefined : 0}
          size="sm"
          mx={1}
          onClick={() => handlePageChange(current - 1)}
        >
          {current}
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
          onClick={() => handlePageChange(current + 1)}
          aria-label={"previous page"}
          _after={{ display: "none !important" }}
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
          onClick={() => handlePageChange(current + 1)}
          aria-label={"next page"}
          _after={{ display: "none !important" }}
        ></IconButton>
      )
    }
    return element
  }

  return (
    <Box display="flex" justifyContent="center" css={paginationItemStyle}>
      <Pagination
        style={{ border: 0 }}
        current={currentPage}
        total={100}
        pageSize={10}
        onChange={handlePageChange}
        itemRender={ItemRender}
      />
    </Box>
  )
}
