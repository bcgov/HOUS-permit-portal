import { Button, ButtonProps } from "@chakra-ui/react"
import React, { ReactElement, forwardRef } from "react"
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from "react-router-dom"

export interface IRouterLinkButtonProps extends ButtonProps, Omit<ReactRouterLinkProps, keyof ButtonProps> {
  to: string
  icon?: ReactElement
}

export const RouterLinkButton = forwardRef<HTMLAnchorElement, IRouterLinkButtonProps>(function RouterLinkButton(
  { to, icon, children, disabled, onClick, ...rest },
  ref
) {
  return (
    <Button
      as={ReactRouterLink}
      to={to}
      variant="primary"
      ref={ref}
      leftIcon={icon}
      isDisabled={disabled}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
          return
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </Button>
  )
})
