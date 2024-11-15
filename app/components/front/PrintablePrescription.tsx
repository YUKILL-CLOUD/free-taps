import { format } from "date-fns";
import { PrescriptionWithRelations, ClinicInfo } from "@/types/prescriptions";
import QRCode from "react-qr-code";

interface PrintablePrescriptionProps {
  prescription: PrescriptionWithRelations;
  clinicInfo: ClinicInfo;
}

export function PrintablePrescription({ prescription, clinicInfo }: PrintablePrescriptionProps) {
  const prescriptionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/prescriptions/${prescription.id}`;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">{clinicInfo.name}</h1>
          <p className="text-gray-600">{clinicInfo.address}</p>
          <p className="text-gray-600">Phone: {clinicInfo.phone}</p>
          <p className="text-gray-600">License: {clinicInfo.license}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Prescription #{prescription.id}</p>
          <p className="text-gray-600">Date: {format(prescription.createdAt, 'PPP')}</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Pet Information</h2>
          <p>Name: {prescription.pet.name}</p>
          <p>Type: {prescription.pet.type}</p>
          <p>Breed: {prescription.pet.breed}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Veterinarian</h2>
          <p>{prescription.veterinarian.name}</p>
          <p>License: {prescription.veterinarian.prclicNo}</p>
        </div>
      </div>

      {/* Medications */}
      <div className="space-y-4 border-t border-b py-4">
        <h2 className="font-semibold mb-2">Medications</h2>
        {prescription.medication.map((med, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <p className="font-medium">{med.name}</p>
            <p className="text-gray-600">Dosage: {med.dosage}</p>
            <p className="text-gray-600">Instructions: {med.instructions}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end pt-4">
        <div className="print:visible">
          <QRCode value={prescriptionUrl} size={64} />
          <p className="text-xs mt-1">Scan to verify prescription</p>
        </div>
        <div className="text-right">
          <div className="border-t border-black pt-2 mt-16 w-48">
            <p className="font-semibold">{prescription.veterinarian.name}</p>
            <p className="text-sm">Veterinarian Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
