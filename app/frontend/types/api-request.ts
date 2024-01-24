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

export interface IRequirementBlockParams {
  name: string
  displayName: string
  displayDescription: string
  description?: string
  associationList?: string[]
  requirementsAttributes: IRequirementAttributes[]
}

export interface ITagSearchParams {
  query?: string
  taggableTypes?: Array<ETagType>
}
