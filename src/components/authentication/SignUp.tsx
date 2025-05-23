"use client";

import { Dispatch, JSX, SetStateAction, useState } from "react";
import { useFormik } from "formik";
import { IoEyeSharp } from "react-icons/io5";
import { IoEyeOffSharp } from "react-icons/io5";
import { signUpValidation } from "@/utils/client/others/auth-validation";
import apiService from "@/utils/client/api/api-services";
import { userSignInType, userSignUpType } from "@/types/client-types";
import { Open_Sans } from "next/font/google";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import { Checkbox } from "../ui/checkbox";

const openSans = Open_Sans({
    weight: "400",
    subsets: ["latin"],
});

// Prop Types
type SignUpProps = {
    setPageState: Dispatch<SetStateAction<number>>;
    setUserInfo: Dispatch<SetStateAction<(userSignUpType & { isRemember: boolean }) | userSignInType | undefined>>;
};
const SignUp = ({ setPageState, setUserInfo }: SignUpProps) => {
    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [isConfirmStage, setIsConfirmStage] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);

    const formik = useFormik({
        initialValues: {
            full_name: "",
            email: "",
            password: "",
            confirm_password: "",
        },
        validationSchema: signUpValidation(isConfirmStage),
        onSubmit: async (values) => {
            if (!isConfirmStage) {
                // Check password field only
                if (formik.errors.password || !values.password) {
                    formik.setTouched({ password: true }, true);
                    return;
                }
                setIsConfirmStage(true);
                return;
            }

            const data = {
                full_name: values.full_name,
                email: values.email,
                password: values.password,
            };

            try {
                setIsButtonLoading(true);
                const resData = await apiService.post(
                    `/api/auth/user/auth-signup`,
                    data
                );
                if (resData.success) {
                    setUserInfo({ ...data, isRemember: isRememberMeChecked });
                    setTimeout(() => setPageState(1), 1);
                }
            } catch (error) {
                console.error("Signup error:", error);
            } finally {
                setIsButtonLoading(false);
            }
        },
    });

    // * Default field | Error field values
    const getValidationString = (
        field: keyof typeof formik.initialValues
    ): JSX.Element => {
        return formik.touched[field] && formik.errors[field] ? (
            <span className="text-red-500 font-semibold text-sm">
                <sup>*</sup>
                {formik.errors[field]}
            </span>
        ) : (
            <label htmlFor={field} className="text-slate-500 font-medium text-sm">
                <b className="capitalize">
                    <sup>*</sup>
                    {field.replace("_", " ")}
                </b>
            </label>
        );
    };

    return (
        <form
            onSubmit={formik.handleSubmit}
            className={`flex flex-col items-center gap-4 w-full`}
        >
            {/* User Name */}
            <section className="flex md:justify-between md:flex-row flex-col gap-4 w-full">
                <div className="w-full">
                    {getValidationString("full_name")}
                    <input
                        type="text"
                        name="full_name"
                        id="full_name"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.full_name}
                        placeholder="Full Name"
                        className={`w-full bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3.5 outline-none border border-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-300 ${openSans.className} font-medium text-gray-700 placeholder:text-gray-400 shadow-sm`}
                    ></input>
                </div>
            </section>

            {/* User Email */}
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

            {/* User Password */}
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
                        placeholder="Password"
                        value={formik.values.password}
                        className={`w-full bg-transparent outline-none placeholder:text-gray-400`}
                    />
                    {/* Show Password Button */}
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

            {isConfirmStage && (
                <section className="w-full">
                    {getValidationString("confirm_password")}
                    <input
                        type={isPasswordShow ? "text" : "password"}
                        name="confirm_password"
                        id="confirm_password"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirm_password}
                        placeholder="Confirm Password"
                        className={`w-full bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3.5 outline-none border border-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-300 ${openSans.className} font-medium text-gray-700 placeholder:text-gray-400 shadow-sm`}
                    />
                </section>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 self-start">
                <Checkbox
                    id="rememberMe"
                    checked={isRememberMeChecked}
                    onCheckedChange={(checked) => setIsRememberMeChecked(!!checked)}
                    className="data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 text-white"
                />
                <label
                    htmlFor="rememberMe"
                    className="text-sm text-gray-600 select-none cursor-pointer"
                >
                    Remember Me
                </label>
            </div>

            {/* Form submit Button */}
            <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-800 to-gray-600 px-4 py-3.5 font-semibold rounded-xl text-white hover:from-gray-700 hover:to-gray-500 transform hover:scale-[1.02] transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
            >
                {isButtonLoading ? <LoadingSpinner border="border-white" /> : <span>Sign Up</span>}
            </button>
        </form>
    );
};

export default SignUp;
