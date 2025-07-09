'use client';

interface VideoCallPageWrapperProps {
    children: React.ReactNode;
}

export default function VideoCallPageWrapper({ children }: VideoCallPageWrapperProps) {

    // Render children - children should decide what to render based on redux status
    return <>{children}</>;
}
