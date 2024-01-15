import { ETagType } from "./enums"

export interface IRequirementBlockParams {
  name: string
  description?: string
  associationList?: string[]
}

export interface ITagSearchParams {
  query?: string
  taggableTypes?: Array<ETagType>
}
