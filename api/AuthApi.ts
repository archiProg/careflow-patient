import { LoginPayloadModel } from "../types/LoginModel";
import { getApiJwt, postApi } from "./Client";

export const loginIdCardApi = (payload: LoginPayloadModel) =>
  postApi("/loginfaceid", JSON.stringify(payload));

export const authenMeApi = (token: string) => getApiJwt("/authme", token);
