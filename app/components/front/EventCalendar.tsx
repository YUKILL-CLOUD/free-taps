"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatDate } from "@/lib/dateFormat";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval } from "date-fns";


type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  status: string;
}

interface EventCalendarProps {
  appointments: Appointment[];
}

const EventCalendar: React.FC<EventCalendarProps> = ({ appointments }) => {
  const [value, onChange] = useState<Value>(new Date());
  const [filter, setFilter] = useState<string>("all");
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); 
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const monthStart = startOfMonth(today); 
  const monthEnd = endOfMonth(today);

  const formatCustomDate = (date: Date) => {
    const isoDate = date.toISOString();
    const [datePart] = isoDate.split("T");
    const [year, month, day] = datePart.split("-");
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  };

   // Filtered upcoming appointments based on selected filter
   const filteredUpcomingAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);

    if (filter === "today") {
      return isSameDay(appointmentDate, today);
    }
    if (filter === "this_week") {
      return isWithinInterval(appointmentDate, { start: weekStart, end: weekEnd });
    }
    if (filter === "this_month") {
      return isWithinInterval(appointmentDate, { start: monthStart, end: monthEnd });
    }
    return appointmentDate >= today; // Default: show all upcoming
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
  const selectedDate = value instanceof Date ? value : new Date();
  const appointmentsForSelectedDate = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    return isSameDay(appointmentDate, selectedDate);
  });

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const appointmentsForDate = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getFullYear() === date.getFullYear() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getDate() === date.getDate()
        );
      });
      
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
  
  const upcomingAppointments = appointments
    .filter(appointment => appointment.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
    

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
          Appointments for  Appointments for {formatCustomDate(selectedDate)}
        </h2>
        <div className={`${appointmentsForSelectedDate.length > 5 ? 'max-h-[250px] overflow-y-auto' : ''}`}>
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
      </div>
        {/* Upcoming Appointments with Filter */}
        <div className="w-full md:w-2/2 py-5">
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-4">
          {["all", "today", "this_week", "this_month"].map((option) => (
            <button
              key={option}
              className={`px-3 py-1 rounded-md ${
                filter === option ? "bg-mainColor-500 text-white" : "bg-mainColor-100 text-mainColor-700"
              }`}
              onClick={() => setFilter(option)}
            >
              {option === "all" ? "All" : option.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Filtered Appointment List */}
        <div className={`${filteredUpcomingAppointments.length > 5 ? "max-h-[300px] overflow-y-auto" : ""}`}>
          {filteredUpcomingAppointments.length > 0 ? (
            <ul className="space-y-2">
              {filteredUpcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="p-2 rounded-md border border-mainColor-200 bg-mainColor-50">
                  <p className="font-medium text-mainColor-700">{appointment.title}</p>
                  <p className="text-sm text-mainColor-600">{appointment.description}</p>
                  <p className="text-sm text-mainColor-500">
                    {format(new Date(appointment.date), "MMM dd, yyyy")} - {appointment.time}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
