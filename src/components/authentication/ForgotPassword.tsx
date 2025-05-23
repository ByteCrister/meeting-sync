"use client";

import { Dispatch, JSX, SetStateAction, useState } from "react";
import { useFormik } from "formik";
import { IoEyeSharp } from "react-icons/io5";
import { IoEyeOffSharp } from "react-icons/io5";
import { Open_Sans } from "next/font/google";
import { userSignInType, userSignUpType } from "@/types/client-types";
import {
    forgotPassEmailValidation,
    forgotPassPasswordValidation,
} from "@/utils/client/others/auth-validation";
import apiService from "@/utils/client/api/api-services";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";

const openSans = Open_Sans({
    weight: "400",
    subsets: ["latin"],
});

// Prop Types
type ForgotPasswordPropTypes = {
    setPageState: Dispatch<SetStateAction<number>>;
    setUserInfo: Dispatch<
        SetStateAction<userSignUpType | userSignInType | undefined>
    >;
    isEmailChecked: boolean;
    userInfo: userSignUpType | userSignInType | undefined;
};

const ForgotPassword = ({
    setPageState,
    setUserInfo,
    userInfo,
    isEmailChecked,
}: ForgotPasswordPropTypes) => {
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            [isEmailChecked ? "password" : "email"]: "",
        },
        validationSchema: isEmailChecked
            ? forgotPassPasswordValidation
            : forgotPassEmailValidation,
        onSubmit: async (values) => {
            if (isEmailChecked) {
                setIsButtonLoading(true);
                if (!isButtonLoading) {
                    const data: { email: string | undefined; password: string } = {
                        email: userInfo?.email,
                        password: values.password,
                    };
                    await forgotPasswordApi(data);
                }
            } else {
                setIsButtonLoading(true);
                if (!isButtonLoading) {
                    const data = { ...values };

                    const updatedUserInfo: userSignInType = {
                        email: values.email,
                        password: userInfo?.password || "",
                    };
                    const resData = await apiService.post(
                        `/api/auth/user/auth-forgot-password`,
                        data
                    );
                    if (resData.success) {
                        setUserInfo(updatedUserInfo);
                        setPageState(1);
                    }
                }
                setIsButtonLoading(false);
            }
        },
    });

    // * Api function for sign In
    const forgotPasswordApi = async (data: {
        email?: string;
        password: string;
    }) => {
        const resData = await apiService.post(
            `/api/auth/user/forgot-password`,
            data
        );
        if (resData.success) {
            ShowToaster("Password Updated successfully.", "success");
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        }
        setIsButtonLoading(true);
    };

    const getValidationString = (
        field: keyof typeof formik.initialValues
    ): JSX.Element => {
        return formik.touched[field] && formik.errors[field] ? (
            <span className="text-red-500 font-semibold text-sm">
                <sup>*</sup>
                {formik.errors[field]}
            </span>
        ) : (
            <label
                htmlFor={field + ""}
                className="text-slate-500 font-medium text-sm"
            >
                <b className="capitalize">
                    <sup>*</sup>
                    {field}
                </b>
            </label>
        );
    };

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col items-center gap-4 w-full"
        >
            {isEmailChecked ? (
                <section className="w-full">
                    {getValidationString("password")}
                    <div
                        className={`flex justify-between bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3.5 outline-none border border-gray-100 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all duration-300 ${openSans.className} font-medium text-gray-700 shadow-sm`}
                    >
                        <input
                            type={isPasswordShow ? "text" : "password"}
                            name="password"
                            id="password"
                            required
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="New Password"
                            value={formik.values.password}
                            className={`w-full bg-transparent outline-none placeholder:text-gray-400`}
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsPasswordShow((prev) => !prev);
                            }}
                            className="text-gray-500 hover:text-gray-600 transition-colors duration-200"
                        >
                            {isPasswordShow ? (
                                <IoEyeSharp className="text-xl" />
                            ) : (
                                <IoEyeOffSharp className="text-xl" />
                            )}
                        </button>
                    </div>
                </section>
            ) : (
                <div className="w-full">
                    {getValidationString("email")}
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        placeholder="Email"
                        className={`w-full bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3.5 outline-none border border-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-300 ${openSans.className} font-medium text-gray-700 placeholder:text-gray-400 shadow-sm`}
                    ></input>
                </div>
            )}
            <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-800 to-gray-600 px-4 py-3.5 font-semibold rounded-xl text-white hover:from-gray-700 hover:to-gray-500 transform hover:scale-[1.02] transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
            >
                {isButtonLoading ? (
                    <LoadingSpinner border="border-white" />
                ) : (
                    <span>{isEmailChecked ? "Submit New Password" : "Submit Email"}</span>
                )}
            </button>
        </form>
    );
};
export default ForgotPassword;
