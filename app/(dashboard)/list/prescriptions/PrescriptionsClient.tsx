"use client";

import { PrescriptionList } from "@/app/components/front/PrescriptionList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Pagination from "@/app/components/front/Pagination";
import { PrescriptionSearch } from "@/app/components/front/PrescriptionSearch";
import { PrescriptionFilter } from "@/app/components/front/PrescriptionFilter";
import { PrescriptionWithRelations } from "@/types/prescriptions";
import { useRouter, useSearchParams } from "next/navigation";

type PrescriptionsClientProps = {
  prescriptions: PrescriptionWithRelations[];
  count: number;
  isAdmin: boolean;
};

export default function PrescriptionsClient({ prescriptions, count, isAdmin}: PrescriptionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams?.get("page")) || 1;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    router.push(`/list/prescriptions?${params.toString()}`);
  };

  return (
    <div className="py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        {isAdmin && (
          <Link href="/list/prescriptions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <PrescriptionSearch />
        </div>
        <PrescriptionFilter />
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        {prescriptions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No prescriptions found
          </div>
        ) : (
          <PrescriptionList prescriptions={prescriptions} />
        )}
      </div>

      {prescriptions.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination 
            page={page}
            count={count}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
