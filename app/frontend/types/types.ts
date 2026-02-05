import { Theme } from "@chakra-ui/react"
import { IPermitApplication } from "../models/permit-application"
import { IPermitBlockStatus } from "../models/permit-block-status"
import { IActivity, IPermitType } from "../models/permit-classification"
import { IRequirement } from "../models/requirement"
import {
  EAutoComplianceModule,
  EAutoComplianceType,
  EBaselineOccupancyKey,
  EBaselinePerformanceRequirement,
  ECollaborationType,
  ECollaboratorType,
  EDocumentReferenceDocumentType,
  EDoorsPerformanceType,
  EEnabledElectiveFieldReason,
  EEnergyOutputSource,
  EEnergyOutputUseType,
  EEnergyStep,
  EFileScanStatus,
  EFossilFuelsPresence,
  EFuelType,
  EHotWaterPerformanceType,
  EJurisdictionSocketEventTypes,
  EJurisdictionTypes,
  ENotificationActionType,
  ENumberUnit,
  EPermitApplicationSocketEventTypes,
  EPermitApplicationStatus,
  EPermitProjectRollupStatus,
  ERequirementType,
  ESocketDomainTypes,
  ESocketEventTypes,
  ESortDirection,
  ESpaceHeatingCoolingPerformanceType,
  EStepCodeAirtightnessValue,
  EStepCodeBuildingType,
  EStepCodeCompliancePath,
  EStepCodeEPCTestingTargetType,
  EStepCodeOccupancyKey,
  ETemplateVersionStatus,
  EUserRoles,
  EVisibility,
  EWindowsGlazedDoorsPerformanceType,
  EZeroCarbonStep,
} from "./enums"

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export type TLatLngTuple = [number, number]

export interface IContact {
  contactType: string
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

export interface IOptionGroup {
  label: string
  options: IOption[]
}

export interface IOption<TValue = string> {
  label: string
  value: TValue
  description?: string
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
  requirementInputType?: string
  energyStepCode?: string
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
  instructions?: string | null
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
  visibility?: EVisibility
  displayName: string
  displayDescription?: string
  requirements: IDenormalizedRequirement[]
  requirementDocuments: IRequirementDocument[]
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
  nickname: string
  description?: string
  permitType: IPermitType
  activity: IActivity
  firstNations: boolean
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

export interface IPart9ChecklistSelectOptions {
  compliancePaths: EStepCodeCompliancePath[]
  airtightnessValues: EStepCodeAirtightnessValue[]
  epcTestingTargetTypes: EStepCodeEPCTestingTargetType[]
  permitApplications: Partial<IPermitApplication>[]
  buildingTypes: EStepCodeBuildingType[]
  buildingCharacteristicsSummary: IStepCodeBuildingCharacteristicSummarySelectOptions
  energySteps: EEnergyStep[]
  zeroCarbonSteps: EZeroCarbonStep[]
}

export interface IPart3ChecklistSelectOptions {}
export interface IFileData {
  id: string // Corresponds to file_id in the blueprint
  storage?: string // Corresponds to file_data?.dig("storage")
  metadata: {
    size: number // Corresponds to file_size
    filename: string // Corresponds to file_name
    mimeType?: string // Corresponds to file_type
  }
}

export interface IBaseFileAttachment {
  id: string
  file: IFileData
  createdAt: Date // Assuming string date from backend, MST will cast
  // updatedAt?: Date; // Optional, if needed
  _destroy?: boolean // Common for managing nested resources
}

export interface IRequirementDocument extends IBaseFileAttachment {
  requirementBlockId: string
}

export interface IDesignDocument extends IBaseFileAttachment {
  preCheckId: string
}

export interface IJurisdictionServicePartnerEnrollment {
  id: string
  servicePartner: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IJurisdictionStub {
  id: string
  qualifiedName: string
}

export interface IReportDocument extends IBaseFileAttachment {
  stepCodeId: string
}

export interface IResourceDocument extends IBaseFileAttachment {
  resourceId: string
  scanStatus: EFileScanStatus
}

export interface IResource {
  id: string
  jurisdictionId: string
  category: string
  title: string
  description?: string
  resourceType: string
  linkUrl?: string
  updatedAt: string
  createdAt: string
  resourceDocument?: IResourceDocument
}

export interface IProjectDocument extends IBaseFileAttachment {
  permitProjectId: string // Foreign key to link to PermitProject
}

export interface IRequirementBlockCustomization {
  tip?: string
  resourceIds?: string[]
  enabledElectiveFieldIds?: Array<string>
  optionalElectiveFieldIds?: Array<string>
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
    | IReportDocumentNotificationObjectData
}

export interface ITemplateVersionUpdate {
  status: ETemplateVersionStatus
}

export interface IReportDocumentNotificationObjectData {
  stepCodeId?: string
  reportDocumentId: string
  filename?: string
  downloadUrl?: string
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
  allSubmissionVersionCompletedSupportingDocuments?: IDownloadableFile[]
}

export interface IUserPushPayload {
  data: TSocketEventData
  domain: ESocketDomainTypes
  eventType: ESocketEventTypes | EPermitApplicationSocketEventTypes | EJurisdictionSocketEventTypes
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
  inboxEnabled?: boolean
}

export interface IPermitApplicationSearchFilters {
  status?: EPermitApplicationStatus[]
  templateVersionId?: string
  requirementTemplateId?: string
  hasCollaborator?: boolean
  permitProjectId?: string
  query?: string
}

export interface IPermitProjectSearchFilters {
  query?: string
  showArchived?: boolean
  rollupStatus?: EPermitProjectRollupStatus[]
  requirementTemplateIds?: string[]
  jurisdictionId?: string[]
  // Add other specific filters if needed, e.g., status, submitterId
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
  submissionData: any
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
  permitTypeName?: string
  workType?: string
  energyStepRequired: EEnergyStep
  zeroCarbonStepRequired: EZeroCarbonStep
  activityName?: string
}

export type TCreateRequirementTemplateFormData = {
  description: string
  firstNations?: boolean
  permitTypeId: string
  activityId: string
  type: string
}

export type TCreatePermitApplicationFormData = {
  pid?: string
  pin?: string
  permitTypeId: string
  activityId: string
  jurisdictionId?: string
  site?: IOption
  firstNations: boolean
  sandboxId?: string
}

export interface ICopyRequirementTemplateFormData extends Partial<TCreateRequirementTemplateFormData> {
  id?: string
}

type EVisibilityValues = EVisibility.live | EVisibility.earlyAccess | EVisibility.any

export type TVisibility =
  | EVisibilityValues
  | `${EVisibilityValues},${EVisibilityValues}`
  | `${EVisibilityValues},${EVisibilityValues},${EVisibilityValues}`

export interface IBaselineOccupancy {
  id?: string
  key: EBaselineOccupancyKey
  modelledFloorArea: string
  performanceRequirement: EBaselinePerformanceRequirement
  percentBetterRequirement?: string
  requirementSource?: string
}
export interface IStepCodeOccupancy {
  id?: string
  key: EStepCodeOccupancyKey
  modelledFloorArea: string
  energyStepRequired: EEnergyStep
  zeroCarbonStepRequired: EZeroCarbonStep
  requirementSource?: string
}
export interface IFuelType {
  id?: string
  key: EFuelType
  description: string
  emissionsFactor: string
  source: string
}

export interface IEnergyOutput {
  id?: string
  source: EEnergyOutputSource
  useType: EEnergyOutputUseType
  annualEnergy: string
  name: string | null
  fuelTypeId: string | null
}

export interface IMakeUpAirFuel {
  id?: string
  fuelTypeId: string
  percentOfLoad: string | number // string if its coming from the API, number if it's a form field
}

export interface IDocumentReference {
  id?: string
  documentType: EDocumentReferenceDocumentType
  documentTypeDescription?: string | null
  issuedFor?: string | null
  documentName?: string | null
  dateIssued?: number | null | Date
  preparedBy?: string | null
}

type TNavLinkSection = "overview" | "compliance" | "results"

export interface IPart3NavLink {
  key: TPart3NavLinkKey
  location: string
  subLinks: IPart3NavLink[]
  section?: TNavLinkSection
}
export interface IPart3NavSection {
  key: TPart3NavSectionKey
  navLinks: IPart3NavLink[]
}

export interface IPart3SectionCompletionStatusEntry {
  complete: boolean
  relevant: boolean
}

export interface IPart3SectionCompletionStatus {
  start: IPart3SectionCompletionStatusEntry
  projectDetails: IPart3SectionCompletionStatusEntry
  locationDetails: IPart3SectionCompletionStatusEntry
  baselineOccupancies: IPart3SectionCompletionStatusEntry
  baselineDetails: IPart3SectionCompletionStatusEntry
  districtEnergy: IPart3SectionCompletionStatusEntry
  fuelTypes: IPart3SectionCompletionStatusEntry
  additionalFuelTypes: IPart3SectionCompletionStatusEntry
  baselinePerformance: IPart3SectionCompletionStatusEntry
  stepCodeOccupancies: IPart3SectionCompletionStatusEntry
  stepCodePerformanceRequirements: IPart3SectionCompletionStatusEntry
  modelledOutputs: IPart3SectionCompletionStatusEntry
  renewableEnergy: IPart3SectionCompletionStatusEntry
  overheatingRequirements: IPart3SectionCompletionStatusEntry
  residentialAdjustments: IPart3SectionCompletionStatusEntry
  documentReferences: IPart3SectionCompletionStatusEntry
  performanceCharacteristics: IPart3SectionCompletionStatusEntry
  hvac: IPart3SectionCompletionStatusEntry
  contact: IPart3SectionCompletionStatusEntry
  requirementsSummary: IPart3SectionCompletionStatusEntry
  stepCodeSummary: IPart3SectionCompletionStatusEntry
}

export type TPart3NavLinkKey = keyof IPart3SectionCompletionStatus
export type TPart3NavSectionKey = "overview" | "compliance" | "results"

// Define the base structure shared by both metric types
interface IPart3ComplianceMetricsBase {
  modelled_floor_area?: string
  teui: string
  ghgi: string
  totalEnergy?: string
  occupancy?: EStepCodeOccupancyKey
  energyStepAchieved?: EEnergyStep
  zeroCarbonStepAchieved?: EZeroCarbonStep
  performanceRequirementAchieved?: EBaselinePerformanceRequirement
}

// Type where TEDI is expected to be a simple string (e.g., for requirements)
export interface IPart3ComplianceMetrics extends IPart3ComplianceMetricsBase {
  tedi: string
}

// Type where TEDI can be an object with an optional wholeBuilding property (e.g., for adjustedResults, complianceSummary)
export interface IPart3ComplianceMetricsNestedTEDI extends IPart3ComplianceMetricsBase {
  tedi?: {
    wholeBuilding?: string
    stepCodePortion?: string
  }
}

interface IPart3StepCodeComplianceRequirements {
  areaWeightedTotals: IPart3ComplianceMetrics // Assuming string tedi, adjust if needed
  occupanciesRequirements: IPart3ComplianceMetrics[] // Assuming string tedi, adjust if needed
}
// Update IPart3ComplianceReportRequirements to use the specific type for wholeBuilding
interface IPart3ComplianceReportRequirements {
  baselinePortions: IPart3ComplianceMetrics // Assuming string tedi, adjust if needed
  stepCodePortions: IPart3StepCodeComplianceRequirements // References IPart3ComplianceMetrics
  wholeBuilding: IPart3ComplianceMetrics // Use the type with string tedi
}

// Update IPart3ComplianceReportPerformance to use the correct types
interface IPart3ComplianceReportPerformance {
  requirements: IPart3ComplianceReportRequirements
  // Assuming these also use the nested structure based on adjusted/compliance. Adjust if needed.
  resultsAsModelled: IPart3ComplianceMetricsNestedTEDI
  corridorPressurizedAdjustment: IPart3ComplianceMetricsNestedTEDI
  suiteSubMeteringAdjustment: IPart3ComplianceMetricsNestedTEDI
  // Explicitly use the nested TEDI type based on component usage
  adjustedResults: IPart3ComplianceMetricsNestedTEDI
  complianceSummary: IPart3ComplianceMetricsNestedTEDI
}

export interface IPart3ComplianceReport {
  performance: IPart3ComplianceReportPerformance
}

interface IFormIOComponent {
  type: string
  key: string
  id?: string
  label?: string
  input: boolean
  tableView?: boolean
  components?: IFormIOComponent[]
  columns?: IFormIOComponent[]
  // Common optional properties
  validate?: { required?: boolean; [key: string]: any }
  conditional?: any
  customConditional?: string
  widget?: any
  customClass?: string
  disabled?: boolean
  hidden?: boolean
  multiple?: boolean
  persistent?: boolean | string
  html?: string
  action?: string
  custom?: string
  defaultValue?: any
  placeholder?: string
  prefix?: string
  suffix?: string
  clearOnHide?: boolean
  unique?: boolean
  protected?: boolean
  [key: string]: any // Allow additional properties for component-specific fields
}

export interface IRequirementTemplateFormJson {
  id: string
  legend: string
  key: string
  label: string
  input: boolean
  tableView: boolean
  components: IFormIOComponent[]
}
