import { IRevisionReason } from "../models/revision-reason"
import { ELandingTemplateKeys, ENumberUnit, ERequirementType, ETagType, EVisibility } from "./enums"
import {
  IHelpLinkItems,
  IOption,
  IRevisionRequest,
  ISimplifiedRequirementsMap,
  TComputedCompliance,
  TConditional,
} from "./types"

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
    conditional?: IFormConditional | TConditional
    energyStepCode?: string
    computedCompliance?: TComputedCompliance
  }
  position?: number
}

export interface IRequirementBlockParams {
  name: string
  firstNations: boolean
  displayName: string
  visibility: EVisibility
  displayDescription: string
  description?: string
  associationList?: string[]
  requirementsAttributes: IRequirementAttributes[]
  replaceBlockId?: string
  replaceOnTemplateId?: string
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

export interface IRevisionRequestsAttributes extends Partial<IRevisionRequest> {
  _destroy?: true
  userId?: string
}

export interface IRevisionReasonsAttributes {
  id?: string
  reasonCode?: string
  description?: string
  _discard?: true
}

export interface IRequirementTemplateUpdateParams {
  description?: string | null
  nickname?: string | null
  public?: boolean | null
  assigneeId?: string | null
  requirementTemplateSectionsAttributes?: IRequirementTemplateSectionAttributes[]
}

export interface IInvitePreviewersParams {
  emails: string[]
}

export interface ISiteConfigurationUpdateParams {
  displaySitewideMessage?: boolean | null
  sitewideMessage?: string | null
  helpLinkItems?: IHelpLinkItems
  revisionReasonsMap?: { [key: string]: IRevisionReason }
  [ELandingTemplateKeys.SmallScale]?: string | null
  revisionReasonsAttributes?: IRevisionReasonsAttributes[]
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
  notificationEmail?: string
}

export interface IIntegrationMappingUpdateParams {
  simplifiedMap?: ISimplifiedRequirementsMap
}
