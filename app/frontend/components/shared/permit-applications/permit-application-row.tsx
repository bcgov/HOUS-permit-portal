import { Avatar, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Td, Tr } from "@chakra-ui/react"
import { DotsThreeVertical, Eye } from "@phosphor-icons/react"
import { format } from "date-fns"
import React from "react"
import { useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../models/permit-application"
import { PermitApplicationStatusTag } from "./permit-application-status-tag"

interface IProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationRow = ({ permitApplication }: IProps) => {
  const navigate = useNavigate()
  const { id, updatedAt, submitter } = permitApplication
  const submitterName = submitter?.name

  return (
    <Tr
      borderBottom="1px"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
      _hover={{
        bg: "greys.grey04",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/permit-applications/${id}`)}
    >
      <Td>{permitApplication.templateNickname}</Td>
      <Td>{submitterName && <Avatar name={submitterName} size="sm" />}</Td>
      <Td>{format(updatedAt, "MMM-dd-yyyy HH:mm")}</Td>
      <Td>
        {/* TODO: Add designated submitter data */}
        <PermitApplicationStatusTag permitApplication={permitApplication} />
      </Td>
      <Td>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<Icon as={DotsThreeVertical} />}
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
          />
          <MenuList>
            <MenuItem icon={<Icon as={Eye} />}>TODO</MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  )
}
