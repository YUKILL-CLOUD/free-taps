import { PrescriptionWithRelations } from "@/types/prescriptions";
import { PrescriptionCard } from "./PrescriptionCard";
interface PrescriptionListProps {
  prescriptions: PrescriptionWithRelations[];
}

export function PrescriptionList({ prescriptions }: PrescriptionListProps) {
  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <PrescriptionCard 
          key={prescription.id} 
          prescription={prescription} 
        />
      ))}
    </div>
  );
}
