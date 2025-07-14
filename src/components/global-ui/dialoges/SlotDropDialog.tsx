"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleSlotDropDialog } from "@/lib/features/component-state/componentSlice";
import { deleteSlot } from "@/lib/features/Slots/SlotSlice";
import { deleteSlotsFromUserRegisterSlots } from "@/lib/features/users/userSlice";
import apiService from "@/utils/client/api/api-services";
import LoadingSpinner from "../ui-component/LoadingSpinner";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const SlotDropDialog = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { slotDropDialog } = useAppSelector((s) => s.componentStore);
    const dispatch = useAppDispatch();

    const close = () =>
        dispatch(
            toggleSlotDropDialog({ isOpen: false, slotTitle: null, slotId: null })
        );

    const handleDropSlot = async () => {
        setIsLoading(true);
        try {
            const { success, message } = await apiService.delete(
                "/api/user-slot-register",
                { slotId: slotDropDialog.slotId }
            );

            if (success) {
                dispatch(deleteSlot(slotDropDialog.slotId!));
                dispatch(deleteSlotsFromUserRegisterSlots(slotDropDialog.slotId!));
                toast.success(`Dropped “${slotDropDialog.slotTitle}” successfully`);
                close();
            } else {
                toast.error(message || "Could not drop slot. Please try again.");
            }
        } catch {
            toast.error("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={slotDropDialog.isOpen}
            onOpenChange={(open) => {
                if (!open) close();
            }}
        >
            <DialogContent className="max-w-md p-6 bg-white rounded-lg shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-800">
                        Confirm Slot Drop
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-gray-600">
                        Are you sure you want to drop this slot?
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 px-2">
                    <p className="text-sm text-gray-700">Title:</p>
                    <p className="mt-1 font-medium text-gray-900">
                        {slotDropDialog.slotTitle}
                    </p>
                </div>

                <DialogFooter className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={close}
                        className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDropSlot}
                        disabled={isLoading}
                        className={`
      rounded-md bg-red-600 px-4 py-2 text-sm 
      font-medium text-white hover:bg-red-700 
      focus:outline-none focus:ring-2 focus:ring-red-500 
      flex items-center justify-center gap-2
      transition-opacity ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
    `}
                    >
                        {isLoading ? (
                            <LoadingSpinner border="border-white" />
                        ) : (
                            <motion.span
                                initial={{ scale: 1 }}
                                whileHover={{ scale: 1.2, rotate: -10 }}
                                whileTap={{ scale: 0.95, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5 text-white" />
                                <span className="sr-only">Drop Slot</span> {/* Accessible */}
                            </motion.span>
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SlotDropDialog;
