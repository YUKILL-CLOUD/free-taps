'use client'
import { useState } from "react";
import BigCalendar from "@/app/components/front/BigCalendar";
import Announcements from "@/app/components/front/Announcements";
import UserProfileSummary from "@/app/components/front/UserProfileSummary";
import UpcomingAppointments from "@/app/components/front/UpcomingAppointments";
import PetSummary from "@/app/components/front/PetSummary";
import { User, Pet } from "@prisma/client";
import { AppointmentWithRelations } from "@/app/components/front/AppointmentTable";
import { Announcement } from '@/types/announcement';
import { Activity } from '@/types/activity';
import RecentActivities from "@/app/components/front/RecentActivities";
interface UserPageClientProps {
  initialUser: User ;
  upcomingAppointments: AppointmentWithRelations[];
  userPets: Pet[];
  announcements: Announcement[];
  activities: Activity[];
}

export default function UserPageClient({ 
  initialUser, 
  upcomingAppointments, 
  userPets,
  announcements,
  activities
}: UserPageClientProps) {
  const [user] = useState<User | null>(initialUser);

  if (!user) return <div>User not found</div>;

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <UserProfileSummary user={user} />
        <div className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200">
          <h1 className="text-xl font-semibold mb-4">Schedule</h1>
          <div style={{ height: '500px' }}>
            <BigCalendar
              events={upcomingAppointments.map(appointment => {
                // Get the date parts
                const isoDate = appointment.date.toISOString();
                const [datePart] = isoDate.split("T");
                
                // Get the time parts
                const isoTime = appointment.time.toISOString();
                const timeString = isoTime.split('T')[1].split('.')[0];
                const [hours, minutes] = timeString.split(':').map(Number);
                
                // Create start date with combined date and time
                const startDate = new Date(datePart);
                startDate.setHours(hours, minutes, 0, 0);
                
                // Create end date (1 hour after start)
                const endDate = new Date(startDate);
                endDate.setHours(startDate.getHours() + 1);
                
                return {
                  title: `${appointment.pet.name}`,
                  fullTitle: `${appointment.pet.name} - ${appointment.service.name}`,
                  start: startDate,
                  end: endDate,
                  allDay: false,
                };
              })}
            />
          </div>
        </div>
        <PetSummary pets={userPets} />
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <Announcements announcements={announcements} />
        <UpcomingAppointments appointments={upcomingAppointments} />
        <RecentActivities activities={activities} />
      </div>
    </div>
  );
}
