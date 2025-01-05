import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { VaccinationForm } from "@/app/components/forms/VaccinationForm";
import Link from "next/link";

export default async function NewVaccinationPage({
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
      user: {
        select: {
            firstName: true,
            lastName: true,
            email: true,
        }
    },
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
    
    const newVaccination = await prisma.vaccination.create({
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

    // Redirect back to the pet's page after successful creation
    redirect(`/list/pets/${newVaccination.petId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">New Vaccination Record for {pet.name}</h1>
        <Link 
          href={`/list/pets/${id}`}
          className="inline-block mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back
        </Link>
        <div className="bg-white shadow-md rounded-lg p-6">
          <VaccinationForm
            pets={[pet]}
            veterinarians={veterinarians}
            preSelectedPetId={pet.id}
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