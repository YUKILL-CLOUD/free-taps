'use client'

import { formatDate } from "@/lib/dateFormat";
import { format } from "date-fns";
import { Appointment, Pet, Service } from '@prisma/client';

type AppointmentWithRelations = Appointment & {
  pet: Pet;
  service: Service;
}

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithRelations[];
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const scheduledAppointments = appointments.filter(
    appointment => appointment.status === 'scheduled'
  );

  return (
    <div className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200">
      <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
      {scheduledAppointments.length > 0 ? (
        <ul className="space-y-2">
          {scheduledAppointments.map((appointment) => (
            <li key={appointment.id} className="border-b pb-2">
              <p className="font-medium">{appointment.pet.name}</p>
              <p className="text-sm text-gray-600">{appointment.service.name}</p>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{(() => {
                  const isoDate = appointment.date.toISOString();
                  const [datePart] = isoDate.split("T");
                  const [year, month, day] = datePart.split("-");
                  
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
                })()}</span>
                <span>•</span>
                <span>{(() => {
                  const isoTime = appointment.time.toISOString();
                  const timeString = isoTime.split('T')[1].split('.')[0];
                  const [hours, minutes] = timeString.split(':').map(Number);
                  
                  // Convert to 12-hour format
                  const hour12 = hours % 12 || 12;
                  const period = hours >= 12 ? 'PM' : 'AM';
                  
                  // Format minutes to always show two digits
                  const formattedMinutes = minutes.toString().padStart(2, '0');
                  
                  return `${hour12}:${formattedMinutes} ${period}`;
                })()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming appointments.</p>
      )}
    </div>
  );
}