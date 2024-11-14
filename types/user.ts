import { Role } from "@prisma/client"

export interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  image: string | null
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface UserState {
  users: UserData[]
  setUsers: React.Dispatch<React.SetStateAction<UserData[]>>
}
