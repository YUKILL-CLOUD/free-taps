import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { PrintablePrescriptionView } from "@/app/components/front/PrintablePrescriptionView";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function PrintPrescriptionPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/");
  }

  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      pet: {
        include: {
          user: true
        }
      },
      veterinarian: true,
      appointment: true,
      user: true
    },
  });

  if (!prescription) {
    notFound();
  }

  // Check if user has permission to view this prescription
  const isAdmin = session.user.role === "admin";
  const isOwner = prescription.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    redirect("/");
  }

  const clinicInfo = {
    name: "Tapales Vet CLinic",
    address: "399 Huervana St, La Paz, Iloilo City, 5000 Iloilo",
    phone: "(123) 456-7890",
    email: "TapalesVetClinic@gmail.com",
    license: "VET-12345",
  };

  return (
    <div className="container mx-auto py-8 print:py-0">
      <PrintablePrescriptionView 
        prescription={prescription}
        clinicInfo={clinicInfo}
        id={id}
      />
    </div>
  );
}
