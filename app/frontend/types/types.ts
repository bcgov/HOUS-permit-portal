import { Theme } from "@chakra-ui/react"
import { IPermitApplication } from "../models/permit-application"
import { IPermitBlockStatus } from "../models/permit-block-status"
import { IActivity, IPermitType } from "../models/permit-classification"
import { IRequirement } from "../models/requirement"
import {
  EAutoComplianceModule,
  EAutoComplianceType,
  ECollaborationType,
  ECollaboratorType,
  EDoorsPerformanceType,
  EEnabledElectiveFieldReason,
  EEnergyStep,
  EFossilFuelsPresence,
  EHotWaterPerformanceType,
  EJurisdictionTypes,
  ENotificationActionType,
  ENumberUnit,
  EPermitApplicationSocketEventTypes,
  EPermitApplicationStatus,
  ERequirementType,
  ESocketDomainTypes,
  ESocketEventTypes,
  ESortDirection,
  ESpaceHeatingCoolingPerformanceType,
  EStepCodeAirtightnessValue,
  EStepCodeBuildingType,
  EStepCodeCompliancePath,
  EStepCodeEPCTestingTargetType,
  ETemplateVersionStatus,
  EUserRoles,
  EVisibility,
  EWindowsGlazedDoorsPerformanceType,
  EZeroCarbonStep,
} from "./enums"

export type TLatLngTuple = [number, number]

export interface IContact {
  id: string
  firstName: string
  lastName: string
  title?: string
  department?: string
  email?: string
  phone?: string
  extension: string
  cell?: string
  address?: string
  organization?: string
  businessName?: string
  businessLicense?: string
  professionalAssociation?: string
  professionalNumber?: string
  createdAt?: number | string // has to allow string to stop errors with useFieldArray
  updatedAt?: number | string // has to allow string to stop errors with useFieldArray
}

export interface IPermitTypeSubmissionContact {
  id: string
  email: string
  permitTypeId: string
  confirmedAt: string
}

export interface ISort<TField = string> {
  field: TField
  direction: ESortDirection
}

export interface IOption<TValue = string> {
  value: TValue
  label?: string
}

export type TDebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void

export type TSearchParams<IModelSortFields, IModelFilterFields = {}> = {
  sort?: ISort<IModelSortFields>
  query?: string
  page?: number
  perPage?: number
  showArchived?: boolean
  visibility?: TVisibility
  filters?: IModelFilterFields
}

export type TComputedCompliance = {
  module: EAutoComplianceModule
  value?: string
  valueOn?: string
  trigger?: string
  optionsMap?: Record<string, string>
}

export interface IRequirementOptions {
  valueOptions?: IOption[]
  numberUnit?: ENumberUnit
  canAddMultipleContacts?: boolean
  conditional?: TConditional
  computedCompliance?: TComputedCompliance
  energyStepCode?: string
  dataValidation?: Object
}

export interface IFormJson {
  id: string
  key: string
  input: false
  tableView: false
  components: IFormIOSection[]
}

export interface ISingleRequirementFormJson {
  id: string
  key: string
  components: IFormIORequirement[]
}

export interface IFormIOSection {
  id: string
  key: string
  type: "panel"
  title: string
  collapsible: true
  initiallyCollapsed: false
  components: IFormIOBlock[]
}

export interface IFormIOBlock {
  id: string
  legend: string
  key: string
  title: string
  input: false
  tableView: false
  components: IFormIORequirement[]
}

export interface IFormIORequirement {
  id?: string
  key?: string
  type: string
  input?: true
  validation?: { required: boolean }
  label: string
  widget?: any
  action?: string
  customClass?: string
  disabled?: boolean
  customConditional?: string
  conditional?: any
  components?: IFormIORequirement[]
  persistent?: string
}

export interface ISubmissionData {
  data: any[]
}

export interface IDenormalizedRequirement {
  id: string
  label: string
  inputType: ERequirementType
  inputOptions: IRequirementOptions
  formJson?: IFormIORequirement
  hint?: string | null
  elective?: boolean
  required?: boolean
  requirementCode: string
}

export interface IDenormalizedRequirementBlock {
  id: string
  name: string
  firstNations: boolean
  sku: string
  formJson?: IFormIOBlock
  description?: string
  displayName: string
  displayDescription?: string
  requirements: IDenormalizedRequirement[]
}

export interface IDenormalizedTemplateSectionBlock {
  id: string
  requirementBlock: IDenormalizedRequirementBlock
}

export interface IDenormalizedRequirementTemplateSection {
  id: string
  name: string
  templateSectionBlocks: IDenormalizedTemplateSectionBlock[]
}

export interface IDenormalizedTemplate {
  id: string
  label: string
  description?: string
  permitType: IPermitType
  activity: IActivity
  requirementTemplateSections: IDenormalizedRequirementTemplateSection[]
}

export interface ICompareRequirementsBoxData {
  id?: string
  class?: string
  label: string
  diffSectionLabel: string
}

export interface ICompareRequirementsBoxDiff {
  added: ICompareRequirementsBoxData[]
  removed: ICompareRequirementsBoxData[]
  changed: ICompareRequirementsBoxData[]
}

export interface IErrorsBoxData {
  id: string
  label: string
  class: string
}

interface IStepCodeBuildingCharacteristicSummarySelectOptions {
  performanceTypes: {
    windowsGlazedDoors: EWindowsGlazedDoorsPerformanceType[]
    doors: EDoorsPerformanceType[]
    spaceHeatingCooling: ESpaceHeatingCoolingPerformanceType[]
    hotWater: EHotWaterPerformanceType[]
  }
  fossilFuelsPresence: EFossilFuelsPresence[]
}

export interface IStepCodeSelectOptions {
  compliancePaths: EStepCodeCompliancePath[]
  airtightnessValues: EStepCodeAirtightnessValue[]
  epcTestingTargetTypes: EStepCodeEPCTestingTargetType[]
  permitApplications: Partial<IPermitApplication>[]
  buildingTypes: EStepCodeBuildingType[]
  buildingCharacteristicsSummary: IStepCodeBuildingCharacteristicSummarySelectOptions
  energySteps: EEnergyStep[]
  zeroCarbonSteps: EZeroCarbonStep[]
}

export interface IRequirementBlockCustomization {
  tip?: string
  enabledElectiveFieldIds?: Array<string>
  enabledElectiveFieldReasons?: Record<string, EEnabledElectiveFieldReason>
}

export interface ITemplateCustomization {
  requirementBlockChanges?: Record<string, IRequirementBlockCustomization>
}

export interface IDownloadableFile {
  fileUrl: string
  fileName: string
  fileSize: number
}

export interface IEULA {
  id: string
  content: string
  createdAt: Date
}

export interface ILicenseAgreement {
  id: string
  agreement: IEULA
  acceptedAt: Date
}

export interface IPermitApplicationComplianceUpdate {
  id: string
  frontEndFormUpdate: Object
  formattedComplianceData: Object
}

export interface IPermitNotificationObjectData {
  templateVersionId?: string
  previousTemplateVersionId?: string
  requirementTemplateId?: string
  permitApplicationId?: string
  permitApplicationNumber?: string
  // Add future notification data here
}

export interface IRequirementTemplateNotificationObjectData {
  requirementTemplateId?: string
}

export interface ITemplateVersionNotificationObjectData {
  templateVersionId?: string
}

export interface IPermitCollaborationNotificationObjectData {
  permitApplicationId?: string
  collaboratorType?: ECollaboratorType
  assignedRequirementBlockName?: string
}

export interface IPermitBlockStatusReadyNotificationObjectData {
  permitApplicationId?: string
  collaborationType: ECollaborationType
  requirementBlockName?: string
}

export interface IMissingRequirementsMappingNotificationObjectData {
  templateVersionId: string
}

export interface INotification {
  id: string
  actionType: ENotificationActionType
  actionText: string
  objectData?:
    | IPermitNotificationObjectData
    | IMissingRequirementsMappingNotificationObjectData
    | IPermitCollaborationNotificationObjectData
    | ITemplateVersionNotificationObjectData
    | IRequirementTemplateNotificationObjectData
}

export interface ITemplateVersionUpdate {
  status: ETemplateVersionStatus
}

export type TSocketEventData =
  | IPermitApplicationComplianceUpdate
  | IPermitApplicationSupportingDocumentsUpdate
  | IPermitBlockStatus
  | INotification
  | ITemplateVersionUpdate

export interface IPermitApplicationSupportingDocumentsUpdate {
  id: string
  supportingDocuments: IPermitApplication["supportingDocuments"]
  missingPdfs: string[]
  zipfileSize: null | number
  zipfileName: null | string
  zipfileUrl: null | string
}

export interface IUserPushPayload {
  data: TSocketEventData
  domain: ESocketDomainTypes
  eventType: ESocketEventTypes | EPermitApplicationSocketEventTypes
  meta: {
    lastReadAt: number
    totalPages: number
    unreadCount: number
  }
}

export type TSiteWideMessageConfiguration = {
  displaySitewideMessage: boolean
  sitewideMessage: string | null
}

export interface ISiteConfiguration extends TSiteWideMessageConfiguration {
  helpLinkItems: IHelpLinkItems
}

export interface IContact {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  cell?: string
  address?: string
  organization?: string
  businessName?: string
  businessLicense?: string
  professionalAssociation?: string
  professionalNumber?: string
}

export type TConditional = {
  show: boolean
  when: string
  eq: string
}

export interface ILinkItem {
  href: string
  title: string
  descrption: string
  show: boolean
}

export interface IHelpLinkItems {
  getStartedLinkItem: ILinkItem
  bestPracticesLinkItem: ILinkItem
  dictionaryLinkItem: ILinkItem
  userGuideLinkItem: ILinkItem
}

interface ICommonAutoComplianceModuleConfiguration<EModule extends EAutoComplianceModule> {
  module: EModule
  type: EAutoComplianceType
  label: string
  availableOnInputTypes: ERequirementType[]
  defaultSettings?: Object
}

type TAutoComplianceValueExtractorTypeConfiguration<EModule extends EAutoComplianceModule> =
  ICommonAutoComplianceModuleConfiguration<EModule> & {
    type: EAutoComplianceType.externalValueExtractor | EAutoComplianceType.internalValueExtractor
    availableFields: Array<
      IOption<string> & {
        availableOnInputTypes: ERequirementType[]
      }
    >
  }

type TAutoComplianceOptionsMapperTypeConfiguration<EModule extends EAutoComplianceModule> =
  ICommonAutoComplianceModuleConfiguration<EModule> & {
    type: EAutoComplianceType.externalOptionsMapper
    mappableExternalOptions: Array<IOption<string>>
  }

export interface IDigitalSealValidatorModuleConfiguration
  extends ICommonAutoComplianceModuleConfiguration<EAutoComplianceModule.DigitalSealValidator> {}

export interface IParcelInfoExtractorModuleConfiguration
  extends TAutoComplianceValueExtractorTypeConfiguration<EAutoComplianceModule.ParcelInfoExtractor> {
  type: EAutoComplianceType.externalValueExtractor
}

export interface IPermitApplicationModuleConfiguration
  extends TAutoComplianceValueExtractorTypeConfiguration<EAutoComplianceModule.PermitApplication> {
  type: EAutoComplianceType.internalValueExtractor
}

export type TValueExtractorAutoComplianceModuleConfiguration =
  | IParcelInfoExtractorModuleConfiguration
  | IPermitApplicationModuleConfiguration

export interface IHistoricSiteModuleConfiguration
  extends TAutoComplianceOptionsMapperTypeConfiguration<EAutoComplianceModule.HistoricSite> {}

export type TOptionsMapperAutoComplianceModuleConfiguration = IHistoricSiteModuleConfiguration

export type TAutoComplianceModuleConfigurations = {
  [EAutoComplianceModule.DigitalSealValidator]: IDigitalSealValidatorModuleConfiguration
  [EAutoComplianceModule.ParcelInfoExtractor]: IParcelInfoExtractorModuleConfiguration
  [EAutoComplianceModule.PermitApplication]: IPermitApplicationModuleConfiguration
  [EAutoComplianceModule.HistoricSite]: IHistoricSiteModuleConfiguration
}

export type TAutoComplianceModuleConfiguration =
  TAutoComplianceModuleConfigurations[keyof TAutoComplianceModuleConfigurations]

export interface IJurisdictionFilters {
  name?: string
  type?: EJurisdictionTypes
  userId?: string
}

export interface IJurisdictionSearchFilters {
  submissionInboxSetUp?: boolean
}

export interface IPermitApplicationSearchFilters {
  requirementTemplateId?: string
  templateVersionId?: string
  status?: EPermitApplicationStatus[]
}

export interface ITemplateVersionDiff {
  added: IRequirement[]
  removed: IRequirement[]
  changed: IRequirement[]
}

export type TLocalSystemMapping = string

export interface ISimplifiedRequirementsMap {
  [requirementBlockSku: string]: {
    [requirementCode: string]: TLocalSystemMapping
  }
}

export interface IRequirementMap {
  id: string
  requirementCode: string
  local_system_mapping?: TLocalSystemMapping
}

export type TChakraColor = keyof Theme["colors"]

export interface ILinkData {
  text: string
  href: string
}

export interface IRevisionRequest {
  id: string
  reasonCode: string
  requirementJson: IFormIORequirement
  submissionJson: any
  comment: string
  user?: IMinimalFrozenUser
  createdAt: number
}

export interface IMinimalFrozenUser {
  id: string
  email: string
  role: EUserRoles
  firstName: string
  lastName: string
  organization?: string
  certified: boolean
  discardedAt?: Date
}

export interface ISubmissionVersion {
  id: string
  formJson: IFormJson
  submissionData: ISubmissionData
  revisionRequests: IRevisionRequest[]
  viewedAt?: Date
  createdAt: number
}

export interface IPermitTypeRequiredStep {
  id?: string
  default: boolean
  permitTypeId: string
  permitTypeLabel?: string
  energyStepRequired: EEnergyStep
  zeroCarbonStepRequired: EZeroCarbonStep
}

export type TCreateRequirementTemplateFormData = {
  description: string
  firstNations?: boolean
  permitTypeId: string
  activityId: string
  type: string
}

export interface ICopyRequirementTemplateFormData extends Partial<TCreateRequirementTemplateFormData> {
  id?: string
}

type EVisibilityValues = EVisibility.live | EVisibility.earlyAccess | EVisibility.any

export type TVisibility =
  | EVisibilityValues
  | `${EVisibilityValues},${EVisibilityValues}`
  | `${EVisibilityValues},${EVisibilityValues},${EVisibilityValues}`
