import { ENumberUnit, ERequirementType, ETagType } from "./enums"
import { IOption, ISimplifiedRequirementsMap, TComputedCompliance } from "./types"

export interface IFormConditional {
  when: string
  operand: string
  then: string
}

export interface IRequirementAttributes {
  id?: string
  label?: string
  inputType?: ERequirementType
  hint?: string
  required?: boolean
  requirementCode: string
  elective?: boolean
  inputOptions?: {
    valueOptions?: IOption[]
    numberUnit?: ENumberUnit
    canAddMultipleContacts?: boolean
    conditional?: IFormConditional
    energyStepCode?: string
    computedCompliance?: TComputedCompliance
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

export interface IExternalApiKeyParams {
  name?: string
  connectingApplication?: string
  webhookUrl?: string
  expiredAt?: Date
  jurisdictionId?: string
}

export interface IJurisdictionIntegrationRequirementsMappingUpdateParams {
  simplifiedMap?: ISimplifiedRequirementsMap
}
