"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { PetSchema } from "@/lib/formValidationSchema";

type ActionResult = {
  success: boolean;
  error: string | null;
  data?: any;
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


export const createPet = async (data: PetSchema & { userId: string }): Promise<ActionResult> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'User is not authenticated' };
    }

    const pet = await prisma.pet.create({
      data: {
        name: data.name,
        type: data.type,
        breed: data.breed,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        userId: session.user.id,
      },
    });
    return { success: true, error: null, data: pet };
  } catch (err) {
    console.error("Error creating pet:", err);
    return { success: false, error: 'Failed to create pet. Please try again.' };
  }
};

export const updatePet = async (data: PetSchema & { id: string }): Promise<ActionResult> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'User is not authenticated' };
    }

    const pet = await prisma.pet.findUnique({
      where: { id: data.id },
      include: { user: true }
    });

    if (!pet) {
      return { success: false, error: 'Pet not found' };
    }

    // Check if user is admin or pet owner
    if (session.user.role !== 'admin' && pet.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized to update this pet' };
    }

    const updatedPet = await prisma.pet.update({
      where: { id: data.id },
      data: {
        name: data.name,
        type: data.type,
        breed: data.breed,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
      },
    });

    return { success: true, error: null, data: updatedPet };
  } catch (err) {
    console.error("Error updating pet:", err);
    return { success: false, error: 'Failed to update pet. Please try again.' };
  }
};

export const deletePet = async (petId: string): Promise<ActionResult> => {
  try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return { success: false, error: 'User is not authenticated' };
      }

      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        include: { user: true }
      });
  
      if (!pet) {
        return { 
          success: false, 
          error: 'Pet not found' 
        };
      }
       // Check if user is admin or pet owner
    if (session.user.role !== 'admin' && pet.userId !== session.user.id) {
        return { 
          success: false, 
          error: 'Unauthorized to delete this pet' 
        };
      }

      await prisma.pet.delete({
        where: { id: petId },
      });

      return { success: true, error: null };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Failed to delete pet. Please try again.' };
    }
  };

  // Service Actions
export const createService = async (
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> => {
  try {
    const data = Object.fromEntries(formData.entries());
    const newService = await prisma.service.create({
      data: {
        name: data.name as string,
        description: data.description as string,
        duration: parseInt(data.duration as string),
        price: parseFloat(data.price as string),
      },
    });
    return { success: true, error: null, data: newService };
  } catch (err) {
    console.error("Error creating service:", err);
    return { success: false, error: 'Failed to create service. Please try again.' };
  }
};

export const updateService = async (
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> => {
  try {
    const data = Object.fromEntries(formData.entries());
    const updatedService = await prisma.service.update({
      where: { id: data.id as string },
      data: {
        name: data.name as string,
        description: data.description as string,
        duration: parseInt(data.duration as string),
        price: parseFloat(data.price as string),
      },
    });
    return { success: true, error: null, data: updatedService };
  } catch (err) {
    console.error("Error updating service:", err);
    return { success: false, error: 'Failed to update service. Please try again.' };
  }
};

export const deleteService = async (
  _: ActionResult,
  serviceId: number
): Promise<ActionResult> => {
  try {
    await prisma.service.delete({
      where: { id: serviceId.toString() },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting service:", err);
    return { success: false, error: 'Failed to delete service. Please try again.' };
  }
};
