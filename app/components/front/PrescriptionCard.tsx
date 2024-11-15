import { forwardRef } from 'react';
import { PrescriptionWithRelations } from "@/types/prescriptions";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

type PrescriptionCardProps = {
  prescription: PrescriptionWithRelations;
};

export const PrescriptionCard = forwardRef<HTMLDivElement, PrescriptionCardProps>(
  ({ prescription }, ref) => {
    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    // Safely access the first medication
    const medications = Array.isArray(prescription.medication) ? prescription.medication : [];
    const firstMedication = medications[0] || { name: 'No medication', dosage: 'N/A' };

    return (
      <Link href={`/list/prescriptions/${prescription.id}`}>
        <Card ref={ref} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold">{firstMedication.name}</h3>
              <p className="text-sm text-gray-500">
                For: {prescription.pet.name}
              </p>
            </div>
            <Badge 
              className={statusColors[prescription.status] || "bg-gray-100 text-gray-800"}
            >
              {prescription.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Dosage</p>
                <p>{firstMedication.dosage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Veterinarian</p>
                <p>{prescription.veterinarian.name}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            <div className="flex justify-between w-full">
              <span>Created: {format(new Date(prescription.createdAt), 'PP')}</span>
              <span>Updated: {format(new Date(prescription.updatedAt), 'PP')}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  }
);

PrescriptionCard.displayName = 'PrescriptionCard';
