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
  const iconSize = 20;

  const baseStyles = {
    position: "top-center" as const,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    transition: Slide,
    style: {
      borderRadius: "12px",
      padding: "16px 20px",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
      fontFamily: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
      maxWidth: "420px",
      width: "100%",
    },
    bodyStyle: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "1.5",
      color: "#1e293b",
      padding: 0,
    },
    progressStyle: {
      background: "#64748b",
      height: "2px",
    },
  };

  const statusConfig = {
    processing: {
      icon: <Loader size={iconSize} className="animate-spin text-blue-500" />,
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)",
      borderColor: "rgba(59, 130, 246, 0.2)",
    },
    success: {
      icon: <CheckCircle size={iconSize} className="text-emerald-500" />,
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(110, 231, 183, 0.05) 100%)",
      borderColor: "rgba(16, 185, 129, 0.2)",
    },
    error: {
      icon: <XCircle size={iconSize} className="text-red-500" />,
      color: "#ef4444",
      bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(252, 165, 165, 0.05) 100%)",
      borderColor: "rgba(239, 68, 68, 0.2)",
    },
    warning: {
      icon: <AlertCircle size={iconSize} className="text-amber-500" />,
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(253, 230, 138, 0.05) 100%)",
      borderColor: "rgba(245, 158, 11, 0.2)",
    },
    "retry-warning": {
      icon: <RefreshCcw size={iconSize} className="text-amber-500" />,
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(253, 230, 138, 0.05) 100%)",
      borderColor: "rgba(245, 158, 11, 0.2)",
    },
  };

  const config = statusConfig[status];

  const contentWithIcon = (
    <div className="flex items-center gap-3 w-full">
      <div
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
        style={{
          background: config.bgGradient,
          border: `1.5px solid ${config.borderColor}`,
        }}
      >
        {config.icon}
      </div>
      <span
        className="text-sm font-medium leading-snug tracking-tight flex-1"
        style={{ color: "#1e293b" }}
      >
        {text}
      </span>
    </div>
  );

  const retryButton = (
    <button
      onClick={onRetry}
      className="ml-3 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        color: config.color,
        backgroundColor: `${config.color}15`,
        border: `1px solid ${config.color}30`,
      }}
    >
      Retry
    </button>
  );

  const enhancedStyles = {
    ...baseStyles,
    style: {
      ...baseStyles.style,
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)`,
    },
  };

  switch (status) {
    case "processing":
      return toast(contentWithIcon, {
        ...enhancedStyles,
        autoClose: false,
      });

    case "success":
      toast(contentWithIcon, {
        ...enhancedStyles,
        autoClose: 4000,
      });
      break;

    case "error":
      toast(contentWithIcon, {
        ...enhancedStyles,
        autoClose: 7000,
      });
      break;

    case "warning":
      toast(contentWithIcon, {
        ...enhancedStyles,
        autoClose: 6000,
      });
      break;

    case "retry-warning":
      toast(
        <div className="flex items-center justify-between w-full gap-3">
          {contentWithIcon}
          {retryButton}
        </div>,
        {
          ...enhancedStyles,
          autoClose: 10000,
        }
      );
      break;

    default:
      console.warn("Invalid toast status:", status);
  }
};

export default ShowToaster;