'use client';

import { Pencil } from 'lucide-react';
import Image from 'next/image';
import React, { ChangeEvent, useState } from 'react';
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
    //   handleImageClick,
    handleFileChange,
    fileInputRef,
    isLoading,
    isImgUpdating,
    handleRemoveImage,
}: ProfileImageTypes) => {
    const imageSrc = value && value.trim().length > 0 ? value : "/images/blank_profile_image.png";
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

            {/* Main Clickable Image with Hover Icons */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div
                        onClick={() => setIsDialogOpen(true)}
                        className="relative w-32 h-32 rounded-full border-4 border-blue-500 shadow-md overflow-hidden group cursor-pointer"
                    >
                        <Image
                            src={imageSrc}
                            alt="Profile"
                            fill
                            className="object-cover"
                        />

                        <div className={`absolute inset-0 bg-opacity-40 flex items-center justify-center opacity-0 bg-stone-600 group-hover:opacity-50 transition`}>
                            <div className={`absolute inset-0 flex items-center justify-center ${isLoading ? 'opacity-100 bg-stone-100' : 'opacity-0 bg-stone-600'} group-hover:opacity-50 transition`}>
                                {isLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Pencil className="text-white" size={22} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogTrigger>

                {/* Fullscreen Dialog Modal */}
                <DialogContent className="max-w-md bg-white p-4">
                    <DialogHeader>
                        <DialogTitle className="text-center">Profile Image</DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-64 relative mb-4">
                        <Image
                            src={imageSrc}
                            alt="Full Profile"
                            fill
                            className="object-contain rounded-md"
                        />
                    </div>
                    <DialogFooter className="flex justify-between">
                        <button
                            id='change-image'
                            disabled={isLoading}
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            {isLoading ? <LoadingSpinner border='border-white' /> : isImgUpdating ? 'Changing...' : 'Change'}
                        </button>
                        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                            <AlertDialogTrigger asChild>
                                <button
                                    id='remove-image'
                                    disabled={isLoading}
                                    className="bg-red-900 text-white px-4 py-2 rounded hover:bg-red-700"
                                    onClick={() => setIsConfirmOpen(true)}
                                >
                                    Remove
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will remove your profile picture. You can re-upload it later.
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
