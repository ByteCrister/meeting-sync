import ShowToaster from "@/components/global-ui/toastify-toaster/show-toaster";
import api from "./api";
import { AxiosError, AxiosResponse } from "axios";

/**
 * A service wrapper around axios API methods to handle common
 * HTTP operations with consistent error handling and toaster notifications.
 */
const apiService = {
    /**
     * Send a GET request to the given URL with optional query parameters.
     * Handles logical errors from API (e.g., isError === true) gracefully.
     *
     * @param url - The API endpoint URL
     * @param params - Optional query parameters to append to the request
     * @returns - Response data or an object containing `isError` and `errorType`
     */
    get: async (url: string, params?: Record<string, unknown>) => {
        try {
            const response: AxiosResponse = await api.get(url, { params });
            const data = response.data;

            if (data.isError) {
                ShowToaster(`Error: ${data.errorType}`, "error");
                return { success: false, errorType: data.errorType };
            }

            return data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                ShowToaster(error.response?.data?.message || error.message, "error");
            } else {
                ShowToaster("Unexpected GET API server error!", "error");
            }
            return { success: false, message: "Unexpected error occurred." };
        }
    },

    /**
     * Send a POST request to the given URL with optional body data.
     *
     * @param url - The API endpoint URL
     * @param data - Request body payload
     * @returns - Response data or failure message
     */
    post: async (url: string, data?: unknown) => {
        try {
            const response: AxiosResponse = await api.post(url, data);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error("POST Error:", error.response?.data || error.message);
                ShowToaster(error.response?.data?.message || error.message, "error");
            } else {
                console.error("Unexpected POST Error:", error);
                ShowToaster("Unexpected POST API server error!", "error");
            }
            return { success: false, message: "Unexpected error occurred." };
        }
    },

    /**
     * Send a PUT request to the given URL with optional body data.
     *
     * @param url - The API endpoint URL
     * @param data - Request body payload
     * @returns - Response data or failure message
     */
    put: async (url: string, data?: unknown) => {
        try {
            const response: AxiosResponse = await api.put(url, data);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error("PUT Error:", error.response?.data || error.message);
                ShowToaster(error.response?.data?.message || error.message, "error");
            } else {
                console.error("Unexpected PUT Error:", error);
                ShowToaster("Unexpected PUT API server error!", "error");
            }
            return { success: false, message: "Unexpected error occurred." };
        }
    },

    /**
     * Send a DELETE request to the given URL with optional request body data.
     *
     * @param url - The API endpoint URL
     * @param data - Optional body payload for the DELETE request
     * @returns - Response data or failure message
     */
    delete: async (url: string, data?: unknown) => {
        try {
            const response: AxiosResponse = await api.delete(url, { data });

            if (response.data.success) {
                return response.data;
            } else {
                ShowToaster(response.data.message || "Unknown error", "error");
                return { success: false, message: response.data.message || "Unknown error" };
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                ShowToaster(error.response?.data?.message || error.message, "error");
            } else {
                ShowToaster("Unexpected DELETE API server error!", "error");
            }
            return { success: false, message: "Unexpected error occurred." };
        }
    }
};

export default apiService;
