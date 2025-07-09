'use client';

import Image from 'next/image';
import React, { ChangeEvent, useState } from 'react';
import { Pencil } from 'lucide-react';
import LoadingSpinner from '../global-ui/ui-component/LoadingSpinner';

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type ProfileImageTypes = {
    value: string;
    handleImageClick: () => void;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    isImgUpdating: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleRemoveImage: () => Promise<void>;
};

const ProfileImage = ({
    value,
    handleFileChange,
    fileInputRef,
    isLoading,
    isImgUpdating,
    handleRemoveImage,
}: ProfileImageTypes) => {
    const imageSrc = value?.trim() ? value : '/images/blank_profile_image.png';
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    return (
        <div className="flex justify-center mb-8">
            {!isLoading && (
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            )}

            {/* Dialog trigger (avatar) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div
                        className="relative w-32 h-32 rounded-full border-4 border-primary shadow-md overflow-hidden group cursor-pointer"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Image
                            src={imageSrc}
                            alt="Profile"
                            fill
                            className="object-cover"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : (
                                <Pencil className="text-white" size={22} />
                            )}
                        </div>
                    </div>
                </DialogTrigger>

                {/* Full-screen profile image dialog */}
                <DialogContent className="max-w-md bg-white p-6 rounded-xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-center">Profile Image</DialogTitle>
                    </DialogHeader>

                    <div className="w-full h-64 relative mb-6">
                        <Image
                            src={imageSrc}
                            alt="Full Profile"
                            fill
                            className="object-contain rounded-md"
                        />
                    </div>

                    <DialogFooter className="flex justify-between gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="flex-1 bg-gray-900 text-white py-2 rounded hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            {isLoading ? (
                                <LoadingSpinner border="border-white" />
                            ) : isImgUpdating ? (
                                'Updating...'
                            ) : (
                                'Update Image'
                            )}
                        </button>

                        {/* Remove Button with Confirmation */}
                        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                            <AlertDialogTrigger asChild>
                                <button
                                    onClick={() => setIsConfirmOpen(true)}
                                    disabled={isLoading}
                                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will permanently remove your profile picture.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await handleRemoveImage();
                                            setIsDialogOpen(false);
                                            setIsConfirmOpen(false);
                                        }}
                                    >
                                        Yes, remove
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfileImage;
