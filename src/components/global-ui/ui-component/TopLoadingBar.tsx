"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "@/components/global-ui/styles/nprogress.css";

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

export default function TopLoadingBar() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    NProgress.done();
  }, [pathname]);

  return null;
}