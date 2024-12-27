"use client";

import { useState } from 'react';
import { HealthRecord } from '@prisma/client';
import { Icon } from "@iconify/react";
import Link from 'next/link';
import ClientPagination from '@/app/components/front/ClientPagination';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { redirect, useRouter, useSearchParams } from 'next/navigation';

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

interface HealthRecordsTableClientProps {
  initialRecords: HealthRecord[];
  initialCount: number;
  initialPage: number;
  petId: string;
  isAdmin: boolean;
}

export function HealthRecordsTableClient({
  initialRecords,
  initialCount,
  initialPage,
  petId,
  isAdmin,
}: HealthRecordsTableClientProps) {
  const [records] = useState(initialRecords);
  const [count] = useState(initialCount);
  const [page, setPage] = useState(initialPage);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('healthRecordsPage', newPage.toString());
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Weight</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Temperature</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Treatment</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">{new Date(record.date).toISOString().split('T')[0]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{record.weight} kg</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{record.temperature}°C</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500l">{truncateText(record.diagnosis, 20)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{truncateText(record.treatment, 20)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Link href={`/list/pets/${petId}/petHealthRecord/${record.id}`}>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Icon icon="mdi:eye" width="20" height="20" />
                      </button>
                    </Link>
                    {isAdmin && (
                      <Link href={`/list/pets/${petId}/petHealthRecord/${record.id}/edit`}>
                        <button className="text-green-600 hover:text-green-900 hidden sm:table-cell">
                          <Icon icon="mdi:pencil" width="20" height="20" />
                      </button>
                    </Link>
                    )}
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
