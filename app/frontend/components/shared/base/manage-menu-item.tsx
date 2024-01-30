import { Button, ButtonProps, MenuItem } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"

interface IManageMenuItemProps extends ButtonProps {
  icon: ReactElement
  children: ReactNode
}

export const ManageMenuItem = ({ icon, children, ...rest }: IManageMenuItemProps) => {
  return (
    <MenuItem as={Button} leftIcon={icon} w="full" justifyContent="flex-start" {...rest}>
      {children}
    </MenuItem>
  )
}
