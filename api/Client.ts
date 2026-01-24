import { API_URL } from "@/constants/host";
import { ApiResponseModel } from "@/types/ApiResponseModel";
import { JWT } from "@/utils/jwt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig } from "axios";
import { Platform } from "react-native";

/* ================= Axios Instance ================= */
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

/* ================= JWT ================= */
export const refreshJwt = async (): Promise<boolean> => {
  const email = await AsyncStorage.getItem("email");
  const password = await AsyncStorage.getItem("password");

  if (!email || !password) return false;

  try {
    const res = await api.post("/login", { email, password });
    if (res.data?.token) {
      JWT.setToken(res.data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/* ================= Helper ================= */
const buildFormData = (files?: Record<string, string>) => {
  if (!files) return null;

  const formData = new FormData();
  for (const key in files) {
    formData.append(key, {
      uri: Platform.OS === "ios" ? files[key] : `file://${files[key]}`,
      type: "application/octet-stream",
      name: key,
    } as any);
  }
  return formData;
};

/* ================= POST ================= */
export const postApi = async (
  endpoint: string,
  jsonData: string = "",
  headers?: Record<string, string>,
  files?: Record<string, string>,
): Promise<ApiResponseModel> => {
  const result: ApiResponseModel = { success: false, response: "" };

  try {
    let data: any;
    let config: AxiosRequestConfig = { headers: { ...headers } };

    if (files) {
      data = buildFormData(files);
      config.headers!["Content-Type"] = "multipart/form-data";
    } else if (jsonData) {
      data = JSON.parse(jsonData);
      config.headers!["Content-Type"] = "application/json";
    }

    const res = await api.post(endpoint, data, config);
    result.success = true;
    result.response = JSON.stringify(res.data);
    return result;
  } catch (err: any) {
    result.response = err.response
      ? `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : `Exception: ${err.message}`;
    return result;
  }
};

/* ================= POST JWT ================= */
export const postApiJwt = async (
  endpoint: string,
  jsonData: string = "",
  headers?: Record<string, string>,
  files?: Record<string, string>,
): Promise<ApiResponseModel> => {
  const result: ApiResponseModel = { success: false, response: "" };

  if (JWT.expire === 0 || JWT.expire <= Date.now() / 1000) {
    const ok = await refreshJwt();
    if (!ok) {
      result.response = "JWT Error";
      return result;
    }
  }

  return postApi(
    endpoint,
    jsonData,
    {
      ...headers,
      Authorization: `Bearer ${JWT.token}`,
    },
    files,
  );
};

/* ================= GET ================= */
export const getApi = async (
  endpoint: string,
  headers?: Record<string, string>,
): Promise<ApiResponseModel> => {
  const result: ApiResponseModel = { success: false, response: "" };

  try {
    const res = await api.get(endpoint, { headers });
    result.success = true;
    result.response = JSON.stringify(res.data);
    return result;
  } catch (err: any) {
    result.response = err.response
      ? `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : `Exception: ${err.message}`;
    return result;
  }
};

/* ================= GET JWT ================= */
export const getApiJwt = async (
  endpoint: string,
  headers?: Record<string, string>,
): Promise<ApiResponseModel> => {
  const result: ApiResponseModel = { success: false, response: "" };

  if (JWT.expire === 0 || JWT.expire <= Date.now() / 1000) {
    const ok = await refreshJwt();
    if (!ok) {
      result.response = "JWT Error";
      return result;
    }
  }

  return getApi(endpoint, {
    ...headers,
    Authorization: `Bearer ${JWT.token}`,
  });
};
