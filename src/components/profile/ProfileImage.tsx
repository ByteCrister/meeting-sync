'use client';

import { Pencil, X } from 'lucide-react';
import Image from 'next/image';
import React, { ChangeEvent } from 'react';
import LoadingSpinner from '../global-ui/ui-component/LoadingSpinner';
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
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleRemoveImage: () => Promise<void>;
};

const ProfileImage = ({
    value,
    handleImageClick,
    handleFileChange,
    fileInputRef,
    isLoading,
    handleRemoveImage,
}: ProfileImageTypes) => {
    const imageSrc = value && value.trim().length > 0 ? value : "/images/blank_profile_image.png";

    return (
        <div className="flex justify-center mb-8">
            {/* Hidden File Input */}
            {!isLoading && (
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            )}

            {/* Avatar Image Container with group for hover */}
            <div
                onClick={handleImageClick}
                className="relative w-32 h-32 rounded-full border-4 border-blue-500 shadow-md overflow-hidden group cursor-pointer"
            >
                <Image
                    src={imageSrc}
                    alt="Profile"
                    fill
                    className="object-cover"
                />

                {/* Overlay with pencil and remove icons */}
                <div
                    className={`absolute inset-0 bg-opacity-40 flex items-center justify-center opacity-0 bg-stone-600 group-hover:opacity-50 transition`}
                >
                    <div className={`absolute inset-0 flex items-center justify-center ${isLoading ? 'opacity-100 bg-stone-100' : 'opacity-0 bg-stone-600'} group-hover:opacity-50 transition`}>
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Pencil className="text-white" size={22} />
                                {value.trim().length > 0 && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                type="button"
                                                name='remove-image'
                                                className="bg-white rounded-full p-1 shadow hover:bg-red-100 transition"
                                                title="Remove Image"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <X size={16} className="text-red-500" />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className='bg-white'>
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
                                                    }}
                                                >
                                                    Yes, remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileImage;