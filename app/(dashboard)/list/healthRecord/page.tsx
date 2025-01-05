import { Suspense } from 'react';
import { HealthRecordForm } from '@/app/components/forms/HealthRecordForm';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function HealthRecordPage() {
    // Fetch all pets for admin with user information
    const pets = await prisma.pet.findMany({
        select: {
            id: true,
            name: true,
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            },
        },
        orderBy: {
            name: 'asc',
        },
    });

    const handleSubmit = async (formData: FormData) => {
        'use server';
        // Convert FormData to a plain object
        const data = Object.fromEntries(formData.entries());
        
        // Create the health record
        await prisma.healthRecord.create({
            data: {
                petId: data.petId as string,
                date: new Date(data.date as string),
                weight: parseFloat(data.weight as string),
                temperature: parseFloat(data.temperature as string),
                diagnosis: data.diagnosis as string,
                treatment: data.treatment as string,
                notes: data.notes as string,
            },
        });

        // Revalidate the path to refresh the data
        revalidatePath('/list/healthRecord');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Pet Health Record Management</h1>
            <Suspense fallback={<div>Loading form...</div>}>
                <HealthRecordForm pets={pets} onSubmit={handleSubmit} />
            </Suspense>
        </div>
    );
}
