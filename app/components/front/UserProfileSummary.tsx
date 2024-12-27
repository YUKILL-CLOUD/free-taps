
import { UserIcon } from "@heroicons/react/24/outline";
import { User } from "@prisma/client";
import Image from "next/image";

interface UserProfileSummaryProps {
  user: User;
}

export default function UserProfileSummary({ user }: UserProfileSummaryProps) {
  return (
    <div className="bg-white p-4 rounded-md shadow">
      <div className="flex items-center space-x-4">
      {user.image ? (
          <Image
            src={user.image}
            alt={user.lastName || "User"}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-mainColor-50 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-mainColor-400" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">Role: {user.role || "User"}</p>
        </div>
      </div>
    </div>
  );
}

