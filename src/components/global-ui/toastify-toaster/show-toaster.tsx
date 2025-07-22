"use client";

import { toast, Id, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CheckCircle,
  AlertCircle,
  Loader,
  XCircle,
  RefreshCcw,
} from "lucide-react";

type ToastStatus = "processing" | "success" | "error" | "warning" | "retry-warning";

const ShowToaster = (
  text: string,
  status: ToastStatus,
  onRetry?: () => void
): Id | void => {
  const iconSize = 18;

  const baseStyles = {
    position: "top-center" as const,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    transition: Slide,
    style: {
      borderRadius: "8px",
      padding: "12px 16px",
      backgroundColor: "#F9FAFB", // subtle light background
      border: "1px solid #E5E7EB",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      fontFamily: `"Inter", "system-ui", sans-serif`,
      maxWidth: "400px",
      width: "100%",
    },
    bodyStyle: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "1.5",
      color: "#374151", // soft gray
    },
  };

  const contentWithIcon = (icon: JSX.Element, color?: string) => (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-sm leading-snug tracking-tight" style={{ color }}>
        {text}
      </span>
    </div>
  );

  const retryButton = (
    <button
      onClick={onRetry}
      className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 border border-blue-100 bg-blue-50 rounded"
    >
      Retry
    </button>
  );

  switch (status) {
    case "processing":
      return toast(
        contentWithIcon(
          <Loader size={iconSize} className="animate-spin text-blue-600" />,
          "#1D4ED8"
        ),
        {
          ...baseStyles,
          autoClose: false,
        }
      );

    case "success":
      toast(
        contentWithIcon(
          <CheckCircle size={iconSize} className="text-green-600" />,
          "#15803D"
        ),
        {
          ...baseStyles,
          autoClose: 4000,
        }
      );
      break;

    case "error":
      toast(
        contentWithIcon(
          <XCircle size={iconSize} className="text-red-600" />,
          "#B91C1C"
        ),
        {
          ...baseStyles,
          autoClose: 7000,
        }
      );
      break;

    case "warning":
      toast(
        contentWithIcon(
          <AlertCircle size={iconSize} className="text-yellow-500" />,
          "#92400E"
        ),
        {
          ...baseStyles,
          autoClose: 6000,
        }
      );
      break;

    case "retry-warning":
      toast(
        <div className="flex items-center gap-3 justify-between w-full">
          {contentWithIcon(
            <RefreshCcw size={iconSize} className="text-yellow-600" />,
            "#92400E"
          )}
          {retryButton}
        </div>,
        {
          ...baseStyles,
          autoClose: 10000,
        }
      );
      break;

    default:
      console.warn("Invalid toast status:", status);
  }
};

export default ShowToaster;
