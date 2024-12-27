import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import { ITEM_PER_PAGE } from "@/lib/settings";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/');
  }

  const pages = {
    pending: parseInt(searchParams.pendingPage || '1'),
    scheduled: parseInt(searchParams.scheduledPage || '1'),
    completed: parseInt(searchParams.completedPage || '1'),
    missed: parseInt(searchParams.missedPage || '1'),
  };

  async function getAppointmentsByStatus(status: string, page: number) {
    const where = status === 'missed' 
      ? {
          userId: session?.user.id,
          OR: [
            { status: 'missed' },
            { 
              status: 'scheduled',
              date: { lt: new Date() }
            }
          ]
        }
      : { 
          userId: session?.user.id,
          status 
        };

    const [appointments, count] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        include: {
          pet: true,
          service: true,
          user: true,
        },
        orderBy: { date: status === 'completed' || status === 'missed' ? 'desc' : 'asc' },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (page - 1),
      }),
      prisma.appointment.count({ where }),
    ]);

    return { appointments, count };
  }

  const [pending, scheduled, completed, missed] = await Promise.all([
    getAppointmentsByStatus('pending', pages.pending),
    getAppointmentsByStatus('scheduled', pages.scheduled),
    getAppointmentsByStatus('completed', pages.completed),
    getAppointmentsByStatus('missed', pages.missed),
  ]);

  const pets = await prisma.pet.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  const services = await prisma.service.findMany({
    select: { id: true, name: true },
  });

  return (
    <AppointmentsClient
      initialPendingAppointments={pending.appointments}
      initialScheduledAppointments={scheduled.appointments}
      initialCompletedAppointments={completed.appointments}
      initialMissedAppointments={missed.appointments}
      initialCounts={{
        pending: pending.count,
        scheduled: scheduled.count,
        completed: completed.count,
        missed: missed.count,
      }}
      pets={pets}
      services={services}
      userId={session.user.id}
    />
  );
}