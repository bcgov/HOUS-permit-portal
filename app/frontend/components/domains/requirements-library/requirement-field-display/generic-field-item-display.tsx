import React from "react"
import { ERequirementType } from "../../../../types/enums"
import { RequirementFieldDisplay, TRequirementFieldDisplayProps } from "./index"

interface IGenericFieldItemDisplayProps {
  type: ERequirementType
  label: string
  required?: boolean
}

export function GenericFieldItemDisplay({ label, type, required }: IGenericFieldItemDisplayProps) {
  const defaultProps: Partial<TRequirementFieldDisplayProps> = {
    label: label,
    requirementType: type,
    required: required,
  }

  return <RequirementFieldDisplay {...defaultProps} />
}
