"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
}

interface EventCalendarProps {
  appointments: Appointment[];
}

const EventCalendar: React.FC<EventCalendarProps> = ({ appointments }) => {
  const [value, onChange] = useState<Value>(new Date());

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const appointmentsForDate = appointments.filter(
        (appointment) => appointment.date.toDateString() === date.toDateString()
      );
      
      if (appointmentsForDate.length > 0) {
        return (
          <div className="text-xs flex text-mainColor-600 font-semibold items-center">
            {appointmentsForDate.length} <Icon icon="mdi:calendar-clock"/>
          </div>
        );
      }
    }
    return null;
  };

  const selectedDate = value instanceof Date ? value : new Date();
  const appointmentsForSelectedDate = appointments.filter(
    (appointment) => appointment.date.toDateString() === selectedDate.toDateString()
  );
  
  const upcomingAppointments = appointments
    .filter(appointment => appointment.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="bg-white p-4 rounded-md shadow-lghover:shadow-xl transition-shadow duration-300">
        <Calendar 
        onChange={onChange} 
        value={value} 
        tileContent={tileContent}
        className="mb-4"
        />
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">
          Appointments for {selectedDate.toDateString()}
        </h2>
        {appointmentsForSelectedDate.length > 0 ? (
          <div className="space-y-2">
            {appointmentsForSelectedDate.map((appointment) => (
              <div
                key={appointment.id}
                className="p-2 rounded-md border border-mainColor-200 bg-mainColor-50"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-mainColor-700">{appointment.title}</h3>
                  <span className="text-sm text-mainColor-500">{appointment.time}</span>
                </div>
                <p className="text-sm text-mainColor-600 mt-1">{appointment.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No appointments for this date.</p>
        )}
       </div>
        <div className="w-full md:w-2/2 py-5">
          <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="p-2 rounded-md border border-mainColor-200 bg-mainColor-50">
                  <p className="font-medium text-mainColor-700">{appointment.title}</p>
                  <p className="text-sm text-mainColor-600">{appointment.description}</p>
                  <p className="text-sm text-mainColor-500">{appointment.date.toDateString()} - {appointment.time}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>
    </div>
  );
};


export default EventCalendar;
