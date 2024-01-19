import { ERequirementType, ETagType } from "./enums"

export interface IRequirementAttributes {
  label?: string
  inputType?: ERequirementType
}

export interface IRequirementBlockRequirementAttributes {
  id?: string
  _destroy?: boolean
  requirementAttributes: IRequirementAttributes
}

export interface IRequirementBlockParams {
  name: string
  displayName: string
  displayDescription: string
  description?: string
  associationList?: string[]
  requirementBlockRequirementsAttributes?: Array<IRequirementBlockRequirementAttributes>
}

export interface ITagSearchParams {
  query?: string
  taggableTypes?: Array<ETagType>
}
