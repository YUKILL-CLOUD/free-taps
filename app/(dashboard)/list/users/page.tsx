import Table from "@/app/components/front/Table";
import TableSearch from "@/app/components/front/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Appointment, Pet, Prisma, User, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import UserRow from "./UserRow";
import PaginationWrapper from "./PaginationWrapper";

type UserList = User & {pets:Pet[]} & {appointments:Appointment[]} & {role?: string}

const columns = [
  {
    header: "Users",
    accessor: "info",
  },
  {
    header: "Email",
    accessor: "email",
    className: "hidden md:table-cell",
  },
  {
    header: "Pets",
    accessor: "pet",
    className: "hidden md:table-cell",
  },
  {
    header: "Created At",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Role",
    accessor: "role",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const UserListPage = async ({
  searchParams,
}:{
  searchParams:{ [key:string]: string  | undefined;}
}) => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    // Handle unauthorized access
    return <div>Unauthorized</div>;
  }

  const{page, ...queryParams } = searchParams || {}
  const p = page ? parseInt(page): 1;

  const query: Prisma.UserWhereInput = {};

      if (queryParams){
        for(const [key,value] of Object.entries(queryParams)){
          if(value !== undefined){
            switch(key){
              case "petId": 
                query.pets = {
                  some: {
                      id: value,
                  }
                };
                break;
              case "search":
                query.OR = [
                  { firstName: { contains: value, mode: "insensitive" } },
                  { lastName: { contains: value, mode: "insensitive" } },
                  { email: { contains: value, mode: "insensitive" } },
                ];
                break;
            } 
          }
        }
      }
  
  const [data, count] = await prisma.$transaction([
    prisma.user.findMany({
      where: query, 
      include: {
        pets: true,
        appointments: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE  * (p - 1),
    }),
    prisma.user.count({where:query}),
  ]);

  const usersWithRoles: UserList[] = data.map(user => ({
    ...user,
    role: user.role || 'user',
  }));

  const renderRow = (item: UserList) => {
    return <UserRow key={item.id} item={item} isAdmin={true} />;
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Users</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={usersWithRoles} />
      {/* PAGINATION */}
      <PaginationWrapper page={p} count={count} />
    </div>
  );
};

export default UserListPage;
