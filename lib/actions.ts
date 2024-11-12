import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error: string | null;
};

export const updateUserRole = async (userId: string, newRole: Role): Promise<ActionResult> => {
  try {
    // Update user role in database
    await prisma.user.update({
      where: { 
        id: userId  // MongoDB ObjectId
      },
      data: { 
        role: newRole,
        updatedAt: new Date()
      },
    });

    return { success: true, error: null };
  } catch (err) {
    console.error("Error updating user role:", err);
    return { 
      success: false, 
      error: 'Failed to update user role. Please try again.' 
    };
  }
};