import { Button, ButtonProps, MenuItem } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { IRouterLinkProps, RouterLink } from "../navigation/router-link"

type CombinedColorType = ButtonProps["color"] | IRouterLinkProps["color"]

type CombinedProps = Omit<ButtonProps, "color"> &
  Omit<IRouterLinkProps, "color" | "to"> & {
    // Exclude 'to' from IRouterLinkProps
    color?: CombinedColorType // Make color optional
    to?: IRouterLinkProps["to"] // Explicitly mark 'to' as optional
  }

interface IManageMenuItemProps extends CombinedProps {
  icon: ReactElement
  children: ReactNode
}

export const ManageMenuItem = ({ icon, children, ...rest }: IManageMenuItemProps) => {
  return (
    <MenuItem as={RouterLink} icon={icon} w="full" justifyContent="flex-start" {...rest}>
      {children}
    </MenuItem>
  )
}

export const ManageMenuItemButton = ({ leftIcon, children, ...rest }: ButtonProps) => {
  return (
    <MenuItem as={Button} icon={leftIcon} w="full" justifyContent="flex-start" {...rest}>
      {children}
    </MenuItem>
  )
}
