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

  const p = searchParams.page ? parseInt(searchParams.page as string) : 1;

  const [appointments, count] = await prisma.$transaction([
    prisma.appointment.findMany({
      where: { userId: session.user.id },
      include: {
        pet: true,
        service: true,
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.appointment.count({ where: { userId: session.user.id } }),
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
      initialAppointments={appointments}
      initialCount={count}
      pets={pets}
      services={services}
      userId={session.user.id}
    />
  );
}