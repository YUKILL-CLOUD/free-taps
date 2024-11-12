'use client'

import { User, Pet, Appointment, Role } from "@prisma/client";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { updateUserRole } from '@/lib/actions';
import { toast } from 'react-toastify';
import { useState } from 'react';

type UserRowProps = {
  item: User & {pets: Pet[]} & {appointments: Appointment[]} & {role?: Role};
  isAdmin: boolean;
};

export default function UserRow({ item, isAdmin }: UserRowProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState<'make_admin' | 'remove_admin' | null>(null);

  const handleAdminToggle = async () => {
    setShowConfirmation(true);
    setActionType(item.role === 'admin' ? 'remove_admin' : 'make_admin');
  };

  const confirmAction = async () => {
    const newRole = actionType === 'make_admin' ? 'admin' : 'user';
    const result = await updateUserRole(item.id, newRole);
    if (result.success) {
      toast.success(`User ${item.firstName} ${item.lastName} role updated to ${newRole}`);
      window.location.reload();
    } else {
      toast.error("Failed to update user role");
    }
    setShowConfirmation(false);
  };

  return (
    <tr className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">
        <div className="md:hidden xl:block w-10 h-10 rounded-full overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt="User Avatar"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircleIcon className="w-10 h-10 text-gray-400" />
          )}
        </div>  
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
          <p className="text-xs text-gray-500 truncate max-w-[100px]">{item.id}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.email}</td>
      <td className="hidden md:table-cell truncate max-w-[100px]">{item.pets?.map((pet) => pet.name).join(', ') || "-"}</td>
      <td className="hidden md:table-cell">{item.createdAt.toLocaleDateString()}</td>
      <td className="hidden md:table-cell">{item.role || 'user'}</td>
      <td>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleAdminToggle}
              className={`px-2 py-1 rounded-md text-xs ${
                item.role === 'admin' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {item.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
            </button>
          )}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-md">
                <p>Are you sure you want to {actionType === 'make_admin' ? 'make this user an admin' : 'remove admin rights from this user'}?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setShowConfirmation(false)} className="px-2 py-1 bg-gray-200 rounded-md">Cancel</button>
                  <button onClick={confirmAction} className="px-2 py-1 bg-blue-500 text-white rounded-md">Confirm</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
