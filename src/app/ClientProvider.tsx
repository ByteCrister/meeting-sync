import { Toaster } from "@/components/global-ui/toastify-toaster/toaster";
import StoreProvider from "./StoreProvider";
import { ToastContainer } from "react-toastify";
import ConditionalLayout from "@/components/global-ui/ConditionalLayout";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <StoreProvider>
            <ConditionalLayout>
                {children}
                <ToastContainer />
                <Toaster />
            </ConditionalLayout>
        </StoreProvider>
    )
}
export default ClientProvider;