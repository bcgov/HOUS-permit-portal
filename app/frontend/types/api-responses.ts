import { IJurisdiction } from "../models/jurisdiction"
import { IRequirementBlock } from "../models/requirement-block"
import { IUser } from "../models/user"

export interface IApiResponse<TData, TMeta> {
  data: TData
  meta: TMeta
}

export interface IUserResponse extends IApiResponse<IUser, {}> {}

export interface IRequirementBlockResponse
  extends IApiResponse<
    IRequirementBlock[],
    {
      totalPages: number
      totalCount: number
      currentPage: number
    }
  > {}

export interface IJurisdictionResponse
  extends IApiResponse<
    IJurisdiction[],
    {
      totalPages: number
      totalCount: number
      currentPage: number
    }
  > {}

export interface IJurisdictionUserResponse
  extends IApiResponse<
    IUser[],
    {
      totalPages: number
      totalCount: number
      currentPage: number
    }
  > {}

export interface IResetPasswordResponse extends IApiResponse<{}, { redirectUrl: string }> {}

export interface IAcceptInvitationResponse extends IApiResponse<{}, { redirectUrl: string }> {}

export interface IInvitationResponse extends IApiResponse<{ invited: IUser[]; emailTaken: IUser[] }, {}> {}
