import { IPermitApplication } from "../models/permit-application"
import { IActivity, IPermitType } from "../models/permit-classification"
import {
  EAutoComplianceModule,
  EAutoComplianceType,
  EDoorsPerformanceType,
  EEnabledElectiveFieldReason,
  EEnergyStep,
  EFossilFuelsPresence,
  EHotWaterPerformanceType,
  ENumberUnit,
  ERequirementType,
  ESZeroCarbonStep,
  ESocketDomainTypes,
  ESocketEventTypes,
  ESortDirection,
  ESpaceHeatingCoolingPerformanceType,
  EStepCodeAirtightnessValue,
  EStepCodeBuildingType,
  EStepCodeCompliancePath,
  EStepCodeEPCTestingTargetType,
  EWindowsGlazedDoorsPerformanceType,
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

export type TSearchParams<IModelSortFields> = {
  sort?: ISort<IModelSortFields>
  query?: string
  page?: number
  perPage?: number
  showArchived?: boolean
  statusFilter?: string
}

export type TComputedCompliance = {
  module: EAutoComplianceModule
  value?: string
  valueOn?: string
  trigger?: string
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
  id: string
  key: string
  type: string
  input: true
  validation: { required: boolean }
  label: string
  widget?: any
}

export interface ISubmissionData {
  data: any[]
}

export interface IDenormalizedRequirement {
  id: string
  label: string
  inputType: ERequirementType
  inputOptions: IRequirementOptions
  hint?: string | null
  elective?: boolean
  required?: boolean
}

export interface IDenormalizedRequirementBlock {
  id: string
  name: string
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
  description?: string
  permitType: IPermitType
  activity: IActivity
  requirementTemplateSections: IDenormalizedRequirementTemplateSection[]
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
  zeroCarbonSteps: ESZeroCarbonStep[]
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
  content: string
}

export interface INotification {
  title: string
  description: string
  at: string
}

export interface IPermitApplicationUpdate {
  id
  frontEndFormUpdate: Object
  formattedComplianceData: Object
}

export interface IUserPushPayload {
  domain: ESocketDomainTypes
  eventType: ESocketEventTypes
  data: INotification | IPermitApplicationUpdate
}

export interface ISiteConfiguration {
  displaySitewideMessage: boolean
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

interface ICommonAutoComplianceModuleOption<EModule extends EAutoComplianceModule> {
  module: EModule
  type: EAutoComplianceType
  label: string
  availableOnInputTypes: ERequirementType[]
  defaultSettings?: Object
}

type TAutoComplianceValueExtractorOption<EModule extends EAutoComplianceModule> =
  ICommonAutoComplianceModuleOption<EModule> & {
    type: EAutoComplianceType.externalValueExtractor | EAutoComplianceType.internalValueExtractor
    availableFields: Array<
      IOption<string> & {
        availableOnInputTypes: ERequirementType[]
      }
    >
  }

export interface IDigitalSealValidatorModuleOption
  extends ICommonAutoComplianceModuleOption<EAutoComplianceModule.DigitalSealValidator> {}

export interface IParcelInfoExtractorModuleOption
  extends TAutoComplianceValueExtractorOption<EAutoComplianceModule.ParcelInfoExtractor> {
  type: EAutoComplianceType.externalValueExtractor
}

export interface IPermitApplicationModuleOption
  extends TAutoComplianceValueExtractorOption<EAutoComplianceModule.PermitApplication> {
  type: EAutoComplianceType.internalValueExtractor
}

export type TValueExtractorAutoComplianceModuleOption =
  | IParcelInfoExtractorModuleOption
  | IPermitApplicationModuleOption

export type TAutoComplianceModuleOptions = {
  [EAutoComplianceModule.DigitalSealValidator]: IDigitalSealValidatorModuleOption
  [EAutoComplianceModule.ParcelInfoExtractor]: IParcelInfoExtractorModuleOption
  [EAutoComplianceModule.PermitApplication]: IPermitApplicationModuleOption
}
