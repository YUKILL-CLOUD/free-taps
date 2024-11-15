import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PrintablePrescription } from "@/app/components/front/PrintablePrescription";
import Link from "next/link";
import { updatePrescriptionStatus, deletePrescription, reactivatePrescription } from "@/lib/actions";
import { PrescriptionWithRelations } from "@/types/prescriptions";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function PrescriptionDetailPage({
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

  const clinicInfo = {
    name: "Tapales Vet CLinic",
    address: "399 Huervana St, La Paz, Iloilo City, 5000 Iloilo",
    phone: "(123) 456-7890",
    email: "TapalesVetClinic@gmail.com",
    license: "VET-12345",
  };

  const isAdmin = session.user.role === "admin";
  const isOwner = prescription.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/list/prescriptions">
            <Button variant="outline">Back to List</Button>
          </Link>
          <h1 className="text-2xl font-bold">Prescription Details</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/list/prescriptions/${id}/print`}>
            <Button variant="outline">Print Prescription</Button>
          </Link>
          {isAdmin && (
            <>
              {prescription.status === 'active' ? (
                <form action={async () => {
                  'use server';
                  await updatePrescriptionStatus(prescription.id, 'completed');
                }}>
                  <Button variant="default">Mark as Completed</Button>
                </form>
              ) : prescription.status === 'completed' && (
                <form action={async () => {
                  'use server';
                  await reactivatePrescription(prescription.id);
                }}>
                  <Button variant="secondary">Reactivate Prescription</Button>
                </form>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the prescription.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form
                      action={async () => {
                        'use server';
                        const result = await deletePrescription(prescription.id);
                        if (result.success) {
                          redirect('/list/prescriptions');
                        }
                      }}
                    >
                      <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <PrintablePrescription
          prescription={prescription as PrescriptionWithRelations}
          clinicInfo={clinicInfo}
        />
      </div>
    </div>
  );
}
