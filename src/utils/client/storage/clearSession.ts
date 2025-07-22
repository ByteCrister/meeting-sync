import { Session } from "@/utils/constants";

export const clearSession = () => {
    sessionStorage.removeItem(Session.OTP);
    sessionStorage.removeItem(Session.ENTERED_OTP);
    sessionStorage.removeItem(Session.IS_OTP_EXPIRED);
    sessionStorage.removeItem(Session.IS_OTP_SEND);
    sessionStorage.removeItem(Session.OTP_EXPIRY_TIME);
    sessionStorage.removeItem(Session.AUTH_PAGE_STATE);
    sessionStorage.removeItem(Session.USER_INFO);
}