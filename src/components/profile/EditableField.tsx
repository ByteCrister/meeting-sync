'use client';

import { Pencil, Check } from 'lucide-react';
import { useState } from 'react';
import LoadingSpinner from '../global-ui/ui-component/LoadingSpinner';
import Profession from './Profession';
import TimeZone from './TimeZone';

const EditableField = ({
    label,
    value,
    field,
    isLoading,
    handleLoadingChange,
    updateProfileField
}: {
    label: string;
    value: string;
    isLoading: boolean;
    field: "title" | "timeZone" | "username" | "image" | "profession";
    handleLoadingChange: (isLoading: boolean) => void;
    updateProfileField: (field: ("title" | "timeZone" | "username" | "image" | "profession"), value: string) => Promise<void>
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value ?? '');
    const [hovered, setHovered] = useState(false);

    const handleSave = () => {
        handleLoadingChange(true);
        updateProfileField(field, tempValue);
        setIsEditing(false);
        handleLoadingChange(false);

    };

    return (
        <div
            className="relative bg-white rounded-xl shadow p-4 transition group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    {
                        label === 'Profession'
                            ? <Profession OnChange={(value) => setTempValue(value)} />
                            : label === 'Timezone'
                                ? <TimeZone OnChange={(newValue) => setTempValue(newValue)} />
                                : <input
                                    id={label}
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                    }

                    {
                        isLoading
                            ? <LoadingSpinner />
                            : <button
                                onClick={handleSave}
                                className="text-green-600 hover:text-green-800 transition cursor-pointer"
                            >
                                <Check size={20} />
                            </button>
                    }

                </div>
            ) : (
                <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsEditing(true)}
                >
                    <p className="text-lg text-gray-800">{value}</p>
                    {hovered && (
                        <div className="text-gray-400 hover:text-blue-600 transition">
                            <Pencil size={18} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EditableField;
