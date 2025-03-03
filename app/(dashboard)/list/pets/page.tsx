import { Appointment, HealthRecord, Pet, Prisma, User } from "@prisma/client";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus } from "lucide-react"; 
import PaginationWrapper from "./PaginationWrapper";
import FormModal from "@/app/components/front/FormModal";
import TableSearch from "@/app/components/front/TableSearch";
import Table from "@/app/components/front/Table";
import { Icon } from "@iconify/react/dist/iconify.js";
import UpdatePetModal from "@/app/components/front/UpdatePetModal";
import DeletePetModal from "@/app/components/front/DeletePetModal";

// enum PetType {
//   Dog = "Dog",
//   Cat = "Cat",
// }

type PetList = Pet & {
  Appointments: Appointment[];
  healthRecords: HealthRecord[];
  user: User;
  name: string;
  type: "Dog" | "Cat" | "Fish" | "Bird" | "Reptile" | "Rabbit" | "Rodent" | "Others";
  breed: string;
  bloodType: string;
  birthday: Date;
  sex: "Male" | "Female"; // Change this to match the expected type
  id?: number;
  img?: string;
}

const columns = [
  {
    header: "Pet Name",
    accessor: "info",
  },
  {
    header: "Owner",
    accessor: "pets",
    className: "hidden md:table-cell",
  },
  {
    header: "Age",
    accessor: "age",
    className: "hidden md:table-cell",
  },
  {
    header: "Blood Type",
    accessor: "blood type",
    className: "hidden md:table-cell",
  },
  {
    header: "Sex",
    accessor: "sex",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];
const calculateAge = (birthday: Date) => {
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  const years = Math.abs(ageDate.getUTCFullYear() - 1970);
  const months = ageDate.getUTCMonth();
  const weeks = Math.floor(ageDifMs / (7 * 24 * 60 * 60 * 1000));
  
  if (years === 0) {
    if (months === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
  } else {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
};
const renderRow = (item: PetList) => (
    <tr
      key={ item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-mainColor-light"
    > 
      <td className="flex items-center gap-4 p-4">
      <div className="md:hidden xl:block w-10 h-10 rounded-full overflow-hidden">{item.img ? (
    <img
      src={item.img}
      alt="User Avatar"
      className="w-full h-full object-cover"
    />
  ) : (
    <Icon 
      icon="tabler:paw-filled"
      className="w-full h-full object-cover text-gray-400"
    />
  )}
   </div> 
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs font-semibold text-gray-600">{item.type}</p>
          <p className="text-xs text-gray-500">{item.breed}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.user?.firstName} {item.user?.lastName}</td>
      <td className="hidden md:table-cell"> <span>{calculateAge(item.birthday)} old</span></td>
      <td className="hidden md:table-cell">{(item.bloodType || "-").toUpperCase()}</td>
      <td className="hidden md:table-cell">{item.sex|| "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/pets/${item.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="w-5 h-5 text-blue-500" />
            </Button>
          </Link>
          <UpdatePetModal data={item} />
          <DeletePetModal id={item.id} />
        </div>
      </td>
    </tr>
  );
const PetListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <div>Please sign in to continue</div>;
  }

  const { page, ...queryParams } = searchParams || {};
  const p = page ? parseInt(page as string) : 1;

  let query: Prisma.PetWhereInput = {};
  
  if (session.user.role !== "admin") {
    query.userId = session.user.id;
  }

  if (queryParams.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: 'insensitive' } },
      { breed: { contains: queryParams.search, mode: 'insensitive' } },
      { type: { contains: queryParams.search, mode: 'insensitive' } },
      { sex: { contains: queryParams.search, mode: 'insensitive' } },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.pet.findMany({
      where: query,
      include: {
        user: true,
        appointments: true,
        healthRecords: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.pet.count({ where: query }),
  ]);

  return ( 
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          {session.user.role === "admin" ? "All Pets" : "My Pets"}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {(session.user.role === "user" || session.user.role === "admin") && (
              <FormModal
                table="pet"
                type="create"
                trigger={
                  <Button variant="default" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add a Pet
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <PaginationWrapper page={p} count={count} />
    </div>
  );
};

export default PetListPage;
