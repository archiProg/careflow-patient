export interface ApiResponseModel {
    success: boolean;
    response: string;
    code: number;
}


export interface ErrorResponseModel {
    response: string;
    th: string;
    en: string;
}