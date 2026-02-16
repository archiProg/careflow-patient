import { CheckEmailResponse } from "@/types/CheckEmailModel";
import { checkEmailApi } from "../api/AuthApi";

const CheckEmail = async (email: string): Promise<CheckEmailResponse> => {
    const body = { email };
    try {
        const res = await checkEmailApi(body);
        if (!res.success) {
            let getResponse: CheckEmailResponse;

            getResponse = JSON.parse(res.response);
            return { message: getResponse.toString(), th: getResponse.th || "", en: getResponse.en || "", status: -1 };
        }


        let getResponse: CheckEmailResponse;

        getResponse = JSON.parse(res.response);

        if (getResponse != null) {
            return { message: getResponse.toString(), th: getResponse.th, en: getResponse.en, status: 0 };
        } else {
            return { message: "Server error", th: "เกิดข้อผิดพลาดจากระบบ", en: "Server error", status: -1 };
        }
    } catch (error) {
        console.error("checkEmail error:", error);
        return { message: "Server error", th: "เกิดข้อผิดพลาดจากระบบ", en: "Server error", status: -1 };
    }
}


const CheckFormmartEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export { CheckEmail, CheckFormmartEmail };

