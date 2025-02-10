import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ITEM_PER_PAGE } from "@/lib/settings";
import AdminAppointmentsClient from './AdminAppointmentsClient';
import ErrorBoundary from '@/app/components/front/ErrorBoundary';
import { AppointmentWithRelations } from '@/app/components/front/AppointmentTable';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { startOfWeek, endOfWeek } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { hasTimeConflict } from '@/lib/appointments';

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const pages = {
    pending: parseInt(searchParams.pendingPage || '1'),
    scheduled: parseInt(searchParams.scheduledPage || '1'),
    completed: parseInt(searchParams.completedPage || '1'),
    missed: parseInt(searchParams.missedPage || '1'),
  };

  const [
    { appointments: pendingAppointments, count: pendingCount },
    { appointments: scheduledAppointments, count: scheduledCount },
    { appointments: completedAppointments, count: completedCount },
    { appointments: missedAppointments, count: missedCount },
  ] = await Promise.all([
    getAppointments('pending', pages.pending, searchParams.dateFilter),
    getAppointments('scheduled', pages.scheduled, searchParams.dateFilter),
    getAppointments('completed', pages.completed, searchParams.dateFilter),
    getAppointments('missed', pages.missed, searchParams.dateFilter),
  ]);

  return (
    <ErrorBoundary>
      <AdminAppointmentsClient
        initialPendingAppointments={pendingAppointments as AppointmentWithRelations[]}
        initialScheduledAppointments={scheduledAppointments as AppointmentWithRelations[]}
        initialCompletedAppointments={completedAppointments as AppointmentWithRelations[]}
        initialMissedAppointments={missedAppointments as AppointmentWithRelations[]}
        initialCounts={{
          pending: pendingCount,
          scheduled: scheduledCount,
          completed: completedCount,
          missed: missedCount,
        }}
      />
    </ErrorBoundary>
  );
}

async function getAppointments(status: string, page: number, dateFilter?: string) {
  let dateCondition = {};
  const timeZone = 'Asia/Manila'; // GMT+8
  
  if (dateFilter === 'today') {
    const today = toZonedTime(new Date(), timeZone);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    dateCondition = {
      date: {
        gte: today,
        lt: tomorrow,
      }
    };
  } else if (dateFilter === 'week') {
    const today = toZonedTime(new Date(), timeZone);
    const startOfWeekDate = startOfWeek(today);
    const endOfWeekDate = endOfWeek(today);
    
    dateCondition = {
      date: {
        gte: startOfWeekDate,
        lte: endOfWeekDate,
      }
    };
  }

  const where = status === 'missed' 
    ? {
        OR: [
          { status: 'missed' },
          { 
            status: 'scheduled',
            date: { lt: new Date() }
          }
        ],
        ...dateCondition
      }
    : { 
        status,
        ...dateCondition
      };

  const appointments = await prisma.appointment.findMany({
    where,
    include: { 
      pet: true,
      service: true,
      user: true,
      healthRecords: true,
      vaccinations: true,
      dewormings: true,
    },
    orderBy: [
      { date: status === 'completed' || status === 'missed' ? 'desc' : 'asc' },
      { time: 'asc' }
    ],
  });

  // Check for time conflicts in scheduled appointments
  if (status === 'scheduled') {
    const appointmentsWithConflicts = appointments.map(appt => ({
      ...appt,
      hasConflict: appointments.some((other) => 
        other.id !== appt.id && 
        hasTimeConflict(appt.date, appt.time, other.date, other.time)
      )
    }));
    return { 
      appointments: appointmentsWithConflicts.slice(ITEM_PER_PAGE * (page - 1), ITEM_PER_PAGE * page), 
      count: appointments.length 
    };
  }

  const paginatedAppointments = appointments.slice(
    ITEM_PER_PAGE * (page - 1),
    ITEM_PER_PAGE * page
  );

  return { 
    appointments: paginatedAppointments, 
    count: appointments.length 
  };
}
