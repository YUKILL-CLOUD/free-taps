

import {prisma} from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";


function HealthRecordProfile({ healthRecord }: { healthRecord: any }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Pet Name</label>
                <p className="mt-1 text-gray-900">{healthRecord.pet.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="mt-1 text-gray-900">{new Date(healthRecord.date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Weight</label>
                <p className="mt-1 text-gray-900">{healthRecord.weight} kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Temperature</label>
                <p className="mt-1 text-gray-900">{healthRecord.temperature}°C</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                <p className="mt-1 text-gray-900">{healthRecord.diagnosis}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Treatment</label>
                <p className="mt-1 text-gray-900">{healthRecord.treatment}</p>
              </div>
              {healthRecord.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="mt-1 text-gray-900">{healthRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HealthRecordPage({
  params: { id, recordId },
}: {
  params: { id: string; recordId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/');
  }

  const healthRecord = await prisma.healthRecord.findUnique({
    where: { id: recordId },
    include: { 
        pet: {
          include: {
            user: true
          }
        }
      },
    });
  

  if (!healthRecord) {
    notFound();
  }

  // Check if user has access to this record
  const isAdmin = session.user.role === 'admin';
  const isPetOwner = healthRecord.pet.userId === session.user.id;
    
  if (!isAdmin && !isPetOwner) {
    redirect('/list/home');
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Health Record Details</h1>
      <HealthRecordProfile healthRecord={healthRecord} />
      
      <div className="mt-6 flex space-x-4">
        <Link href={`/list/pets/${healthRecord.petId}`}>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
            Back to Pet Details
          </button>
        </Link>
        {(isAdmin) && (
          <Link href={`/list/pets/${healthRecord.petId}/petHealthRecord/${healthRecord.id}/edit`}>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                  Edit Health Record
            </button>
        </Link>
        )}
      </div>
    </div>
  );
}