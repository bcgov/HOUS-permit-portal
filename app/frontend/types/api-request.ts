import { ENumberUnit, ERequirementType, ETagType } from "./enums"
import { IOption } from "./types"

export interface IRequirementsAttribute {
  id?: string
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
  requirementsAttributes: IRequirementsAttribute[]
}

interface IRequirementTemplateSectionRequirementBlocksAttribute {
  id?: string
  requirementBlockId?: string
  requirementTemplateSectionId?: string
}

export interface IRequirementTemplateSectionsAttribute {
  id?: string
  name?: string
  requirementTemplateSectionRequirementBlocksAttributes?: IRequirementTemplateSectionRequirementBlocksAttribute[]
}

export interface IRequirementTemplateParams {
  description?: string | null
  requirementTemplateSectionsAttributes?: IRequirementTemplateSectionsAttribute[]
}

export interface ITagSearchParams {
  query?: string
  taggableTypes?: Array<ETagType>
}
