'use client';

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className='flex items-center justify-between py-1 px-4'>
        <div className='flex items-center gap-4 justify-end w-full'>
          <div className='flex flex-col'>
            <span className="text-xs leading-3 font-medium">
              {session?.user?.firstName} {session?.user?.lastName}
            </span>
            <span className="text-[10px] text-gray-500 text-right">
              {session?.user?.role}
            </span>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="relative inline-flex items-center justify-center rounded-full w-7 h-7 bg-gradient-to-br from-mainColor-700 to-mainColor-light shadow-md hover:bg-mainColor-Light hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <span className="text-xs font-medium text-white">
                {session?.user?.firstName?.[0]?.toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-96 relative max-h-[90vh] overflow-y-auto my-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4"
            >
              <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mainColor-700 to-mainColor-light flex items-center justify-center text-2xl font-medium text-white mb-4 shadow-lg hover:bg-mainColor-Light hover:shadow-xl hover:scale-105 transition-all duration-200">
                {session?.user?.firstName?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>

            <div className="space-y-4">
              <p><span className="font-medium">Name:</span> {session?.user?.firstName} {session?.user?.lastName}</p>
              <p><span className="font-medium">Email:</span> {session?.user?.email}</p>
              <p><span className="font-medium">Role:</span> {session?.user?.role}</p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => signOut()}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;