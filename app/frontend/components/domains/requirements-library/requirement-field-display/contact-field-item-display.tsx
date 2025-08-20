import React from "react"
import { getRequirementContactFieldItemLabel } from "../../../../constants"
import { ERequirementContactFieldItemType, ERequirementType } from "../../../../types/enums"
import { RequirementFieldDisplay, TRequirementFieldDisplayProps } from "./index"

interface IContactFieldItemDisplayProps {
  contactFieldItemType: ERequirementContactFieldItemType
  required?: boolean
}

export function ContactFieldItemDisplay({ contactFieldItemType, required }: IContactFieldItemDisplayProps) {
  const defaultProps: Partial<TRequirementFieldDisplayProps> = {
    label: getRequirementContactFieldItemLabel(contactFieldItemType),
    requirementType: ERequirementType.text,
  }
  const isRequiredItem =
    required &&
    [
      ERequirementContactFieldItemType.firstName,
      ERequirementContactFieldItemType.lastName,
      ERequirementContactFieldItemType.email,
      ERequirementContactFieldItemType.phone,
      ERequirementContactFieldItemType.address,
      ERequirementContactFieldItemType.title,
      ERequirementContactFieldItemType.contactType,
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
    [ERequirementContactFieldItemType.contactType]: {
      requirementType: ERequirementType.text,
      labelProps: { maxW: "full" },
      required: true,
    },
  }
  return <RequirementFieldDisplay {...defaultProps} {...propsByType[contactFieldItemType]} required={isRequiredItem} />
}
