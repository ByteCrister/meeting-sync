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
                            ? "bg-gradient-to-r from-gray-800 to-gray-600 text-white shadow-lg"
                            : "bg-white/80 text-gray-600 hover:bg-white/90 hover:text-gray-950 shadow-sm"
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
        pageState === 0 ? (
                <section className="w-[100%] md:w-full max-w-md flex justify-center items-center p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                    <div className="relative">
                        {getButtons()}
                        <div className="transition-all duration-500 ease-in-out">
                            {currentPage[currentAuthPage]}
                        </div>
                    </div>
                </section>
        ) : (
            <AuthenticateOTP
                userInfo={userInfo}
                setIsEmailChecked={setIsEmailChecked}
                setPageState={setPageState}
                setCurrentAuthPage={setCurrentAuthPage}
            />
        )
    );
};

export default React.memo(DefaultAuthPage);