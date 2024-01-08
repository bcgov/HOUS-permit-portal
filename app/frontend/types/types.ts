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
