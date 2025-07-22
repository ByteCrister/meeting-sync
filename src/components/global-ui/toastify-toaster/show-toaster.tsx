"use client";

import { toast, Id, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle, AlertCircle, Loader, XCircle, RefreshCcw } from "lucide-react";

type ToastStatus = "processing" | "success" | "error" | "warning" | "retry-warning";

const ShowToaster = (
  text: string,
  status: ToastStatus,
  onRetry?: () => void
): Id | void => {
  const iconSize = 20;

  const commonOptions = {
    position: "top-center" as const,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Slide,
    style: {
      borderRadius: "12px",
      fontSize: "15px",
      padding: "14px 18px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
      maxWidth: "90vw",
      width: "100%",
      margin: "0 auto",
    },
    bodyStyle: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontWeight: 500,
    },
  };

  const retryButton = (
    <button
      onClick={onRetry}
      className="ml-auto text-sm font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 transition-colors bg-white/80 rounded border border-blue-100 shadow-sm"
    >
      Retry
    </button>
  );

  const contentWithIcon = (icon: JSX.Element) => (
    <div className="flex items-center w-full gap-3">
      {icon}
      <span>{text}</span>
    </div>
  );

  switch (status) {
    case "processing":
      return toast(contentWithIcon(<Loader size={iconSize} className="animate-spin text-blue-600" />), {
        ...commonOptions,
        autoClose: false,
        style: {
          ...commonOptions.style,
          border: "2px solid #3B82F6",
          background: "linear-gradient(90deg, #DBEAFE, #EFF6FF)",
          color: "#1E3A8A",
        },
      });

    case "success":
      toast.success(contentWithIcon(<CheckCircle size={iconSize} className="text-green-600" />), {
        ...commonOptions,
        autoClose: 4500,
        style: {
          ...commonOptions.style,
          border: "2px solid #22C55E",
          background: "linear-gradient(135deg, #D1FAE5, #F0FDF4)",
          color: "#065F46",
        },
      });
      break;

    case "error":
      toast.error(contentWithIcon(<XCircle size={iconSize} className="text-red-600" />), {
        ...commonOptions,
        autoClose: 7000,
        style: {
          ...commonOptions.style,
          border: "2px solid #EF4444",
          background: "linear-gradient(135deg, #FEE2E2, #FEF2F2)",
          color: "#7F1D1D",
        },
      });
      break;

    case "warning":
      toast.warn(contentWithIcon(<AlertCircle size={iconSize} className="text-yellow-500" />), {
        ...commonOptions,
        autoClose: 6000,
        style: {
          ...commonOptions.style,
          border: "2px solid #F59E0B",
          background: "linear-gradient(135deg, #FEF3C7, #FFFBEB)",
          color: "#78350F",
        },
      });
      break;

    case "retry-warning":
      toast.warn(
        <div className="flex items-center justify-between w-full gap-3">
          {contentWithIcon(<RefreshCcw size={iconSize} className="text-yellow-600" />)}
          {retryButton}
        </div>,
        {
          ...commonOptions,
          autoClose: 10000,
          style: {
            ...commonOptions.style,
            border: "2px solid #FBBF24",
            background: "linear-gradient(135deg, #FFEDD5, #FFF7ED)",
            color: "#92400E",
          },
        }
      );
      break;

    default:
      console.error("Invalid toast status provided:", status);
  }
};

export default ShowToaster;