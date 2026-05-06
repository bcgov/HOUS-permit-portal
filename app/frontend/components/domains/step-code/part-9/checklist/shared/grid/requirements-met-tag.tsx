import { Tag } from "@chakra-ui/react"
import { Check, X } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"

interface IProps {
  success: boolean
}
export const RequirementsMetTag = function RequirementsMetTag({ success }: IProps) {
  const i18nPrefix = "stepCodeChecklist.edit.complianceGrid.requirementsMetTag"
  return (
    <Tag.Root
      bg={success ? "semantic.successLight" : "semantic.errorLight"}
      color="text.secondary"
      textTransform="uppercase"
    >
      <Tag.StartElement boxSize="12px" as={success ? Check : X} />
      <Tag.Label>{success ? t(`${i18nPrefix}.pass`) : t(`${i18nPrefix}.fail`)}</Tag.Label>
    </Tag.Root>
  )
}
