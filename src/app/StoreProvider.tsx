"use client";

import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";
import LoadingUi from "@/components/global-ui/ui-component/LoadingUi";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AlertLogout from "@/components/global-ui/dialoges/AlertLogout";
import AlertDialogComponent from "@/components/global-ui/dialoges/AlertDialogComponent";
import SlotDropDialog from "@/components/global-ui/dialoges/SlotDropDialog";
import NotifyChangeDialog from "@/components/global-ui/dialoges/NotifyChangeDialog";
import { setUser } from "@/lib/features/users/userSlice";
import { Users } from "@/types/client-types";
import { getUserStatus } from "@/utils/client/others/getUserStatus";
import MeetingDialog from "@/components/global-ui/dialoges/meeting-dialog/MeetingDialog";
import { BookedSlotDialog } from "@/components/booked-meetings/BookedSlotDialog";
import { AlertDeleteBookedSlot } from "@/components/booked-meetings/AlertDeleteBookedSlot";
import { Toaster } from "sonner";


export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  // * Creating dispatch
  const dispatch = storeRef.current.dispatch;

  const [state, setState] = useState<{ user: null | Users, loading: boolean }>({ user: null, loading: true });

  useEffect(() => {
    const logInStatus = async () => {
      // * Toggle loading
      setState((state) => ({ ...state, loading: true }));
      const responseData = await getUserStatus(); // ? return's { user: ObjectValues } || null
      if (responseData.success && responseData?.user) {
        setState((state) => ({ ...state, user: responseData.user }));
        dispatch(setUser({ user: responseData.user, activity: responseData.activities }));
      }
      // * Toggle loading
      setState((state) => ({ ...state, loading: false }));
    };
    logInStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return <Provider store={storeRef.current}>
    {/* Loading state */}
    {state.loading ? <LoadingUi />
      // ! wrap component for authorized user
      : state.user
        ? <DashboardLayout>
          {children}
          <Toaster richColors position="bottom-right" />
          <AlertLogout />
          <MeetingDialog />
          <SlotDropDialog />
          <NotifyChangeDialog />
          <BookedSlotDialog />
          <AlertDialogComponent />
          <AlertDeleteBookedSlot />
        </DashboardLayout>
        // ! else : wrap component for unauthorized user
        : <>
          {children}
          <AlertDialogComponent />
        </>
    }

  </Provider>;
}

