import React from "react";
import EventCalendar from "@/app/components/front/EventCalendar";
import UserCard from "@/app/components/front/UseCard";
import CountChartContainer from "@/app/components/front/CountChartContainer";
import { prisma } from "@/lib/prisma";
import AppointmentChart from "@/app/components/front/FinanceChart";
import BigCalendar from "@/app/components/front/BigCalendar";
import BigCalendarAdmin from "@/app/components/front/BigCalendarAdmin";

interface AppointmentData {
  date: string;
  pending: number;
  scheduled: number;
  completed: number;
  missed: number;
}

const AdminPage = async () => {
  // Fetch upcoming appointments
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: new Date(),
      },
      status: 'scheduled',
    },
    include: {
      pet: true,
      service: true,
      user: true,
    },
    orderBy: {
      date: 'asc',
    },
    
  });
 // Format appointments for the EventCalendar component
 const formattedAppointments = upcomingAppointments.map(appointment => ({
  id: appointment.id,
  title: `${appointment.pet.name} - ${appointment.service.name}`,
  date: appointment.date,
  time: appointment.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  description: `Owner: ${appointment.user.firstName} ${appointment.user.lastName}`,
}));

  async function getAppointmentData(): Promise<AppointmentData[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appointments = await prisma.appointment.groupBy({
      by: ['date', 'status'],
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'asc', // Add this to sort by date ascending
      },
    });

    const processedData = appointments.reduce<Record<string, AppointmentData>>((acc, curr) => {
      const date = curr.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          pending: 0,
          scheduled: 0,
          completed: 0,
          missed: 0,
        };
      }
      if (curr.status) {
        acc[date][curr.status as keyof Omit<AppointmentData, 'date'>] = curr._count.id;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(processedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  const appointmentData = await getAppointmentData();
  
  const getAppointmentCountForDate = (date: Date) => {
    return upcomingAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getDate() === date.getDate()
      );
    }).length;
  };

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between  flex-wrap">
            <UserCard type="user" />
            <UserCard type="pet" />
            <UserCard type="appointment" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-3/3 h-[450px] shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CountChartContainer />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px] shadow-lg hover:shadow-xl transition-shadow duration-300">
          <AppointmentChart data={appointmentData} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <div className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* <EventCalendar appointments={formattedAppointments} /> */}
          <BigCalendarAdmin
            events={upcomingAppointments.map(appointment => {
              // Get the date parts
              const isoDate = appointment.date.toISOString();
              const [datePart] = isoDate.split("T");
              
              // Get the time parts
              const isoTime = appointment.time.toISOString();
              const timeString = isoTime.split('T')[1].split('.')[0];
              const [hours, minutes] = timeString.split(':').map(Number);
              
              // Create start date with combined date and time
              const [year, month, day] = datePart.split("-");
              const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
    </div>
  );
};
export default AdminPage;
