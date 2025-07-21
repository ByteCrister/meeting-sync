'use client';

import { useSearchParams } from 'next/navigation';
import ShowToaster from '@/components/global-ui/toastify-toaster/show-toaster';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import FullPageError from '../errors/FullPageError';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams?.get('error');

    useEffect(() => {
        switch (error) {
            case 'OAuthCallback':
                ShowToaster('Google login timed out. Please try again.', 'error');
                break;
            case 'MissingEmail':
                ShowToaster('Google didn’t return an email.', 'error');
                break;
            case 'EmailNotRegistered':
                ShowToaster('That Google email is not registered in our system.', 'error');
                break;
            case 'SessionNotFound':
                ShowToaster('Could not get your session. Try signing in again.', 'error');
                break;
            default:
                ShowToaster('Unknown error occurred during login.', 'error');
        }
    }, [error]);

    if (!error) {
        return <FullPageError message='Missing error parameter.' />
    }

    return (
        <main
            role="alert"
            className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-tr from-indigo-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700"
        >
            <motion.section
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="max-w-md w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 text-center"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-red-100 rounded-full dark:bg-red-200/30">
                    <FiAlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
                    Something Went Wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    We couldn’t log you in. Please try again or go back home.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/"
                        className="flex-1 px-5 py-3 bg-transparent border-2 border-gray-300 text-gray-700 dark:border-gray-500 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-700 transition"
                    >
                        Back
                    </Link>
                </div>
            </motion.section>
        </main>
    );
}
