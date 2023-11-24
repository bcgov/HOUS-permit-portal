import { IUser } from "../models/user"

export interface IUserResponse {
  data: IUser
  meta: {}
}

export interface IResetPasswordResponse {
  data: {}
  meta: {
    redirectUrl: string
  }
}
