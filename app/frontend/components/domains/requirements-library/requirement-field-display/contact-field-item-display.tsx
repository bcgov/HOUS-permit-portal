import React from "react"
import { getRequirementContactFieldItemLabel } from "../../../../constants"
import { ERequirementContactFieldItemType, ERequirementType } from "../../../../types/enums"
import { RequirementFieldDisplay, TRequirementFieldDisplayProps } from "./index"

interface IContactFieldItemDisplayProps {
  contactFieldItemType: ERequirementContactFieldItemType
}

export function ContactFieldItemDisplay({ contactFieldItemType }: IContactFieldItemDisplayProps) {
  const defaultProps: Partial<TRequirementFieldDisplayProps> = {
    label: getRequirementContactFieldItemLabel(contactFieldItemType),
    requirementType: ERequirementType.text,
    required: true,
  }
  const required = [
    ERequirementContactFieldItemType.firstName,
    ERequirementContactFieldItemType.lastName,
    ERequirementContactFieldItemType.email,
    ERequirementContactFieldItemType.phone,
    ERequirementContactFieldItemType.address,
    ERequirementContactFieldItemType.title,
  ].includes(contactFieldItemType)

  const propsByType = {
    [ERequirementContactFieldItemType.email]: {
      requirementType: ERequirementType.email,
    },
    [ERequirementContactFieldItemType.phone]: {
      requirementType: ERequirementType.phone,
    },
    [ERequirementContactFieldItemType.address]: {
      requirementType: ERequirementType.address,
    },
    [ERequirementContactFieldItemType.organization]: {
      labelProps: { maxW: "full" },
    },
    [ERequirementContactFieldItemType.title]: {
      requirementType: ERequirementType.text,
    },
  }
  return <RequirementFieldDisplay {...defaultProps} {...propsByType[contactFieldItemType]} required={required} />
}
