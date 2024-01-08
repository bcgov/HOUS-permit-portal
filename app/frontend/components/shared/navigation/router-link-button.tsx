import { Button, ButtonProps } from "@chakra-ui/react"
import React, { forwardRef } from "react"
import { Link as ReactRouterLink } from "react-router-dom"

interface IRouterLinkButtonProps extends ButtonProps {
  to: string
}

export const RouterLinkButton = forwardRef<HTMLAnchorElement, IRouterLinkButtonProps>(
  ({ to, children, ...rest }, ref) => {
    return (
      <Button as={ReactRouterLink} to={to} variant="primary" ref={ref} {...rest}>
        {children}
      </Button>
    )
  }
)
