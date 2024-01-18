import { ERequirementType, ETagType } from "./enums"

export interface IRequirementAttribute {
  label?: string
  inputType?: ERequirementType
}

export interface IRequirementBlockRequirementAttribute {
  id?: string
  _destroy?: boolean
  requirementAttribute: IRequirementAttribute
}

export interface IRequirementBlockParams {
  name: string
  displayName: string
  displayDescription: string
  description?: string
  associationList?: string[]
  requirementBlockRequirementsAttributes?: Array<IRequirementBlockRequirementAttribute>
}

export interface ITagSearchParams {
  query?: string
  taggableTypes?: Array<ETagType>
}
