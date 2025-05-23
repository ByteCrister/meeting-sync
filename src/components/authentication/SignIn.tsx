"use client";

import { JSX, useState } from "react";
import { useFormik } from 'formik';
import { Open_Sans } from "next/font/google";
import { signInValidation } from "@/utils/client/others/auth-validation";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";
import apiService from "@/utils/client/api/api-services";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";

const openSans = Open_Sans({
    weight: '400',
    subsets: ['latin'],
});

const SignIn = () => {
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: signInValidation,
        onSubmit: async (values) => {
            const data = { ...values };
            if (!isButtonLoading) {
                setIsButtonLoading(true);
                const resData = await apiService.post(`/api/auth/user/signin`, data);
                if (resData.success) {
                    ShowToaster("Successfully signed in.", "success");
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            }
            setIsButtonLoading(false);
        },
    });

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
        <form onSubmit={formik.handleSubmit} className="flex flex-col items-center gap-4 w-full">
            <div className="w-full">
                {getValidationString('email')}
                <input
                    type='email'
                    name="email"
                    id="email"
                    required
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder='Email'
                    className={`w-full bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3.5 outline-none border border-indigo-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 ${openSans.className} font-medium text-gray-700 placeholder:text-gray-400 shadow-sm`}
                ></input>
            </div>
            <section className="w-full">
                {getValidationString('password')}
                <div className={`flex justify-between bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3.5 outline-none border border-indigo-100 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-300 ${openSans.className} font-medium text-gray-700 shadow-sm`}>
                    <input
                        type={isPasswordShow ? 'text' : 'password'}
                        name="password"
                        id="password"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='Password'
                        value={formik.values.password}
                        className={`w-full bg-transparent outline-none placeholder:text-gray-400`} />
                    <button type="button" onClick={(e) => { e.preventDefault(); setIsPasswordShow(prev => !prev); }} className="text-indigo-500 hover:text-indigo-600 transition-colors duration-200">
                        {isPasswordShow ? <IoEyeSharp className="text-xl" /> : <IoEyeOffSharp className="text-xl" />}
                    </button>
                </div>
            </section>
            <button type='submit' className='w-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3.5 font-semibold rounded-xl text-white hover:from-indigo-500 hover:to-indigo-400 transform hover:scale-[1.02] transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl'>
                {isButtonLoading ? <LoadingSpinner /> : <span>Sign In</span>}
            </button>
        </form>
    )
}

export default SignIn;