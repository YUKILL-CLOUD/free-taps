import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export default async function VaccinationRecordPage({
  params: { id, recordId },
}: {
  params: { id: string; recordId: string };
}) {
    const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/');
  }

  const vaccinationRecord = await prisma.vaccination.findUnique({
    where: { id: recordId },
    include: { pet: true },
  });

  if (!vaccinationRecord) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vaccination Record Details</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <p className="font-bold">Pet Name:</p>
          <p>{vaccinationRecord.pet.name}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Date:</p>
          <p>{new Date(vaccinationRecord.date).toLocaleDateString()}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Vaccine Name:</p>
          <p>{vaccinationRecord.vaccineName}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Medicine Name:</p>
          <p>{vaccinationRecord.medicineName}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Manufacturer:</p>
          <p>{vaccinationRecord.manufacturer}</p>
        </div>
        {vaccinationRecord.nextDueDate && (
          <div className="mb-4">
            <p className="font-bold">Next Due Date:</p>
            <p>{new Date(vaccinationRecord.nextDueDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>
      <div className="flex space-x-4">
        <Link href={`/list/pets/${vaccinationRecord.petId}`}>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Back to Pet Details
          </button>
        </Link>
          <Link href={`/list/pets/${vaccinationRecord.petId}/petVaccination/${vaccinationRecord.id}/edit`}>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Edit Vaccination Record
            </button>
          </Link>
      </div>
    </div>
  );
}
