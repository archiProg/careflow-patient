import { LoginPayloadModel } from "../types/LoginModel";
import { RegisterPayloadModel } from "../types/RegisterPayloadModel";
import { getApiJwt, postApi } from "./Client";

export const loginIdCardApi = (payload: LoginPayloadModel) =>
  postApi("/loginfaceid", JSON.stringify(payload));

export const authenMeApi = (token: string) => getApiJwt("/authme", token);

export const registerApi = (payload: RegisterPayloadModel) =>
  postApi("/register", "", payload.head, payload.file);

export const checkEmailApi = (payload: { email: string }) =>
  postApi("/check-email", JSON.stringify(payload));
