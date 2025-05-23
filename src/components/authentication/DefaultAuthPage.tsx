"use client";

import { JSX, useState } from "react";
import React from "react";
import { userSignInType, userSignUpType } from "@/types/client-types";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import SignIn from "./SignIn";
import AuthenticateOTP from "./AuthenticateOTP";
import "@/styles/animations.css";

// Styling for buttons to indicate active state
const buttonStyle = "font-medium px-4 py-2.5 rounded-xl transition-all duration-300 text-sm md:text-base";

const DefaultAuthPage = () => {
    const [pageState, setPageState] = useState<number>(0);
    const [currentAuthPage, setCurrentAuthPage] = useState<0 | 1 | 2>(0);
    const [userInfo, setUserInfo] = useState<userSignUpType | userSignInType>();
    // * State for Forgot Password Component
    const [isEmailChecked, setIsEmailChecked] = useState<boolean>(false);

    const handleButtonClick = (page: 0 | 1 | 2) => {
        setCurrentAuthPage(page);
    };

    const currentPage = {
        0: <SignIn />,
        1: <SignUp setPageState={setPageState} setUserInfo={setUserInfo} />,
        2: <ForgotPassword setPageState={setPageState} setUserInfo={setUserInfo} userInfo={userInfo} isEmailChecked={isEmailChecked} />
    };

    const getButtons: () => JSX.Element = () => {
        return <div className="flex justify-center space-x-3 mb-6">
            {
                [{ title: 'Sign Up', page: 1 }, { title: 'Sign In', page: 0 }, { title: 'Forgot Password', page: 2 }].map((item, index) => {
                    return <button
                        key={index}
                        className={`${buttonStyle} ${currentAuthPage === item.page
                                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg"
                                : "bg-white/80 text-gray-600 hover:bg-white/90 hover:text-indigo-600 shadow-sm"
                            }`}
                        onClick={() => handleButtonClick(item.page as 0 | 1 | 2)}
                    >
                        {item.title}
                    </button>
                })
            }
        </div>
    };

    return (
        // ! pageState: 0 for main registration form
        pageState === 0 ?
            // * Main container
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
                <section className="w-[90%] md:w-full max-w-md relative p-8 rounded-2xl shadow-2xl">
                    {/* Background layer with glass effect */}
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-2xl -z-10"></div>

                    {/* Decorative elements */}
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                    {/* Content */}
                    <div className="relative">
                        {/* Button section */}
                        {getButtons()}
                        {/* Transition section for dynamic content */}
                        <div className="transition-all duration-500 ease-in-out">
                            {currentPage[currentAuthPage]}
                        </div>
                    </div>
                </section>
            </div>
            // ! pageState: except 0 after authenticating email an otp will be send on that email
            : <AuthenticateOTP userInfo={userInfo} setIsEmailChecked={setIsEmailChecked} setPageState={setPageState} setCurrentAuthPage={setCurrentAuthPage} />
    );
};

export default React.memo(DefaultAuthPage);