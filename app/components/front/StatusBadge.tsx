import React from 'react';

type StatusBadgeProps = {
  status: string;
};
    
export function StatusBadge({ status }: StatusBadgeProps) {
  let bgColor;
  switch (status.toLowerCase()) {
    case 'scheduled':
      bgColor = 'bg-indigo-100 text-indigo-800';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100 text-yellow-800';
      break;
    case 'completed':
      bgColor = 'bg-green-100 text-green-800';
      break;
    case 'missed':
      bgColor = 'bg-red-100 text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  );
}