import Cta from '@/app/components/front/CTA'
import Faqs from '@/app/components/front/Faqs'
import HeroSection from '@/app/components/front/Hero'
import React from 'react'
import { getServerSession } from "next-auth";
import { prisma } from '@/lib/prisma';
import NoPetsRedirect from '@/app/components/front/NoPetsRedirect';
import HelpCenter from '@/app/components/front/HelpCenter';
import { redirect } from 'next/navigation';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/");
  }

  // Check if user has any pets
  const pets = await prisma.pet.findMany({
    where: {
      userId: session.user.id
    }
  });
  
  console.log('User ID:', session.user.id);
  console.log('Pets found:', pets);
  
  const hasPets = pets.length > 0;

  return (
    <>
      <NoPetsRedirect hasPets={hasPets} />
      {hasPets && (
        <div>
          <HelpCenter />
          <HeroSection/>
          <Cta/>
          <Faqs/>
        </div>
      )}
    </>
  );
}
