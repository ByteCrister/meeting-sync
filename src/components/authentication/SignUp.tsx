"use client";

import { Dispatch, JSX, SetStateAction, useState } from "react";
import { useFormik } from 'formik';
import { IoEyeSharp } from "react-icons/io5";
import { IoEyeOffSharp } from "react-icons/io5";
import { signUpValidation } from "@/utils/client/others/auth-validation";
import apiService from "@/utils/client/api/api-services";
import { userSignInType, userSignUpType } from "@/types/client-types";
import { Open_Sans } from "next/font/google";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";

const openSans = Open_Sans({
    weight: '400',
    subsets: ['latin'],
});

// Prop Types
type SignUpProps = {
    setPageState: Dispatch<SetStateAction<number>>;
    setUserInfo: Dispatch<SetStateAction<userSignUpType | userSignInType | undefined>>;
};
const SignUp = ({ setPageState, setUserInfo }: SignUpProps) => {
    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [isConfirmStage, setIsConfirmStage] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            full_name: '',
            email: '',
            password: '',
            confirm_password: '',
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
                password: values.password
            };

            try {
                setIsButtonLoading(true);
                const resData = await apiService.post(`/api/auth/user/auth-signup`, data);
                if (resData.success) {
                    setUserInfo(data);
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
    const getValidationString = (field: keyof typeof formik.initialValues): JSX.Element => {
        return formik.touched[field] && formik.errors[field] ? (
            <span className="text-red-500 font-semibold text-sm">
                <sup>*</sup>{formik.errors[field]}
            </span>
        ) : (
            <label htmlFor={field} className="text-slate-500 font-medium text-sm">
                <b className="capitalize">
                    <sup>*</sup>{field.replace('_', " ")}
                </b>
            </label>
        );
    };

    return (
        <form onSubmit={formik.handleSubmit} className={`flex flex-col items-center gap-2 w-full`}>
            {/* User Name */}
            <section className="flex md:justify-between md:flex-row flex-col gap-2 w-full">
                <div className="w-full">
                    {getValidationString('full_name')}
                    <br />
                    <input
                        type='text'
                        name="full_name"
                        id="full_name"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.full_name}
                        placeholder='Full Name'
                        className={`w-full bg-white rounded px-2 py-1 outline-none ${openSans.className} font-bold text-slate-500`}
                    ></input>
                </div>
            </section>

            {/* User Email */}
            <div className="w-full">
                {getValidationString('email')}
                <br />
                <input
                    type='email'
                    name="email"
                    id="email"
                    required
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder='email'
                    className={`w-full bg-white rounded px-2 py-1 outline-none ${openSans.className} font-bold text-slate-500`}
                ></input>
            </div>

            {/* User Password */}
            <section className="w-full">
                {getValidationString('password')}
                <br />
                <div className={`flex justify-between bg-white rounded px-2 py-1 outline-none ${openSans.className} font-bold text-slate-500`}>
                    <input
                        type={isPasswordShow ? 'text' : 'password'}
                        name="password"
                        id="password"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='password'
                        value={formik.values.password}
                        className={`w-full bg-white outline-none ${openSans.className} font-bold text-slate-500`} />
                    {/* Show Password Button */}
                    <button type="button" onClick={(e) => { e.preventDefault(); setIsPasswordShow(prev => !prev); }}>
                        {isPasswordShow ? <IoEyeSharp className="text-slate-500" /> : <IoEyeOffSharp className="text-slate-500" />}
                    </button>
                </div>
            </section>

            {isConfirmStage && (
                <section className="w-full">
                    {getValidationString('confirm_password')}
                    <br />
                    <input
                        type={isPasswordShow ? 'text' : 'password'}
                        name="confirm_password"
                        id="confirm_password"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirm_password}
                        placeholder='Confirm Password'
                        className={`w-full bg-white rounded px-2 py-1 outline-none ${openSans.className} font-bold text-slate-500`}
                    />
                </section>
            )}


            {/* Form submit Button */}
            <button type='submit' className='w-full bg-slate-500 px-2 py-1 font-semibold rounded text-gray-100 hover:bg-slate-300 hover:text-slate-600 transition duration-300 ease-in-out'>
                {isButtonLoading ? <LoadingSpinner /> : <span>Sign Up</span>}
            </button>

        </form>
    )
};

export default SignUp;