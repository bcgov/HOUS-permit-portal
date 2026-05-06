import { Button, ButtonProps } from "@chakra-ui/react"
import React, { ReactElement, forwardRef } from "react"
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from "react-router-dom"

export interface IRouterLinkButtonProps extends ButtonProps, Omit<ReactRouterLinkProps, keyof ButtonProps> {
  to: string
  icon?: ReactElement
  leftIcon?: ReactElement
  rightIcon?: ReactElement
  isDisabled?: boolean
}

export const RouterLinkButton = forwardRef<HTMLAnchorElement, IRouterLinkButtonProps>(function RouterLinkButton(
  { to, icon, leftIcon, rightIcon, children, disabled, isDisabled, onClick, ...rest },
  ref
) {
  const isLinkDisabled = disabled || isDisabled

  return (
    <Button variant="primary" disabled={isLinkDisabled} {...rest} asChild>
      <ReactRouterLink
        to={to}
        ref={ref}
        onClick={(e) => {
          if (isLinkDisabled) {
            e.preventDefault()
            return
          }
          onClick?.(e)
        }}
      >
        {leftIcon ?? icon}
        {children}
        {rightIcon}
      </ReactRouterLink>
    </Button>
  )
})
