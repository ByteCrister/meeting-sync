import { Toaster } from "@/components/global-ui/toastify-toaster/toaster";
import StoreProvider from "./StoreProvider";
import { ToastContainer } from "react-toastify";
import ConditionalLayout from "@/components/global-ui/ConditionalLayout";
import { Suspense } from "react";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <StoreProvider>
            <Suspense fallback={null}>
                <ConditionalLayout>
                    {children}
                    <ToastContainer />
                    <Toaster />
                </ConditionalLayout>
            </Suspense>
        </StoreProvider>
    )
}
export default ClientProvider;