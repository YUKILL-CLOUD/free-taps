'use server'
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import UserPageClient from './UserPageClient';
import { fetchUserAppointments, getAnnouncements, fetchActivities } from '@/lib/actions';
import { prisma } from '@/lib/prisma';

export default async function UserPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect('/');

  // Fetch complete user data from Prisma
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userData) return redirect('/');

  const upcomingAppointments = await fetchUserAppointments(userData.id);

  const userPets = await prisma.pet.findMany({
    where: { userId: userData.id },
    take: 5,
  });

  const announcements = await getAnnouncements(3);
  const activities = await fetchActivities(userData.id);

  return (
    <UserPageClient 
      initialUser={userData}
      upcomingAppointments={upcomingAppointments}
      userPets={userPets}
      announcements={announcements}
      activities={activities}
    />
  );
}
