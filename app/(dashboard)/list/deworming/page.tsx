import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DewormingForm } from '@/app/components/forms/DewormingForm';

export default async function DewormingPage() {
    // Fetch all pets for admin
    const pets = await prisma.pet.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    // Fetch all veterinarians
    const veterinarians = await prisma.veterinarian.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    const handleSubmit = async (formData: FormData) => {
        'use server';
        // Convert FormData to a plain object
        const data = Object.fromEntries(formData.entries());
        
        // Create the deworming record
        await prisma.deworming.create({
            data: {
                pet: { connect: { id: data.petId as string } },
                date: new Date(data.date as string),
                dewormingName: data.dewormingName as string,
                medicineName: data.medicineName as string,
                manufacturer: data.manufacturer as string,
                weight: parseFloat(data.weight as string),
                nextDueDate: data.nextDueDate ? new Date(data.nextDueDate as string) : null,
                veterinarian: { connect: { id: (data.veterinarianId as string) } },
            },
        });

        // Revalidate the path to refresh the data
        revalidatePath('/list/deworming');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Pet Deworming Management</h1>
            <Suspense fallback={<div>Loading form...</div>}>
                <DewormingForm 
                    pets={pets} 
                    veterinarians={veterinarians} 
                    onSubmit={handleSubmit} 
                />
            </Suspense>
        </div>
    );
}
