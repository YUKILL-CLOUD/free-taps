import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { Pet, Appointment, User, Vaccination, Deworming, HealthRecord } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import FormModal from "@/app/components/front/FormModal";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { HealthRecordsTableClient } from "@/app/components/front/HealthRecordsTableClient";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { VaccinationsTableClient } from '@/app/components/front/VaccinationsTableClient';
import { DewormingsTableClient } from "@/app/components/front/DewormingTableClient";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
// import { PrescriptionList } from "@/components/PrescriptionList";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { 
  Bloodtype, 
  CalendarMonth, 
  Cake,
  Transgender 
} from '@mui/icons-material';

type PetWithRelations = Pet & {
  appointments: Appointment[];
  user: User;
  vaccinations: Vaccination[];
  dewormings: Deworming[];
  healthRecords: HealthRecord[];
};

const SinglePetPage = async ({ params, searchParams }: { 
  params: { id: string }, 
  searchParams: { [key: string]: string | undefined } 
}) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/');
  }

  const petId = params.id;

  const healthRecordsPage = searchParams.healthRecordsPage ? parseInt(searchParams.healthRecordsPage as string) : 1;
  const vaccinationsPage = searchParams.vaccinationsPage ? parseInt(searchParams.vaccinationsPage as string) : 1;
  const dewormingsPage = searchParams.dewormingsPage ? parseInt(searchParams.dewormingsPage as string) : 1;

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      user: true,
      appointments: true,
      healthRecords: {
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (healthRecordsPage - 1),
        orderBy: { date: 'desc' },
      },
      vaccinations: {
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (vaccinationsPage - 1),
        orderBy: { date: 'desc' },
      },
      dewormings: {
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (dewormingsPage - 1),
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!pet) {
    notFound();
  }

  const [healthRecordsCount, vaccinationsCount, dewormingsCount] = await prisma.$transaction([
    prisma.healthRecord.count({ where: { petId } }),
    prisma.vaccination.count({ where: { petId } }),
    prisma.deworming.count({ where: { petId } }),
  ]);

  // Check if user is authorized to view this pet
  const isAdmin = session.user.role === 'admin';
  const isPetOwner = pet.userId === session.user.id;
  
  if (!isAdmin && !isPetOwner) {
    redirect('/unauthorized');
  }

  const calculateAge = (birthday: Date) => {
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();
    const weeks = Math.floor(ageDifMs / (7 * 24 * 60 * 60 * 1000));
    
    if (years === 0) {
      if (months === 0) {
        return `${weeks} week${weeks !== 1 ? 's' : ''}`;
      } else {
        return `${months} month${months !== 1 ? 's' : ''}`;
      }
    } else {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 bg-gray-100">
      {/* Pet Info Card */}
      <div className="bg-mainColor-light py-6 px-4 rounded-md flex-1 flex flex-col sm:flex-row gap-4 shadow-lg">
        <div className="w-full sm:w-1/3 flex justify-center items-center">
          {pet.img ? (
            <Image
              src={pet.img}
              alt={pet.name}
              width={144}
              height={144}
              className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-mainColor-300 shadow-[0_0_25px_rgba(0,0,0,0.3)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            />
          ) : (
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-mainColor-300 shadow-[0_0_25px_rgba(0,0,0,0.3)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-gray-100 flex items-center justify-center">
              <Icon 
                icon="tabler:paw-filled"
                className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
              />
            </div>
          )}
        </div>
        <div className="w-full sm:w-2/3 flex flex-col justify-between gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Name: {pet.name}</h1>
            {(isAdmin || isPetOwner) && (
              <FormModal table="pet" type="update" data={pet} trigger={
                <Button variant="ghost" size="sm">
                  <Pencil className="w-4 h-4 text-green-250" />
                </Button>
              }/>
            )}
          </div>
          <p className="text-md text-gray-500 font-semibold">
            Type: {pet.type}
          </p>
          <p className="text-md text-gray-500">
            Breed: {pet.breed}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Bloodtype className="w-6 h-6 text-gray-600"/>
              <span>{pet.bloodType}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarMonth className="w-6 h-6 text-gray-600" />
              <span>{pet.birthday.toDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Transgender className="w-6 h-6 text-gray-600" />
              <span>{pet.sex}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cake className="w-6 h-6 text-gray-600" />
              <span>{calculateAge(pet.birthday)} old</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Records Table */}
      <div className="bg-white rounded-md p-4 shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Health Records</h2>
       
          <HealthRecordsTableClient
          initialRecords={pet.healthRecords}
          initialCount={healthRecordsCount}
          initialPage={healthRecordsPage}
          petId={pet.id}
          />
        
      </div>

      {/* Vaccinations Table */}
      <div className="bg-white rounded-md p-4 shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Vaccinations</h2>
        
        <VaccinationsTableClient
        initialVaccinations={pet.vaccinations}
        initialCount={vaccinationsCount}
        initialPage={vaccinationsPage}
        petId={pet.id}
      />
       
      </div>

      {/* Dewormings Table */}
      <div className="bg-white rounded-md p-4 shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Dewormings</h2>
        
            <DewormingsTableClient
            initialDewormings={pet.dewormings}
            initialCount={dewormingsCount}
            initialPage={dewormingsPage}
            petId={pet.id}
          />
       
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* UPCOMING APPOINTMENTS */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Upcoming Appointments</h2>
          {pet.appointments.filter(app => new Date(app.date) > new Date()).length > 0 ? (
            pet.appointments.filter(app => new Date(app.date) > new Date()).map((app) => (
              <div key={app.id} className="mb-2 p-2 bg-gray-100 rounded">
                <p className="font-medium">{app.date.toDateString()}</p>
                <p>Status: {app.status}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No upcoming appointments</p>
          )}
        </div>

        {/* SHORTCUTS */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-mainColor-700">Shortcuts</h2>
          <div className="flex flex-wrap gap-2">
          
           

            <Link 
              href={`/list/vaccination`} 
              className="p-2 bg-mainColor-100 text-mainColor-800 rounded-md text-sm flex items-center hover:bg-mainColor-300 transition-colors"
            >
              <Icon icon="mdi:needle" className="mr-2 w-5 h-5" />
              Add Vaccination
            </Link>
            <Link 
              href={`/list/deworming`} 
              className="p-2 bg-mainColor-200 text-mainColor-800 rounded-md text-sm flex items-center hover:bg-mainColor-300 transition-colors"
            >
              <Icon icon="mdi:pill" className="mr-2 w-5 h-5" />
              Add Deworming
            </Link>
            
            <Link 
              href={`/health-records/new?petId=${pet.id}`} 
              className="p-2 bg-mainColor-400 text-white rounded-md text-sm flex items-center hover:bg-mainColor-500 transition-colors"
            >
              <Icon icon="mdi:stethoscope" className="mr-2 w-5 h-5" />
              Add Health Record
            </Link>
            <Link 
              href={`/prescriptions/new?petId=${pet.id}`} 
              className="p-2 bg-mainColor-300 text-mainColor-800 rounded-md text-sm flex items-center hover:bg-mainColor-400 transition-colors"
            >
              <Icon icon="mdi:prescription" className="mr-2 w-5 h-5" />
              Add Prescription
            </Link>
         
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePetPage;
