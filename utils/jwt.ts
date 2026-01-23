import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
    exp: number;
    iat?: number;
    sub?: string;
    role?: string;
    [key: string]: any;
}

export class JWT {
    static token: string = "";
    static refreshToken: string = "";
    static expire: number = 0;

    /** get exp from jwt */
    static getJwtExp(token: string): number {
        const payload = jwtDecode<JwtPayload>(token);

        if (!payload.exp) {
            throw new Error("exp not found");
        }

        return payload.exp;
    }

    /** set token & expire */
    static setToken(token: string): void {
        this.token = token;
        this.expire = this.getJwtExp(token);
    }

    /** check token expired */
    static isExpired(): boolean {
        if (!this.expire) return true;
        const now = Math.floor(Date.now() / 1000);
        return this.expire <= now;
    }

    

    /** clear token */
    static clear(): void {
        this.token = "";
        this.refreshToken = "";
        this.expire = 0;
    }
}
