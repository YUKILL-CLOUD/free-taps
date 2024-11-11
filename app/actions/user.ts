'use server'

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateUserProfile(firstName: string, lastName: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    });

    // Force revalidation of all routes
    revalidatePath('/', 'layout');
    
    return { 
      success: true, 
      user: updatedUser,
      session: {
        ...session,
        user: {
          ...session.user,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        }
      }
    };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}