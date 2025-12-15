'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Navigation from '../landing/unauthorized/Navigation';
import Footer from '../landing/unauthorized/Footer';
import { useSessionSecureStorage } from '@/hooks/useSessionSecureStorage';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect } from 'react';
import FormModal from '../landing/unauthorized/FormModal';
import { getUserStatus } from '@/utils/client/others/getUserStatus';
import { setUser, toggleFetching } from '@/lib/features/users/userSlice';

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AlertLogout from "@/components/global-ui/dialoges/AlertLogout";
import AlertDialogComponent from "@/components/global-ui/dialoges/AlertDialogComponent";
import SlotDropDialog from "@/components/global-ui/dialoges/SlotDropDialog";
import NotifyChangeDialog from "@/components/global-ui/dialoges/NotifyChangeDialog";
import MeetingDialog from "@/components/global-ui/dialoges/meeting-dialog/MeetingDialog";
import { Toaster } from "sonner";
import BlockedUsersDialog from "@/components/my-slots/BlockedUsersDialog";
import { BookedSlotDialog } from "@/components/booked-meetings/BookedSlotDialog";
import { AlertDeleteBookedSlot } from "@/components/booked-meetings/AlertDeleteBookedSlot";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useSessionSecureStorage<boolean>('isModalOpen', false, true);
    const isUserExist = useAppSelector(state => state.userStore.user?._id);
    const dispatch = useAppDispatch();

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
        const logInStatus = async () => {
            // * Toggle loading
            dispatch(toggleFetching({ isFetching: true }))
            const responseData = await getUserStatus(); // ? return's { user: ObjectValues } || null
            if (responseData.success && responseData?.user) {
                dispatch(setUser({ user: responseData.user, activity: responseData.activities }));
            }
            // * Toggle loading
            dispatch(toggleFetching({ isFetching: false }))
        };
        logInStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scrollToTop = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        isUserExist ?
            <DashboardLayout>
                {children}
                <Toaster richColors position="bottom-right" />
                <AlertLogout />
                <MeetingDialog />
                <SlotDropDialog />
                <BlockedUsersDialog />
                <NotifyChangeDialog />
                <BookedSlotDialog />
                <AlertDialogComponent />
                <AlertDeleteBookedSlot />
            </DashboardLayout> 
            :
            <>
                {showNavFooter && <Navigation setIsModalOpen={setIsModalOpen} />}
                <main>{children}</main>
                {showNavFooter && !isUserExist && <FormModal open={isModalOpen} onOpenChange={setIsModalOpen} />}
                {showNavFooter && <Footer scrollToTop={scrollToTop} />}
                <AlertDialogComponent />
            </>
    )
}