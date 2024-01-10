import { Link } from "@chakra-ui/react"
import React, { forwardRef } from "react"
import { LinkProps, Link as ReactRouterLink } from "react-router-dom"

interface IRouterLinkProps extends LinkProps {}

export const RouterLink = forwardRef<HTMLAnchorElement, IRouterLinkProps>(({ to, children, ...rest }, ref) => {
  return (
    <Link as={ReactRouterLink} to={to} ref={ref} {...rest}>
      {children}
    </Link>
  )
})
