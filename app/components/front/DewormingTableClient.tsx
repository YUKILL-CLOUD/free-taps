"use client";

import { useState } from 'react';
import { Deworming } from '@prisma/client';
import { Icon } from "@iconify/react";
import Link from 'next/link';
import ClientPagination from './ClientPagination';
import { useRouter, useSearchParams } from 'next/navigation';

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

interface DewormingsTableClientProps {
  initialDewormings: Deworming[];
  initialCount: number;
  initialPage: number;
  petId: string;
}

export function DewormingsTableClient({
  initialDewormings,
  initialCount,
  initialPage,
  petId,
}: DewormingsTableClientProps) {
  const [dewormings] = useState(initialDewormings);
  const [count] = useState(initialCount);
  const [page, setPage] = useState(initialPage);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('dewormingsPage', newPage.toString());
    router.push(`/list/pets/${petId}?${params.toString()}`);
    setPage(newPage);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deworming Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Medicine Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Manufacturer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Weight (kg)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Next Due Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dewormings.map((deworming) => (
              <tr key={deworming.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(deworming.date).toISOString().split('T')[0]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{truncateText(deworming.dewormingName, 20)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{truncateText(deworming.medicineName, 20)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{truncateText(deworming.manufacturer, 20)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{deworming.weight.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                  {deworming.nextDueDate ? new Date(deworming.nextDueDate).toISOString().split('T')[0] : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Link href={`/list/pets/${petId}/petDeworming/${deworming.id}`}>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Icon icon="mdi:eye" width="20" height="20" />
                      </button>
                    </Link>
                    {/* <Link href={`/list/pets/${petId}/petDeworming/${deworming.id}/edit`}>
                      <button className="text-green-600 hover:text-green-900">
                        <Icon icon="mdi:pencil" width="20" height="20" />
                      </button>
                    </Link> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ClientPagination page={page} count={count} onPageChange={handlePageChange} />
    </>
  );
}