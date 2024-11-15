import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import PrescriptionsClient from "./PrescriptionsClient";
import { Suspense } from "react";
import { LoadingState } from "@/app/components/front/LoadingState";
import { Prisma } from "@prisma/client";
import { PrescriptionWithRelations } from "@/types/prescriptions";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: { 
    page?: string;
    search?: string;
    status?: string;
  };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/");
  }

  const isAdmin = session.user.role === "admin";
  
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || "";
  const status = searchParams?.status;

  const where: Prisma.PrescriptionWhereInput = {
    ...(search && {
      OR: [
        { pet: { name: { contains: search, mode: 'insensitive' } } },
        { veterinarian: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
    ...(status && { status }),
    // Only show prescriptions for pets owned by the user if not admin
    ...(!isAdmin && {
      userId: session.user.id // Direct link to user using NextAuth session ID
    })
  };

  try {
    const [prescriptions, count] = await prisma.$transaction([
      prisma.prescription.findMany({
        where,
        include: {
          pet: {
            include: {
              user: true
            }
          },
          veterinarian: true,
          appointment: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (page - 1),
      }),
      prisma.prescription.count({ where }),
    ]);

    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingState />}>
          <PrescriptionsClient 
            prescriptions={prescriptions as unknown as PrescriptionWithRelations[]} 
            count={count}
            isAdmin={isAdmin}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error loading prescriptions:', error);
    throw new Error('Failed to load prescriptions. Please try again later.');
  }
}
