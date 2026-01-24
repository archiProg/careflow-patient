import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  exp: number;
  iat?: number;
  sub?: string;
  role?: string;
  [key: string]: any;
}

export const getJwtExp = (token: string): number => {
  const payload = jwtDecode<JwtPayload>(token);

  if (!payload.exp) {
    throw new Error("exp not found");
  }

  return payload.exp;
};
