import { getApiJwt } from "./Client";

export const getDoctorSpecialty = (token: string) => getApiJwt("/getspecialty", token);
