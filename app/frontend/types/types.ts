import { ESortDirection } from "./enums"

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

export enum ENumberUnit {
  noUnit = "noUnit",
  mm = "mm",
  cm = "cm",
  m = "m",
  in = "in",
  ft = "ft",
  mi = "mi",
}
