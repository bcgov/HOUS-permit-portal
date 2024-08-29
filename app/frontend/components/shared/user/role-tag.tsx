import { Tag } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EUserRoles } from "../../../types/enums"

interface IRoleTagProps {
  role: EUserRoles
}

const roleColors: { [key in EUserRoles]: string } = {
  [EUserRoles.submitter]: "transparent",
  [EUserRoles.regionalReviewManager]: "hover.blue",
  [EUserRoles.reviewManager]: "hover.blue",
  [EUserRoles.reviewer]: "greys.grey20",
  [EUserRoles.superAdmin]: "transparent",
}

const roleBorderColors: { [key in EUserRoles]: string } = {
  [EUserRoles.submitter]: "transparent",
  [EUserRoles.regionalReviewManager]: "focus",
  [EUserRoles.reviewManager]: "focus",
  [EUserRoles.reviewer]: "greys.grey90",
  [EUserRoles.superAdmin]: "transparent",
}

export const RoleTag = ({ role }: IRoleTagProps) => {
  const color = roleColors[role]
  const borderColor = roleBorderColors[role]
  const { t } = useTranslation()
  return (
    <Tag
      p={1}
      borderRadius="sm"
      border="1px solid"
      borderColor={borderColor}
      backgroundColor={color}
      textTransform="capitalize"
      textAlign="center"
    >
      {t(`user.roles.${role}`)}
    </Tag>
  )
}
