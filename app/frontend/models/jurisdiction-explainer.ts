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

export interface IExplainerPermit {
  id: string
  nickname: string | null
  description: string | null
}

export interface IExplainerLoadResult {
  explainer: IExplainer | null
  relatedTemplateOptions: IOption[]
  jurisdictionExplainers: IJurisdictionExplainer[]
  permit?: IExplainerPermit | null
  relatedPermits?: IExplainerPermit[]
}

export interface IJurisdictionExplainerLoadResult {
  localContextHtml: string
  updatedAt: string | null
}
