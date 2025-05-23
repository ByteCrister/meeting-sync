"use client";

import { JSX, useState } from "react";
import { useFormik } from 'formik';
import { Open_Sans } from "next/font/google";
import { signInValidation } from "@/utils/client/others/auth-validation";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";
import apiService from "@/utils/client/api/api-services";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { Checkbox } from "../ui/checkbox";

const openSans = Open_Sans({
    weight: '400',
    subsets: ['latin'],
});

const SignIn = () => {
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
    const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);


    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
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
                    className={`w-full bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3.5 outline-none border border-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-300 ${openSans.className} font-medium text-gray-700 placeholder:text-gray-400 shadow-sm`}
                ></input>
            </div>

            <section className="w-full">
                {getValidationString('password')}
                <div className={`flex justify-between bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3.5 outline-none border border-gray-100 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all duration-300 ${openSans.className} font-medium text-gray-700 shadow-sm`}>
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
                    <button type="button" onClick={(e) => { e.preventDefault(); setIsPasswordShow(prev => !prev); }} className="text-gray-500 hover:text-gray-600 transition-colors duration-200">
                        {isPasswordShow ? <IoEyeSharp className="text-xl" /> : <IoEyeOffSharp className="text-xl" />}
                    </button>
                </div>
            </section>
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
            <button type='submit' className='w-full bg-gradient-to-r from-gray-800 to-gray-600 px-4 py-3.5 font-semibold rounded-xl text-white hover:from-gray-700 hover:to-gray-500 transform hover:scale-[1.02] transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl'>
                {isButtonLoading ? <LoadingSpinner border="border-white" /> : <span>Sign In</span>}
            </button>
        </form>
    )
}

export default SignIn;