import { ENumberUnit, ERequirementType, ETagType } from "./enums"
import { IOption } from "./types"

export interface IRequirementAttributes {
  label?: string
  inputType?: ERequirementType
  hint?: string
  required?: boolean
  inputOptions?: {
    valueOptions?: IOption[]
    numberUnit?: ENumberUnit
  }
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
