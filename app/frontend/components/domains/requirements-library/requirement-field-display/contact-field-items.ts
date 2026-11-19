import { BoxProps } from "@chakra-ui/react"
import { ERequirementContactFieldItemType } from "../../../../types/enums"

export type TContactFieldItem = {
  type: ERequirementContactFieldItemType
  containerProps?: BoxProps
}

const fullWidthField: Pick<TContactFieldItem, "containerProps"> = {
  containerProps: {
    gridColumn: "1 / span 2",
    sx: {
      ".chakra-form-control input": {
        maxW: "full",
      },
    },
  },
}

// Same fields the application form renders in RequirementFormJsonService.
// Edit and read-only previews both use these lists.
export const generalContactFieldItems: TContactFieldItem[] = [
  { type: ERequirementContactFieldItemType.contactType, ...fullWidthField },
  { type: ERequirementContactFieldItemType.firstName },
  { type: ERequirementContactFieldItemType.lastName },
  { type: ERequirementContactFieldItemType.email },
  { type: ERequirementContactFieldItemType.phone },
  { type: ERequirementContactFieldItemType.address, ...fullWidthField },
  { type: ERequirementContactFieldItemType.title },
  { type: ERequirementContactFieldItemType.organization },
]

export const professionalContactFieldItems: TContactFieldItem[] = [
  { type: ERequirementContactFieldItemType.contactType, ...fullWidthField },
  { type: ERequirementContactFieldItemType.firstName },
  { type: ERequirementContactFieldItemType.lastName },
  { type: ERequirementContactFieldItemType.email },
  { type: ERequirementContactFieldItemType.phone },
  { type: ERequirementContactFieldItemType.address, ...fullWidthField },
  { type: ERequirementContactFieldItemType.title },
  { type: ERequirementContactFieldItemType.businessName },
  { type: ERequirementContactFieldItemType.businessLicense },
  { type: ERequirementContactFieldItemType.professionalAssociation },
  { type: ERequirementContactFieldItemType.professionalNumber },
]
