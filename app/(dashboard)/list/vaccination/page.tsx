import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { VaccinationForm } from '@/app/components/forms/VaccinationForm';

export default async function VaccinationPage() {


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
        
        // Create the vaccination record
        await prisma.vaccination.create({
            data: {
                pet: { connect: { id: data.petId as string } },
                date: new Date(data.date as string),
                vaccineName: data.vaccineName as string,
                medicineName: data.medicineName as string,
                manufacturer: data.manufacturer as string,
                weight: parseFloat(data.weight as string),
                nextDueDate: data.nextDueDate ? new Date(data.nextDueDate as string) : null,
                veterinarian: { connect: { id: data.veterinarianId as string } },
            },
        });

        // Revalidate the path to refresh the data
        revalidatePath('/list/vaccination');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Pet Vaccination Management</h1>
            <Suspense fallback={<div>Loading form...</div>}>
                <VaccinationForm 
                    pets={pets} 
                    veterinarians={veterinarians} 
                    onSubmit={handleSubmit} 
                />
            </Suspense>
        </div>
    );
}
