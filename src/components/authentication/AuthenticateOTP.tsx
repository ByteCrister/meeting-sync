"use client";

import { useTimer } from "react-timer-hook";
import { userSignInType, userSignUpType } from "@/types/client-types";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";
import apiService from "@/utils/client/api/api-services";
import { getFormattedTimeZone } from "@/utils/client/date-formatting/getFormattedTimeZone";
import GetOtpBoxes from "./auth-component/GetOtpBoxes";
import getDeviceInfo from "@/utils/client/others/getDeviceInfo";

type AuthenticateOTPPropTypes = {
    userInfo: (userSignUpType & { isRemember: boolean }) | userSignInType | undefined;
    setIsEmailChecked: Dispatch<SetStateAction<boolean>>;
    setCurrentAuthPage: Dispatch<SetStateAction<0 | 2 | 1>>;
    setPageState: Dispatch<SetStateAction<number>>
};

const AuthenticateOTP = ({ userInfo, setIsEmailChecked, setCurrentAuthPage, setPageState }: AuthenticateOTPPropTypes) => {
    const [otp, setOtp] = useState<string>("");
    const [enteredOtp, setEnteredOtp] = useState<string[]>(Array(6).fill(""));
    const [currOtpBox, setCurrOtpBox] = useState<number>(0);
    const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
    const [isOTPSend, setIsOTPSend] = useState<boolean>(false);

    // Set the expiry time (3 minutes from now)
    const expiryTime = useMemo(() => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + 180);
        return time;
    }, []); // only on mount

    const { seconds, minutes, restart } = useTimer({
        expiryTimestamp: expiryTime,
        onExpire: () => {
            setIsOtpExpired(true);
            ShowToaster("OTP expired. Please request a new one.", 'error');
        }
    });

    const handleGenerateOtp = async () => {
        setIsOTPSend(true);

        const devicesInfo = getDeviceInfo();

        const URI = `/api/auth/user/user-otp`;
        const responseData = await apiService.get(URI, {
            email: encodeURIComponent(JSON.stringify(userInfo?.email)), 
            devicesInfo: encodeURIComponent(JSON.stringify(devicesInfo))
        });
        if (responseData.success) {
            setOtp(responseData.data);
            ShowToaster("OTP is sent to your email.", "success");
        }

        // Reset timer
        // Restart the timer
        const newTime = new Date();
        newTime.setSeconds(newTime.getSeconds() + 180);
        restart(newTime);
        setIsOtpExpired(false);
    };

    useEffect(() => {
        if (!userInfo?.email || isOTPSend) return; // Prevent duplicate requests
        setIsOTPSend(true);
        handleGenerateOtp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo]); // Only trigger when userInfo changes



    // * Api function for sign Up
    const signUpApi = async () => {
        const resData = await apiService.post(`/api/auth/user/signup`, { ...userInfo, timeZone: getFormattedTimeZone() });
        if (resData.success) {
            ShowToaster('Successfully registered.', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        }
    };


    // * Handle input change for OTP boxes
    const handleOtpChange = (value: string, index: number) => {
        if (/^\d$/.test(value) && !isOtpExpired) {
            setEnteredOtp((prevOtp) => {
                const newOtp = [...prevOtp];
                newOtp[index] = value;
                return newOtp;
            });

            if (index < 5) setCurrOtpBox(index + 1);
        }
    };


    // * Handle backspace for OTP boxes
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !isOtpExpired) {
            e.preventDefault();
            const newOtp = [...enteredOtp];

            if (enteredOtp[index] !== "") {
                newOtp[index] = "";
                setEnteredOtp(newOtp);
            } else if (index > 0) {
                newOtp[index - 1] = "";
                setEnteredOtp(newOtp);
                setCurrOtpBox(index - 1);
            }
        }
    };

    // * OTP verification logic
    const verifyOtp = async () => {
        const enteredOptStr = enteredOtp.join("");
        if (otp.trim().length !== 0 && enteredOptStr === otp) {
            ShowToaster("OTP verified successfully!", "success");
            if (userInfo && "username" in userInfo) {
                signUpApi();
            } else {
                setIsEmailChecked(true);
                setCurrentAuthPage(2);
                setPageState(0);
            }

        } else {
            ShowToaster("OTP is not matched. Please check again.", "error",);
        }
    };

    return (
        <section className="w-full h-52 flex flex-col gap-3.5 justify-center items-center backdrop-blur-md shadow-2xl p-6 rounded">
            <h1 className="text-2xl font-semibold text-gray-800 text-center">
                Enter the OTP sent to your email.
            </h1>
            <GetOtpBoxes
                enteredOtp={enteredOtp}
                currOtpBox={currOtpBox}
                handleOtpChange={handleOtpChange}
                handleKeyDown={handleKeyDown}
                isOtpExpired={isOtpExpired}
            />
            <div className="text-center text-gray-800 mt-4">
                {isOTPSend ? (
                    <p>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</p>
                ) : (
                    <p>Sending OTP...</p>
                )}
            </div>
            {
                !isOtpExpired ? <button
                    onClick={() => verifyOtp()}
                    disabled={isOtpExpired}
                    className="px-2 py-1 bg-slate-600 font-semibold font-poppins text-white rounded hover:bg-slate-400 transition duration-300 ease-in-out cursor-pointer"
                >
                    Verify OTP
                </button>
                    : <button
                        onClick={() => handleGenerateOtp()}
                        className="px-2 py-1 bg-slate-600 font-semibold font-poppins text-white rounded hover:bg-slate-400 transition duration-300 ease-in-out cursor-pointer"
                    >
                        Resend OTP
                    </button>
            }
        </section>
    );
};

export default AuthenticateOTP;