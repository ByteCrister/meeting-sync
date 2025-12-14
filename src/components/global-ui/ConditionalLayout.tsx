'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Navigation from '../landing/unauthorized/Navigation';
import Footer from '../landing/unauthorized/Footer';
import { useSessionSecureStorage } from '@/hooks/useSessionSecureStorage';
import { useAppSelector } from '@/lib/hooks';
import { useEffect } from 'react';
import FormModal from '../landing/unauthorized/FormModal';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useSessionSecureStorage<boolean>('isModalOpen', false, true);
    const isUserExist = useAppSelector(state => state.userStore.user?._id);

    const option = searchParams?.get('option') ?? '';

    const showNavFooter =
        pathname === '/' ||
        (pathname === '/meeting-sync' &&
            ['features', 'roadmap', 'how-it-works'].includes(option));

    // Scroll to hash on load
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash) {
            const id = window.location.hash.substring(1);
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    const scrollToTop = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });


    return (
        <>
            {showNavFooter && <Navigation setIsModalOpen={setIsModalOpen} />}
            <main>{children}</main>
            {!isUserExist && (<FormModal open={isModalOpen} onOpenChange={setIsModalOpen} />)}
            {showNavFooter && <Footer scrollToTop={scrollToTop} />}
        </>
    );
}