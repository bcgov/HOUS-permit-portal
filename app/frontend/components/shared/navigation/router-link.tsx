import { Link } from "@chakra-ui/react"
import React from "react"
import { LinkProps, Link as ReactRouterLink } from "react-router-dom"

interface IRouterLinkProps extends LinkProps {}

export const RouterLink = ({ to, children, ...rest }: IRouterLinkProps) => {
  return (
    <Link as={ReactRouterLink} to={to} {...rest}>
      {children}
    </Link>
  )
}
