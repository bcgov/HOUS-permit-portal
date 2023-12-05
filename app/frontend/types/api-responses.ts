import { IUser } from "../models/user"

export interface IApiResponse<TData, TMeta> {
  data: TData
  meta: TMeta
}

export interface IUserResponse extends IApiResponse<IUser, {}> {}

export interface IResetPasswordResponse extends IApiResponse<{}, { redirectUrl: string }> {}
