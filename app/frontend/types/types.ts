import { ENumberUnit, ESortDirection } from "./enums"

export type TLatLngTuple = [number, number]

export interface IContact {
  name: string
  firstNation?: string
  title?: string
  phone?: string
  email?: string
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
