import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ITEM_PER_PAGE } from "@/lib/settings";
import AdminAppointmentsClient from './AdminAppointmentsClient';
import ErrorBoundary from '@/app/components/front/ErrorBoundary';
import { AppointmentWithRelations } from '@/app/components/front/AppointmentTable';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

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
    getAppointments('pending', pages.pending),
    getAppointments('scheduled', pages.scheduled),
    getAppointments('completed', pages.completed),
    getAppointments('missed', pages.missed),
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

async function getAppointments(status: string, page: number) {
  const where = status === 'missed' 
    ? {
        OR: [
          { status: 'missed' },
          { 
            status: 'scheduled',
            date: { lt: new Date() }
          }
        ]
      }
    : { status };

  const [appointments, count] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      include: { 
        pet: true,
        service: true,
         user: true,
         healthRecords: true,
         vaccinations: true,
         dewormings: true,
        },
      orderBy: { date: status === 'completed' || status === 'missed' ? 'desc' : 'asc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, count };
}
