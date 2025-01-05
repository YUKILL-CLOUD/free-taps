import {prisma} from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { HealthRecordForm } from "@/app/components/forms/HealthRecordForm";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

export default async function EditHealthRecordPage({
  params: { id, recordId },
}: {
  params: { id: string; recordId: string };
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/');
  }

  const healthRecord = await prisma.healthRecord.findUnique({
    where: { id: recordId },
    include: { pet: true },
  });

  if (!healthRecord) {
    notFound();
  }

  const pet = await prisma.pet.findUnique({
    where: { id: id },
    select: { 
      id: true, 
      name: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
  });

  if (!pet) {
    notFound();
  }

  const updateHealthRecord = async (formData: FormData) => {
    'use server';
    
    const weight = parseFloat(formData.get('weight') as string);
    const temperature = parseFloat(formData.get('temperature') as string);
    const diagnosis = formData.get('diagnosis') as string;
    const treatment = formData.get('treatment') as string;
    const notes = formData.get('notes') as string;
    const date = new Date(formData.get('date') as string);

    await prisma.healthRecord.update({
      where: { id: recordId },
      data: {
        weight,
        temperature,
        diagnosis,
        treatment,
        notes,
        date,
        // updatedAt will be automatically set by Prisma
      },
    });

    redirect(`/list/pets/${healthRecord.petId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/list/pets/${healthRecord.petId}/petHealthRecord/${recordId}`}>
          <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200">
            Go Back
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Health Record for {pet.name}</h1>
      </div>
      <HealthRecordForm
        pets={[pet]}
        preSelectedPetId={pet.id}
        initialData={healthRecord}
        onSubmit={updateHealthRecord}
      />
      {healthRecord.updatedAt && (
        <p className="mt-4 text-sm text-gray-500">
          Last updated: {formatDateTime(healthRecord.updatedAt)}
        </p>
      )}
    </div>
  );
}
