import { IPermitApplication } from "../models/permit-application"
import { IActivity, IPermitType } from "../models/permit-classification"
import {
  EDoorsPerformanceType,
  EFossilFuelsPresence,
  EHotWaterPerformanceType,
  ENumberUnit,
  ERequirementType,
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
  name: string
  department: string
  title?: string
  phoneNumber?: string
  email?: string
  createdAt?: number | string // has to allow string to stop errors with useFieldArray
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

export interface IRequirementOptions {
  valueOptions?: IOption[]
  numberUnit?: ENumberUnit
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
}

export interface IRequirementBlockCustomization {
  tip?: string
  enabledElectiveFieldIds?: Array<string>
}

export interface ITemplateCustomization {
  requirementBlockChanges?: Record<string, IRequirementBlockCustomization>
}

export interface IDownloadableFile {
  fileUrl: string
  fileName: string
  fileSize: number
}
