import { UserModel } from "./UserModel";

export interface LoginPayloadModel {
  action?: string;
  content?: {
    id_card?: string;
  };
}

export interface LoginResponseModel {
  token: string;
  user: UserModel;
  message: string;
}
