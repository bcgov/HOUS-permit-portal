import { ICollaborator } from "../models/collaborator"
import { IJurisdiction } from "../models/jurisdiction"
import { IPermitApplication } from "../models/permit-application"
import { IRequirementBlock } from "../models/requirement-block"
import { IRequirementTemplate } from "../models/requirement-template"
import { IUser } from "../models/user"
import { INotification, IOption, ITemplateVersionDiff } from "./types"

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

export interface IUsersResponse extends IApiResponse<IUser[], IPageMeta> {}

export interface IJurisdictionPermitApplicationResponse extends IApiResponse<IPermitApplication[], IPageMeta> {}

export interface ICollaboratorSearchResponse extends IApiResponse<ICollaborator[], IPageMeta> {}

export interface IAcceptInvitationResponse extends IApiResponse<{}, { redirectUrl: string }> {}

export interface IInvitationResponse
  extends IApiResponse<{ invited: IUser[]; reinvited: IUser[]; emailTaken: IUser[] }, {}> {}

export interface IOptionResponse<T = string> extends IApiResponse<IOption<T>[], IPageMeta> {}

export interface INotificationResponse {
  data: INotification[]
  meta: { unreadCount: number; totalPages: number }
}

export interface ITemplateVersionDiffResponse {
  data: ITemplateVersionDiff
}
