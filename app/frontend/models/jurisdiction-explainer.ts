import { IOption } from "../types/types"
import { IExplainer } from "./explainer"

export interface IJurisdictionExplainer {
  id: string
  jurisdictionId: string
  localContextHtml: string
  updatedAt: string
  name: string
  qualifiedName: string
}

export interface IExplainerLoadResult {
  explainer: IExplainer | null
  relatedTemplateOptions: IOption[]
  jurisdictionExplainers: IJurisdictionExplainer[]
}

export interface IJurisdictionExplainerLoadResult {
  localContextHtml: string
  updatedAt: string | null
}
