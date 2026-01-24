import { LoginPayloadModel } from "../types/LoginPayloadModel";
import { postApi } from "./Client";

export const loginIdCardApi = (payload: LoginPayloadModel) =>
  postApi("/loginfaceid", JSON.stringify(payload));
