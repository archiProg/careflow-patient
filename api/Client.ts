import Provider from "@/services/providerService";
import { ApiResponseModel } from "@/types/ApiResponseModel";
import axios, { AxiosRequestConfig } from "axios";
import { Platform } from "react-native";

/* ================= Axios Instance ================= */
const api = axios.create({
  baseURL: Provider.API_URL,
  timeout: 60000,
});

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
  const result: ApiResponseModel = { success: false, response: "", code: 500 };
  console.log("headers", headers);
  console.log("jsonData", jsonData);
  console.log("files", files);
  console.log("endpoint", endpoint);
  try {
    let data: any;
    let config: AxiosRequestConfig = { headers: { ...headers } };

    if (files || headers) {

      const formData = new FormData();

      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      if (files) {
        Object.entries(files).forEach(([key, uri]) => {
          formData.append(key, {
            uri,
            name: "image.jpg",
            type: "image/jpeg",
          } as any);
        });
      }

      data = formData;
      config.headers!["Content-Type"] = "multipart/form-data";
    }
    else {
      data = jsonData;
      config.headers!["Content-Type"] = "application/json";
    }


    const res = await api.post(endpoint, data, config);
    result.success = true;
    result.response = JSON.stringify(res.data);
    result.code = res.status;
    return result;
  } catch (err: any) {
    result.response = err.response
      ? `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : `Exception: ${err.message}`;
    result.code = err.response.status;
    return result;
  }
};

/* ================= POST JWT ================= */
export const postApiJwt = async (
  endpoint: string,
  jsonData: string = "",
  token: string,
  headers?: Record<string, string>,
  files?: Record<string, string>,
): Promise<ApiResponseModel> => {

  return postApi(
    endpoint,
    jsonData,
    {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
    files,
  );
};

/* ================= GET ================= */
export const getApi = async (
  endpoint: string,
  headers?: Record<string, string>,
): Promise<ApiResponseModel> => {
  const result: ApiResponseModel = { success: false, response: "", code: 500 };

  try {
    const res = await api.get(endpoint, { headers });
    result.success = true;
    result.response = JSON.stringify(res.data);
    result.code = res.status;
    return result;
  } catch (err: any) {
    result.response = err.response
      ? `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : `Exception: ${err.message}`;
    result.code = err.response.status;
    return result;
  }
};

/* ================= GET JWT ================= */
export const getApiJwt = async (
  endpoint: string,
  token: string,
  headers?: Record<string, string>,
): Promise<ApiResponseModel> => {

  return getApi(endpoint, {
    ...headers,
    Authorization: `Bearer ${token}`,
  });
};
