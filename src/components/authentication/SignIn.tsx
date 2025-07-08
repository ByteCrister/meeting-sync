"use client";

import { JSX, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useFormik } from "formik";
import { Open_Sans } from "next/font/google";
import { signInValidation } from "@/utils/client/others/auth-validation";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";
import apiService from "@/utils/client/api/api-services";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const openSans = Open_Sans({
    weight: "400",
    subsets: ["latin"],
});

const SignIn = () => {
    const router = useRouter();
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)
    const [isGoogleBtnLoading, setIsGoogleBtnLoading] = useState<boolean>(false);
    const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);

    const searchParams = useSearchParams();
    const error = searchParams?.get("error");

    useEffect(() => {
        if (error) {
            router.replace(`/user-authentication/error?error=${error}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: signInValidation,
        onSubmit: async (values) => {
            const data = { ...values, isRemember: isRememberMeChecked };
            if (!isButtonLoading) {
                setIsButtonLoading(true);
                const resData = await apiService.post(`/api/auth/user/signin`, data);
                if (resData.success) {
                    ShowToaster("Successfully signed in.", "success");
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                }
            }
            setIsButtonLoading(false);
        },
    });

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleBtnLoading(true);

            const result = await signIn("google", {
                callbackUrl: "/api/auth/custom-google-callback",
                redirect: true,
            });

            if (!result) {
                ShowToaster("No response from Google. Try again.", "error");
                return;
            }

            if (result.error) {
                switch (result.error) {
                    case "OAuthCallback":
                        ShowToaster("Network timeout. Check your internet and try again.", "error");
                        break;
                    case "EmailNotRegistered":
                        ShowToaster("Your Google email is not registered.", "error");
                        break;
                    case "MissingEmail":
                        ShowToaster("Google did not provide an email. Try another account.", "error");
                        break;
                    case "Configuration":
                        ShowToaster("OAuth is misconfigured. Devs are fixing it.", "error");
                        break;
                    case "AccessDenied":
                        ShowToaster("Access was denied. Please accept the permissions.", "error");
                        break;
                    default:
                        ShowToaster("Something went wrong during sign-in. Try again.", "error");
                        break;
                }
                return;
            }

            if (result.ok && result.url) {
                ShowToaster("Signed in successfully!", "success");
                window.location.href = result.url;
            } else {
                console.error("Google login unknown issue:", result);
                ShowToaster("Unexpected issue. Try again or use a different network.", "error");
            }
        } catch (err) {
            const error = err as Error;
            // now you can safely access error.message
            console.error("Login error:", error.message);

            if (error.message?.includes("ENOTFOUND")) {
                ShowToaster("Internet seems down. Try reconnecting.", "error");
            } else if (error.message?.includes("popup_closed_by_user")) {
                ShowToaster("Login popup closed too early. Try again.", "error");
            } else {
                ShowToaster("Something broke. Refresh and try again.", "error");
            }
        } finally {
            setIsGoogleBtnLoading(false);
        }
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
            className="flex flex-col items-center gap-4 w-full"
        >
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
            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 self-start">
                <Checkbox
                    id="rememberMe"
                    checked={isRememberMeChecked}
                    onCheckedChange={(checked) => setIsRememberMeChecked(!!checked)}
                    className="h-4 w-4 border border-slate-300 transition-colors data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 text-white"
                />
                <label
                    htmlFor="rememberMe"
                    className="text-sm text-gray-600 select-none cursor-pointer"
                >
                    Remember Me
                </label>
            </div>
            <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-800 to-gray-600 px-4 py-3.5 font-semibold rounded-xl text-white hover:from-gray-700 hover:to-gray-500 transform hover:scale-[1.02] transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
            >
                {isButtonLoading ? (
                    <LoadingSpinner border="border-white" />
                ) : (
                    <span>Sign In</span>
                )}
            </button>
            {/* Separator */}
            <div className="flex items-center gap-4">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="text-sm text-gray-500">or</span>
                <hr className="flex-grow border-t border-gray-300" />
            </div>

            {/* Google Sign-In Button */}
            {
                isGoogleBtnLoading ? (
                    <div className="h-10 w-40  flex items-center justify-center gap-3 bg-white border border-gray-300 py-2 px-4 rounded shadow-sm hover:bg-gray-100">
                        <LoadingSpinner border="border-black" />
                    </div>) :
                    <button
                        type="button"
                        onClick={() => { setIsGoogleBtnLoading(true); handleGoogleLogin() }}
                        className="flex items-center justify-center gap-3 bg-white border border-gray-300 py-2 px-4 rounded shadow-sm hover:bg-gray-100"
                    >
                        <Image
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            width={20}
                            height={20}
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Sign in with Google
                        </span>
                    </button>

            }
        </form>
    );
};

export default SignIn;
