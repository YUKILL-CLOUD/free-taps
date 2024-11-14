"use client";

import { useState, useEffect } from 'react';
import { VeterinarianForm } from '@/app/components/forms/VeterinarianForm';
import VeterinarianProfile from '@/app/components/front/VeterinarianProfile';
import { updateVeterinarian, getVeterinarianData } from '@/lib/actions';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Veterinarian } from '@prisma/client';

export default function VeterinarianPage() {
    const [veterinarian, setVeterinarian] = useState<Veterinarian | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchVeterinarianData();
    }, []);

    const fetchVeterinarianData = async () => {
        const data = await getVeterinarianData();
        setVeterinarian(data);
    };

    const onSubmit = async (formData: FormData) => {
        const result = await updateVeterinarian(formData);
        if (result.message) {
            toast.success("Veterinarian information updated successfully!");
            fetchVeterinarianData();
            setIsEditing(false);
        } else {
            toast.error(result.message || "Failed to update veterinarian information");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Veterinarian Profile</h1>
            
            {!isEditing && (
                <>
                    <VeterinarianProfile veterinarian={veterinarian} />
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Edit Information
                    </button>
                </>
            )}

            {isEditing && (
                <VeterinarianForm 
                    initialData={veterinarian || undefined}
                    onSubmit={onSubmit}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}
