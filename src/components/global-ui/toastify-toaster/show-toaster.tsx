"use client";

import { Bounce, toast, Id } from "react-toastify";

type ToastStatus = 
  | "processing"
  | "success"
  | "error"
  | "warning"
  | "retry-warning";

const ShowToaster = (
  text: string,
  status: ToastStatus,
  onRetry?: () => void
): Id | void => {
  const retryButton = (
    <button
      onClick={onRetry}
      className="text-blue-500 hover:text-blue-700 ml-2 font-semibold"
    >
      Retry
    </button>
  );

  switch (status) {
    case "processing":
      // returns an ID you can later use to update or dismiss
      return toast.loading(text, {
        position: "top-center",
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });

    case "success":
      toast.success(text, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      break;

    case "error":
      toast.error(text, {
        position: "top-center",
        autoClose: 8000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      break;

    case "warning":
      toast.warn(text, {
        position: "top-center",
        autoClose: 8000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      break;

    case "retry-warning":
      toast.warn(
        <div className="flex items-center">
          <span>{text}</span>
          {retryButton}
        </div>,
        {
          position: "top-center",
          autoClose: 10000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        }
      );
      break;

    default:
      console.error("Invalid toast status provided:", status);
  }
};

export default ShowToaster;