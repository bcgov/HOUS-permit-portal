import { Button, ButtonProps } from "@chakra-ui/react"
import React from "react"
import { Link as ReactRouterLink } from "react-router-dom"

interface IRouterLinkButtonProps extends ButtonProps {
  to: string
}

export const RouterLinkButton = ({ to, children, ...rest }: IRouterLinkButtonProps) => {
  return (
    <Button as={ReactRouterLink} to={to} variant="primary" {...rest}>
      {children}
    </Button>
  )
}
