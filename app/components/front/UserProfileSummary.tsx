
import { User } from "@prisma/client";
import Image from "next/image";

interface UserProfileSummaryProps {
  user: User;
}

export default function UserProfileSummary({ user }: UserProfileSummaryProps) {
  return (
    <div className="bg-white p-4 rounded-md shadow">
      <div className="flex items-center space-x-4">
        <Image
          src={user.image || ""}
          alt={user.lastName || "User"}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">Role: {user.role || "User"}</p>
        </div>
      </div>
    </div>
  );
}

