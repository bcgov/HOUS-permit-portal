import { IJurisdiction } from "../models/jurisdiction"
import { IPermitApplication } from "../models/permit-application"
import { IRequirementBlock } from "../models/requirement-block"
import { IRequirementTemplate } from "../models/requirement-template"
import { IUser } from "../models/user"
import { IOption } from "./types"

export interface IApiResponse<TData, TMeta> {
  data: TData
  meta: TMeta
}

export interface IPageMeta {
  totalPages: number
  totalCount: number
  currentPage: number
}

export interface IUserResponse extends IApiResponse<IUser, {}> {}

export interface IRequirementBlockResponse extends IApiResponse<IRequirementBlock[], IPageMeta> {}

export interface IRequirementTemplateResponse extends IApiResponse<IRequirementTemplate[], IPageMeta> {}

export interface IJurisdictionResponse extends IApiResponse<IJurisdiction[], IPageMeta> {}

export interface IJurisdictionUserResponse extends IApiResponse<IUser[], IPageMeta> {}

export interface IJurisdictionPermitApplicationResponse extends IApiResponse<IPermitApplication[], IPageMeta> {}

export interface IResetPasswordResponse extends IApiResponse<{}, { redirectUrl: string }> {}

export interface IAcceptInvitationResponse extends IApiResponse<{}, { redirectUrl: string }> {}

export interface IInvitationResponse extends IApiResponse<{ invited: IUser[]; emailTaken: IUser[] }, {}> {}

export interface IOptionResponse<T = string> extends IApiResponse<IOption<T>[], IPageMeta> {}
