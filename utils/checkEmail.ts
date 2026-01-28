import { CheckEmailResponse } from "@/types/CheckEmailModel";
import { checkEmailApi } from "../api/AuthApi";

const CheckEmail = async (email: string): Promise<CheckEmailResponse> => {
    const body = { email };
    try {
        const response = await checkEmailApi(body);
        if (!response.success) {
            if (response.code == 401) {
                return { message: response.response, status: 0 };
            }
            return { message: response.response, status: -1 };
        }

        let getResponse: CheckEmailResponse;

        getResponse = JSON.parse(response.response);

        if (getResponse != null) {
            return getResponse;
        } else {
            return { message: "Server error", status: -1 };
        }
    } catch (error) {
        console.error("checkEmail error:", error);
        return { message: "Server error", status: -1 };
    }
}


const CheckFormmartEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export { CheckEmail, CheckFormmartEmail };

