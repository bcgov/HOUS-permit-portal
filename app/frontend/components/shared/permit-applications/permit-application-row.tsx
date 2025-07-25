import { Avatar, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Td, Tr } from "@chakra-ui/react"
import { DotsThreeVertical, Eye } from "@phosphor-icons/react"
import { format } from "date-fns"
import React from "react"
import { IPermitApplication } from "../../../models/permit-application"
import { PermitApplicationStatusTag } from "./permit-application-status-tag"

interface IProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationRow = ({ permitApplication }: IProps) => {
  const { permitType, updatedAt, submitter } = permitApplication
  const submitterName = submitter?.name

  return (
    <Tr borderBottom="1px" borderColor="border.light" _last={{ borderBottom: "none" }}>
      <Td>{permitApplication.templateNickname}</Td>
      <Td>
        <Avatar name={submitterName} size="sm" />
      </Td>
      <Td>{format(updatedAt, "MMM-dd-yyyy HH:mm")}</Td>
      <Td>
        <PermitApplicationStatusTag permitApplication={permitApplication} />
      </Td>
      <Td>
        <Menu>
          <MenuButton as={IconButton} aria-label="Options" icon={<Icon as={DotsThreeVertical} />} variant="ghost" />
          <MenuList>
            <MenuItem icon={<Icon as={Eye} />}>TODO</MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  )
}
