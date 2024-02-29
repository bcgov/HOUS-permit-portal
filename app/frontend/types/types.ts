import { IActivity, IPermitType } from "../models/permit-classification"
import { ENumberUnit, ERequirementType, ESortDirection } from "./enums"

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
