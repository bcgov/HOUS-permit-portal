import { ENumberUnit, ERequirementType, ETagType } from "./enums"
import { IOption } from "./types"

export interface IRequirementsAttribute {
  id?: string
  label?: string
  inputType?: ERequirementType
  hint?: string
  required?: boolean
  elective?: boolean
  inputOptions?: {
    valueOptions?: IOption[]
    numberUnit?: ENumberUnit
    canAddMultipleContacts?: boolean
  }
}

export interface IRequirementBlockParams {
  name: string
  displayName: string
  displayDescription: string
  description?: string
  associationList?: string[]
  requirementsAttributes: IRequirementsAttribute[]
}

export interface ITemplateSectionBlockAttributes {
  id?: string
  requirementTemplateSectionId?: string
  requirementBlockId?: string
  position?: number
  _destroy?: true
}

export interface IRequirementTemplateSectionAttributes {
  id?: string
  name?: string
  position?: number
  templateSectionBlocksAttributes?: ITemplateSectionBlockAttributes[]
  _destroy?: boolean
}

export interface IRequirementTemplateUpdateParams {
  description?: string | null
  requirementTemplateSectionsAttributes?: IRequirementTemplateSectionAttributes[]
}

export interface ITagSearchParams {
  query?: string
  taggableTypes?: Array<ETagType>
}
