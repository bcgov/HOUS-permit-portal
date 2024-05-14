import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { getRequirementTypeLabel } from "../../constants"
import { ERequirementType } from "../../types/enums"

export function RequirementTypeTag({
  type,
  matchesStepCodePackageRequirementCode,
  ...tagProps
}: {
  type: ERequirementType
  matchesStepCodePackageRequirementCode: boolean
} & Partial<TagProps>) {
  return (
    <Tag bg={"greys.grey03"} color={"text.secondary"} fontWeight={700} fontSize={"xs"} {...tagProps}>
      {getRequirementTypeLabel(type, matchesStepCodePackageRequirementCode)}
    </Tag>
  )
}
