import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { PrescriptionForm } from "@/app/components/forms/PrescriptionForm";
import Link from "next/link";

export default async function NewPrescriptionPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }

  // Fetch the specific pet
  const pet = await prisma.pet.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  });

  if (!pet) {
    notFound();
  }

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
    
    const data = Object.fromEntries(formData.entries());
    
    const newPrescription = await prisma.prescription.create({
      data: {
        pet: { connect: { id: data.petId as string } },
        medication: [{
            name: data.medicineName as string,
            dosage: data.dosage as string,
            frequency: data.frequency as string,
            duration: data.duration as string,
        }],
        veterinarian: { connect: { id: data.veterinarianId as string } },
        user: { connect: { id: session.user.id } },
        status: "active",
      },
    });

    // Redirect back to the pet's page after successful creation
    redirect(`/list/pets/${newPrescription.petId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">New Prescription for {pet.name}</h1>
        <Link 
          href={`/list/pets/${id}`}
          className="inline-block mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back
        </Link>
        <div className="bg-white shadow-md rounded-lg p-6">
          <PrescriptionForm
            pets={[pet]}
            veterinarians={veterinarians}
            preSelectedPetId={pet.id}
            userId={session.user.id}
            onSubmit={handleSubmit}
            defaultValues={{
              petId: pet.id,
              date: new Date(),
            }}
          />
        </div>
      </div>
    </div>
  );
}