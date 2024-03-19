import { Link } from "@chakra-ui/react"
import React, { forwardRef } from "react"
import { LinkProps, Link as ReactRouterLink } from "react-router-dom"
import { handleScrollToTop } from "../../../utils/utility-functions"

interface IRouterLinkProps extends LinkProps {
  onClick?: () => void
}

export const RouterLink = forwardRef<HTMLAnchorElement, IRouterLinkProps>(({ to, children, onClick, ...rest }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // If there's an onClick prop passed, call it
    if (onClick) {
      onClick()
    }

    handleScrollToTop("outerScrollContainer")
  }

  return (
    <Link as={ReactRouterLink} to={to} ref={ref} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
})
