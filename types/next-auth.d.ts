import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "user";
    image?: string | null;
  }

  interface Session {
    user: User & {
      role: "admin" | "user";
    };
  }
}
