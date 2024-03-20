import { ButtonProps, MenuItem } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { RouterLink } from "../navigation/router-link"

interface IManageMenuItemProps extends ButtonProps {
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
