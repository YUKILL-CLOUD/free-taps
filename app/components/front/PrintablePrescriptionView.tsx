"use client";

import { PrintablePrescription } from "@/app/components/front/PrintablePrescription";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PrintablePrescriptionViewProps = {
  prescription: any;
  clinicInfo: any;
  id: string;
}

export function PrintablePrescriptionView({ prescription, clinicInfo, id }: PrintablePrescriptionViewProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent?.innerHTML || '';
    window.print();
    document.body.innerHTML = originalContent;
  };

  return (
    <>
      <div className="mb-4 print:hidden flex gap-4">
        <Link href={`/list/prescriptions/${id}`}>
          <Button variant="outline">Back</Button>
        </Link>
        <Button onClick={handlePrint}>
          Print Prescription
        </Button>
      </div>
      
      <div id="print-content">
        <PrintablePrescription
          prescription={prescription}
          clinicInfo={clinicInfo}
        />
      </div>
    </>
  );
}

