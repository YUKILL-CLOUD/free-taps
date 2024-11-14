import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function DewormingRecordPage({
  params: { id, recordId },
}: {
  params: { id: string; recordId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/');
  }

  const dewormingRecord = await prisma.deworming.findUnique({
    where: { id: recordId },
    include: { 
      pet: {
        include: {
          user: true
        }
      }
    },
  });

  if (!dewormingRecord) {
    notFound();
  }

  // Check if user has access to this record
  const isAdmin = session.user.role === 'admin';
  const isPetOwner = dewormingRecord.pet.userId === session.user.id;
  
  if (!isAdmin && !isPetOwner) {
    redirect('/list/home');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Deworming Record Details</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <p className="font-bold">Pet Name:</p>
          <p>{dewormingRecord.pet.name}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Date:</p>
          <p>{new Date(dewormingRecord.date).toLocaleDateString()}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Deworming Name:</p>
          <p>{dewormingRecord.dewormingName}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Medicine Name:</p>
          <p>{dewormingRecord.medicineName}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Manufacturer:</p>
          <p>{dewormingRecord.manufacturer}</p>
        </div>
        {dewormingRecord.nextDueDate && (
          <div className="mb-4">
            <p className="font-bold">Next Due Date:</p>
            <p>{new Date(dewormingRecord.nextDueDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>
      <div className="flex space-x-4">
        <Link href={`/list/pets/${dewormingRecord.petId}`}>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Back to Pet Details
          </button>
        </Link>
        {(isAdmin) && (
          <Link href={`/list/pets/${dewormingRecord.petId}/petDeworming/${dewormingRecord.id}/edit`}>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Edit Deworming Record
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
