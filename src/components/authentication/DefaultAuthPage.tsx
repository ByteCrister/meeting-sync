"use client";

import { useState } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { userSignInType, userSignUpType } from "@/types/client-types";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import SignIn from "./SignIn";
import AuthenticateOTP from "./AuthenticateOTP";
import "@/styles/animations.css";

const buttonStyle =
    "font-medium px-4 py-2.5 rounded-xl transition-all duration-300 text-sm md:text-base";

// Dynamic Direction-Based Page Transition
const getPageVariants = (direction: "left" | "right") => ({
    hidden: { opacity: 0, x: direction === "left" ? 20 : -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: direction === "left" ? -20 : 20, transition: { duration: 0.3 } },
});

const DefaultAuthPage = () => {
    const [pageState, setPageState] = useState<number>(0);
    const [currentAuthPage, setCurrentAuthPage] = useState<0 | 1 | 2>(0);
    const [previousAuthPage, setPreviousAuthPage] = useState<0 | 1 | 2>(0);
    const [userInfo, setUserInfo] = useState<userSignUpType | userSignInType>();
    const [isEmailChecked, setIsEmailChecked] = useState<boolean>(false);

    const handleButtonClick = (page: 0 | 1 | 2) => {
        setPreviousAuthPage(currentAuthPage);
        setCurrentAuthPage(page);
    };

    // Determine Direction for Transition
    const direction =
        previousAuthPage < currentAuthPage ? "left" : "right";

    const currentPage = {
        0: <SignIn />,
        1: <SignUp setPageState={setPageState} setUserInfo={setUserInfo} />,
        2: <ForgotPassword setPageState={setPageState} setUserInfo={setUserInfo} userInfo={userInfo} isEmailChecked={isEmailChecked} />,
    };

    const getButtons = () => (
        <div className="flex justify-center space-x-3 mb-6">
            {[
                { title: "Sign In", page: 0 },
                { title: "Sign Up", page: 1 },
                { title: "Forgot Password", page: 2 },
            ].map((item, index) => (
                <button
                    key={index}
                    className={`${buttonStyle} ${currentAuthPage === item.page
                        ? "bg-gradient-to-r from-gray-800 to-gray-600 text-white shadow-lg"
                        : "bg-white/80 text-gray-600 hover:bg-white/90 hover:text-gray-950 shadow-sm"
                        }`}
                    onClick={() => handleButtonClick(item.page as 0 | 1 | 2)}
                >
                    {item.title}
                </button>
            ))}
        </div>
    );

    return pageState === 0 ? (
        <section className="relative w-full md:w-full max-w-md flex justify-center items-center p-8 rounded-2xl shadow-2xl bg-gradient-to-br backdrop-blur-lg">

            <div className="relative">
                {getButtons()}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentAuthPage}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={getPageVariants(direction)}
                    >
                        {currentPage[currentAuthPage]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    ) : (
        <AuthenticateOTP
            userInfo={userInfo}
            setIsEmailChecked={setIsEmailChecked}
            setPageState={setPageState}
            setCurrentAuthPage={setCurrentAuthPage}
        />
    );
};

export default React.memo(DefaultAuthPage);
