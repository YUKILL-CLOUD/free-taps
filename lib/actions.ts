"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Announcement, Role, Veterinarian } from "@prisma/client";
import { getServerSession } from "next-auth";
import { PetSchema } from "@/lib/formValidationSchema";
import { revalidatePath } from "next/cache";
import { ITEM_PER_PAGE } from "./settings";
import { sendAppointmentEmail } from "./email";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { endOfWeek, startOfWeek } from "date-fns";
import { toZonedTime } from 'date-fns-tz';

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
// Pet Actions
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
        birthday: data.birthday ? new Date(data.birthday) : pet.birthday,
      },
    });

    revalidatePath('/list/pets');
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
// Veterinarian Actions
export async function getVeterinarianData(): Promise<Veterinarian | null> {
  return await prisma.veterinarian.findFirst();
}
export async function getVeterinarians() {
  try {
    const veterinarians = await prisma.veterinarian.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        phone: true,
        email: true,
        prclicNo: true,
        prtNo: true,
        tinNo: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return veterinarians;
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    return [];
  }
}
export async function updateVeterinarian(formData: FormData) {
  try {
    const id = formData.get('id') as string; // Get the veterinarian ID from the form data
    const data = {
      name: formData.get('name') as string,
      specialization: formData.get('specialization') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      prclicNo: formData.get('prclicNo') as string,
      prtNo: formData.get('prtNo') as string,
      tinNo: formData.get('tinNo') as string,
    };

    // Ensure the ID is provided for updating
    if (!id) {
      return { message: 'Error: ID is required to update a veterinarian.' };
    }

    // Update existing veterinarian if ID exists
    const updatedVeterinarian = await prisma.veterinarian.update({
      where: { id },
      data,
    });

    return { message: 'Success', updatedVeterinarian }; // Return success message and updated data
  } catch (error) {
    console.error('Error updating veterinarian:', error);
    if (error instanceof PrismaClientKnownRequestError) {
        return { message: 'Database error occurred while updating.' };
    }
    return { message: 'Error: ' + (error as Error).message };
}
}
// Announcement Actions
export async function getAnnouncements(limit?: number) {
  try {
    await deleteExpiredAnnouncements();

    const announcements = await prisma.announcement.findMany({
      where: {
        status: {
          in: ['active', 'important'] as const
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    
    return announcements as Announcement[];
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}
export async function createAnnouncement(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const status = formData.get("status") as 'active' | 'important';

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        startDate,
        endDate,
        status,
      },
    });

    revalidatePath('/list/announcements');
    revalidatePath('/user');
    
    return { 
      success: true, 
      error: null, 
      data: newAnnouncement 
    };
  } catch (err) {
    console.error("Error creating announcement:", err);
    return { 
      success: false, 
      error: 'Failed to create announcement' 
    };
  }
}
export async function editAnnouncement(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const status = formData.get("status") as 'active' | 'important';

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        startDate,
        endDate,
        status,
      },
    });

    revalidatePath('/list/announcements');
    return { success: true, error: null, data: updatedAnnouncement };
  } catch (err) {
    console.error("Error updating announcement:", err);
    return { success: false, error: 'Failed to update announcement' };
  }
}
export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.announcement.delete({
      where: { id },
    });

    revalidatePath('/list/announcements');
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return { success: false, error: 'Failed to delete announcement' };
  }
}
export async function deleteExpiredAnnouncements() {
  try {
    const now = new Date();
    
    // Delete announcements that have passed their end date
    const deletedAnnouncements = await prisma.announcement.deleteMany({
      where: {
        endDate: {
          lt: now
        }
      }
    });

    if (deletedAnnouncements.count > 0) {
      revalidatePath('/list/announcements');
      revalidatePath('/user');
    }

    return deletedAnnouncements.count;
  } catch (error) {
    console.error("Error deleting expired announcements:", error);
    return 0;
  }
}
//  Appointment Actions
export const createAppointment = async (
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'User is not authenticated' };
    }

    const data = Object.fromEntries(formData.entries());
    const date = new Date(data.date as string);

    // Convert the 12-hour time format to 24-hour time format
    const [timeStr, period] = (data.time as string).split(' ');
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours, 10);

    // Adjust for AM/PM
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    date.setHours(hour, parseInt(minutes, 10));

    // Check if the appointment slot is already taken
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: date,
        time: date,
        status: "scheduled",
      },
    });

    if (existingAppointment) {
      return { success: false, error: 'This time slot has just been booked. Please choose another time.' };
    }

    // Create the new appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        petId: data.petId as string,
        userId: session.user.id,
        serviceId: data.serviceId as string,
        date: date,
        time: date,
        status: "pending",
        notes: data.notes as string || null,
      },
      include: {
        pet: true,
        service: true,
        user: true,
      },
    });

    // Send appointment email if user email exists
    if (newAppointment.user.email) {
      await sendAppointmentEmail(
        newAppointment.user.email,
        'created',
        {
          appointmentId: newAppointment.id,
          petName: newAppointment.pet.name,
          serviceName: newAppointment.service.name,
          date: newAppointment.date,
          time: newAppointment.time,
          notes: newAppointment.notes,
        }
      );
    }

    revalidatePath('/appointments');
    return { success: true, error: null, data: newAppointment };
  } catch (err) {
    console.error("Error creating appointment:", err);
    return { success: false, error: 'Failed to create appointment. Please try again.' };
  }
};


export const createAppointmentsAdmin = async (
  formData: FormData
): Promise<ActionResult> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return { success: false, error: 'Only admins can perform this action' };
    }

    const data = Object.fromEntries(formData.entries());
    const date = new Date (data.date as string)
    const [timeStr, period] = (data.time as string).split(' ');
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours, 10);

    // Adjust for AM/PM
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    date.setHours(hour, parseInt(minutes, 10));


    // const existingAppointment = await prisma.appointment.findFirst({
    //   where: {
    //     date: date,
    //     time: date,
    //   },
    // });

    // if (existingAppointment) {
    //   return { success: false, error: 'This time slot has just been booked. Please choose another time.' };
    // }

    const newAdminAppointment = await prisma.appointment.create({
      data: {
        userId: data.userId as string,
        petId: data.petId as string,
        serviceId: data.serviceId as string,
        date: date,
        time: date,
        status: "scheduled",
        notes: data.notes as string || null,
      },
      include: {
        pet: true,
        service: true,
        user: true,
      },
    });

    if (newAdminAppointment.user.email) {
      await sendAppointmentEmail(
        newAdminAppointment.user.email,
        'created',
        {
          appointmentId: newAdminAppointment.id,
          petName: newAdminAppointment.pet.name,
          serviceName: newAdminAppointment.service.name,
          date: newAdminAppointment.date,
          time: newAdminAppointment.time,
          notes: newAdminAppointment.notes,
        }
      );
    }

    revalidatePath('/appointments');
    return { success: true, error: null, data: newAdminAppointment };
  } catch (err) {
    console.error("Error creating appointment:", err);
    return { success: false, error: 'Failed to create appointment. Please try again.' };
  }
};

export const updateAppointment = async (
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> => {
  try {
    const data = Object.fromEntries(formData.entries());
    const [time, period] = (data.time as string).split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    if (period.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }
    const date = new Date(data.date as string);
    const timeDate = new Date(2000, 0, 1, hour, parseInt(minutes, 10));

    const updatedAppointment = await prisma.appointment.update({
      where: { id:data.id as string },
      data: {
        petId:data.petId as string,
        serviceId: data.serviceId as string,
        date: date,
        time: timeDate,
        status: data.status as string,
        notes: data.notes as string || null,
      },
    });
    
    // Add revalidation
    revalidatePath('/appointments');
    revalidatePath('/list/appointments');
    revalidatePath('/admin');
    
    return { success: true, error: null, data: updatedAppointment };
  } catch (err) {
    console.error("Error updating appointment:", err);
    return { success: false, error: 'Failed to update appointment. Please try again.' };
  }
};
export const deleteAppointment = async (
  _: ActionResult,
  appointmentId: string
): Promise<ActionResult> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'User is not authenticated' };
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!existingAppointment || 
        (session.user.role !== 'admin' && existingAppointment.userId !== session.user.id)) {
      return { success: false, error: 'Appointment not found or unauthorized' };
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    revalidatePath('/appointments');
    revalidatePath('/list/appointments');
    revalidatePath('/admin');

    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting appointment:", err);
    return { success: false, error: 'Failed to delete appointment. Please try again.' };
  }
};
export async function updateAppointmentStatus(
  _: ActionResult,
  { id, status }: { id: string; status: string }
): Promise<ActionResult> {
  try {
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        pet: true,
        service: true,
        user: true,
      },
    });

    // Send email notification
    if (updatedAppointment.user.email) {
      // Send confirmation email if status is changed to scheduled
      if (status === 'scheduled') {
        await sendAppointmentEmail(
          updatedAppointment.user.email,
          'confirmed',
          {
            appointmentId: updatedAppointment.id,
            petName: updatedAppointment.pet.name,
            serviceName: updatedAppointment.service.name,
            date: updatedAppointment.date,
            time: updatedAppointment.time,
            ownerName: `${updatedAppointment.user.firstName} ${updatedAppointment.user.lastName}`,
          }
        );
      } else if (status === 'completed') {
        await sendAppointmentEmail(
          updatedAppointment.user.email,
          'completed',
          {
            appointmentId: updatedAppointment.id,
            petName: updatedAppointment.pet.name,
            serviceName: updatedAppointment.service.name,
            date: updatedAppointment.date,
            time: updatedAppointment.time,
            ownerName: `${updatedAppointment.user.firstName} ${updatedAppointment.user.lastName}`,
            petId: updatedAppointment.petId
          }
        );
      } else {
        // Send regular status update email for other status changes
        await sendAppointmentEmail(
          updatedAppointment.user.email,
          'status_changed',
          {
            petName: updatedAppointment.pet.name,
            serviceName: updatedAppointment.service.name,
            date: updatedAppointment.date,
            time: updatedAppointment.time,
            appointmentId: updatedAppointment.id,
            status: status,
            ownerName: `${updatedAppointment.user.firstName} ${updatedAppointment.user.lastName}`,
          }
        );
      }
    }

    // Add revalidation
    revalidatePath('/appointments');
    revalidatePath('/list/appointments');
    revalidatePath('/admin');

    return { success: true, error: null, data: updatedAppointment };
  } catch (err) {
    console.error("Error updating appointment status:", err);
    return { success: false, error: 'Failed to update appointment status. Please try again.' };
  }
}
//users
export async function fetchAppointments(page: number) {
  await updateMissedAppointments();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const [appointments, count] = await prisma.$transaction([
    prisma.appointment.findMany({
      where: { userId: session.user.id },
      include: {
        pet: true,
        service: true,
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.appointment.count({ where: { userId: session.user.id } }),
  ]);

  revalidatePath('/appointments');
  return { appointments, count };
}
//admins
export async function createAppointmentAdmin(formData: FormData) {
  try {
    const userId = formData.get('userId');
    const petId = formData.get('petId');
    const serviceId = formData.get('serviceId');
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;

    // Check if the date and time strings are valid
    if (!dateStr || !timeStr) {
      throw new Error("Date or Time is missing");
    }

    // Combine date and time strings
    const dateTimeStr = `${dateStr}T${timeStr}`;
    const dateTime = new Date(dateTimeStr);

    // Check if the created Date object is valid
    if (isNaN(dateTime.getTime())) {
      throw new Error(`Invalid date-time format: ${dateTimeStr}`);
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: userId as string,
        petId: petId as string,
        serviceId: serviceId as string,
        date: dateTime,
        time: dateTime,
        status: 'scheduled',
      },
      include: {
        pet: true,
        service: true,
        user: true,
      },
    });

    // Send email notification
    if (appointment.user?.email) {
      await sendAppointmentEmail(
        appointment.user.email,
        'pre_appointment',
        {
          petName: appointment.pet?.name || '',
          serviceName: appointment.service?.name || '',
          date: appointment.date,
          time: appointment.time,
          appointmentId: appointment.id,
        }
      );
    }

    revalidatePath('/list/appointments');
    return { success: true, data: appointment };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error: 'Failed to create appointment' };
  }
}
export async function fetchUserAppointments(userId: string) {
  const appointments = await prisma.appointment.findMany({
    where: {
      userId: userId,
      date: {
        gte: new Date(),
      },
      status: 'scheduled',
    },
    include: {
      pet: true,
      service: true,
      user: true,
    },
    orderBy: {
      date: 'asc',
    },
    take: 5,
  });
  return appointments;
}
export async function fetchAdminAppointments(
  pendingPage: number, 
  scheduledPage: number,
  completedPage: number,
  missedPage: number,
  dateFilter?: string
) {
  await updateMissedAppointments();
  
  let dateCondition = {};
  const timeZone = 'Asia/Manila'; // GMT+8
  
  if (dateFilter === 'today') {
    const today = toZonedTime(new Date(), timeZone);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    dateCondition = {
      date: {
        gte: today,
        lt: tomorrow,
      }
    };
  } else if (dateFilter === 'week') {
    const today = toZonedTime(new Date(), timeZone);
    const startOfWeekDate = startOfWeek(today);
    const endOfWeekDate = endOfWeek(today);
    
    dateCondition = {
      date: {
        gte: startOfWeekDate,
        lte: endOfWeekDate,
      }
    };
  }

  const [
    pendingAppointments, 
    scheduledAppointments,
    completedAppointments,
    missedAppointments,
    pendingCount,
    scheduledCount,
    completedCount,
    missedCount
  ] = await prisma.$transaction([
    prisma.appointment.findMany({
      where: { 
        status: 'pending',
        ...dateCondition 
      },
      include: {
        pet: true,
        service: true,
        user: true,
      },
      orderBy: { date: 'asc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (pendingPage - 1),
    }),
    prisma.appointment.findMany({
      where: { 
        status: 'scheduled',
        ...dateCondition 
      },
      include: {
        pet: true,
        service: true,
        user: true,
      },
      orderBy: { date: 'asc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (scheduledPage - 1),
    }),
    prisma.appointment.findMany({
      where: { 
        status: 'completed',
        ...dateCondition 
      },
      include: {
        pet: true,
        service: true,
        user: true,
      },
      orderBy: { date: 'desc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (completedPage - 1),
    }),
    prisma.appointment.findMany({
      where: { 
        status: 'missed',
        ...dateCondition 
      },
      include: {
        pet: true,
        service: true,
        user: true,
      },
      orderBy: { date: 'desc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (missedPage - 1),
    }),
    prisma.appointment.count({ where: { status: 'pending', ...dateCondition } }),
    prisma.appointment.count({ where: { status: 'scheduled', ...dateCondition } }),
    prisma.appointment.count({ where: { status: 'completed', ...dateCondition } }),
    prisma.appointment.count({ where: { status: 'missed', ...dateCondition } }),
  ]);

  return {
    pendingAppointments,
    scheduledAppointments,
    completedAppointments,
    missedAppointments,
    pendingCount,
    scheduledCount,
    completedCount,
    missedCount,
  };
}
export async function updateMissedAppointments() {
  const now = new Date();
  // const sevenDaysAgo = new Date(now);
  // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // // First, delete missed appointments older than 7 days
  // await prisma.appointment.deleteMany({
  //   where: {
  //     status: 'missed',
  //     date: {
  //       lt: sevenDaysAgo
  //     }
  //   }
  // });

  // Then handle new missed appointments
  const missedAppointments = await prisma.appointment.findMany({
    where: {
      status: 'scheduled',
      OR: [
        { date: { lt: now } },
        { date: now, time: { lt: now } }
      ]
    },
    include: {
      pet: true,
      service: true,
      user: true
    }
  });

  for (const appointment of missedAppointments) {
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'missed' }
      }),
    ]);

    // Send missed appointment email
    if (appointment.user.email) {
      await sendAppointmentEmail(
        appointment.user.email,
        'missed',
        {
          petName: appointment.pet.name,
          serviceName: appointment.service.name,
          date: appointment.date,
          time: appointment.time,
          appointmentId: appointment.id,
        }
      );
    }
  }

  return missedAppointments.length;
}
export async function getBookedTimes(date: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return [];
    }

    const selectedDate = new Date(date);
    // Set time to start of day in local timezone
    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);


    // Fetch booked times from the database
    const bookedTimes = await prisma.appointment.findMany({
      where: {
        date: {
          gte: selectedDate,
          lt: nextDay,
        },
        OR: [
          { status: 'scheduled' }, // Get all scheduled appointments
          { 
            AND: [
              { status: 'pending' },
              { userId: session.user.id } // Only get pending appointments for current user
            ]
          }
        ]
      },
      select: {
        date: true,
        time: true,
      },
    });

    console.log('Raw Database booked times:', bookedTimes);

    // Return the formatted appointment times
    return bookedTimes.map(appointment => {
      const isoTime = appointment.time.toISOString();
      const timeString = isoTime.split('T')[1].split('.')[0];
      const [hours, minutes] = timeString.split(':').map(Number);

      // Convert to 12-hour format
      const hour12 = hours % 12 || 12;
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedMinutes = minutes.toString().padStart(2, '0');

      const formattedTime = `${hour12}:${formattedMinutes} ${period}`;
      console.log('Formatted time:', formattedTime, 'from:', isoTime);
      return formattedTime;
    });
  } catch (error) {
    console.error('Error fetching booked times:', error);
    return [];
  }
}

//vaccination
export async function createVaccinationRecord(data: FormData, appointmentId: string) {
  try {
    const formData = Object.fromEntries(data.entries());
    
    // First verify the appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      return { success: false, error: 'Appointment not found' };
    }

    // Create vaccination record
    const vaccination = await prisma.vaccination.create({
      data: {
        pet: { connect: { id: formData.petId as string} },
        date: new Date(formData.date as string),
        vaccineName: formData.vaccineName as string,
        medicineName: formData.medicineName as string,
        manufacturer: formData.manufacturer as string,
        weight: parseFloat(formData.weight as string),
        nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate as string) : null,
        veterinarian: { connect: { id: formData.veterinarianId as string} },
      },
    });

    // Create the junction table record
    await prisma.appointmentVaccination.create({
      data: {
        appointment: { connect: { id: appointmentId } },
        vaccination: { connect: { id: vaccination.id } }
      }
    });

    revalidatePath('/list/appointments');
    return { 
      success: true,
      data: {
        nextDueDate: vaccination.nextDueDate
      }
    };
  } catch (error) {
    console.error('Vaccination Creation Error:', error);
    return { success: false, error: 'Failed to add vaccination record' };
  }
}
//deworming
export async function createDewormingRecord(data: FormData, appointmentId: string) {
  try {
    const formData = Object.fromEntries(data.entries());
    
    // First verify the appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      return { success: false, error: 'Appointment not found' };
    }

    // Create deworming record
    const deworming = await prisma.deworming.create({
      data: {
        pet: { connect: { id: formData.petId as string} },
        date: new Date(formData.date as string),
        dewormingName: formData.dewormingName as string,
        medicineName: formData.medicineName as string,
        manufacturer: formData.manufacturer as string,
        weight: parseFloat(formData.weight as string),
        nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate as string) : null,
        veterinarian: { connect: { id: formData.veterinarianId as string } },
      },
    });

    // Create the junction table record
    await prisma.appointmentDeworming.create({
      data: {
        appointment: { connect: { id: appointmentId } },
        deworming: { connect: { id: deworming.id } }
      }
    });

    revalidatePath('/list/appointments');
    return { 
      success: true,
      data: {
        nextDueDate: deworming.nextDueDate
      }
    };
  } catch (error) {
    console.error('Deworming Creation Error:', error);
    return { success: false, error: 'Failed to add deworming record' };
  }
}
//health record
export async function createHealthRecord(data: FormData, appointmentId: string) {
  try {
    const formData = Object.fromEntries(data.entries());

    const healthRecord = await prisma.healthRecord.create({
      data: {
        petId: formData.petId as string,
        date: new Date(formData.date as string),
        weight: parseFloat(formData.weight as string),
        temperature: parseFloat(formData.temperature as string),
        diagnosis: formData.diagnosis as string,
        treatment: formData.treatment as string,
        notes: formData.notes as string || '',
        appointments: {
          connect: { id: appointmentId }
        }
      },
    });

    if (!healthRecord) {
      throw new Error('Failed to create health record');
    }

    revalidatePath('/list/appointments');
    revalidatePath('/list/pets');
    return { success: true };
  } catch (error) {
    console.error('Health Record Creation Error:', error);
    return { success: false, error: 'Failed to add health record' };
  }
}
export async function createHealthRecordRelation(data: FormData, appointmentId: string) {
  try {
    const formData = Object.fromEntries(data.entries());
    
    // First verify the appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      return { success: false, error: 'Appointment not found' };
    }

    // Create health record
    const healthRecord = await prisma.healthRecord.create({
      data: {
        petId: formData.petId as string,
        date: new Date(formData.date as string),
        weight: parseFloat(formData.weight as string),
        temperature: parseFloat(formData.temperature as string),
        diagnosis: formData.diagnosis as string,
        treatment: formData.treatment as string,
        notes: formData.notes as string || '',
      },
    });

    // Create the junction table record
    await prisma.appointmentHealthRecord.create({
      data: {
        appointment: { connect: { id: appointmentId } },
        healthRecord: { connect: { id: healthRecord.id } }
      }
    });

    revalidatePath('/list/appointments');
    revalidatePath('/list/pets');
    return { success: true };
  } catch (error) {
    console.error('Health Record Creation Error:', error);
    return { success: false, error: 'Failed to add health record' };
  }
}
//fetching admin create appointment
export async function fetchUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        image: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}
export async function fetchServices() {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true
      },
      orderBy: {
        name: 'asc',
      },
    });
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}
export async function fetchPetsByUser(userId: string) {
  try {
    const pets = await prisma.pet.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
        type: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        breed: true,
        bloodType: true,
        birthday: true,
        sex: true,
        img: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return pets;
  } catch (error) {
    console.error('Error fetching pets:', error);
    return [];
  }
}
//prescription
export async function createPrescriptionAction(formData: FormData) {
  try {
    console.log('Action - Received FormData:', Object.fromEntries(formData.entries()));
    
    const petId = formData.get('petId') as string;
    const veterinarianId = formData.get('veterinarianId') as string;
    const appointmentId = formData.get('appointmentId') ? 
      formData.get('appointmentId') as string : 
      null;
    const medications = JSON.parse(formData.get('medications') as string);
    const status = formData.get('status') as string || 'active';

    // First, get the pet to find its owner
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { user: true }
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    const prescription = await prisma.prescription.create({
      data: {
        pet: {
          connect: { id: petId }
        },
        veterinarian: {
          connect: { id: veterinarianId }
        },
        user: {
          connect: { id: pet.userId } // Connect to pet owner's ID
        },
        appointment: appointmentId ? {
          connect: { id: appointmentId }
        } : undefined,
        medication: medications,
        status: status,
      },
      include: {
        pet: true,
        veterinarian: true,
        appointment: true,
        user: true
      }
    });

    console.log('Action - Created prescription:', prescription);
    revalidatePath('/list/prescriptions');
    return { success: true, data: prescription };
  } catch (error) {
    console.error('Error in createPrescriptionAction:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updatePrescriptionStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const prescription = await prisma.prescription.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/list/prescriptions');
    return { success: true, error: null, data: prescription };
  } catch (error) {
    console.error('Error updating prescription status:', error);
    return { success: false, error: 'Failed to update prescription status' };
  }
}

export async function deletePrescription(id: string): Promise<ActionResult> {
  try {
    await prisma.prescription.delete({
      where: { id }
    });
    revalidatePath('/list/prescriptions');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return { success: false, error: 'Failed to delete prescription' };
  }
}

export async function reactivatePrescription(id: string): Promise<ActionResult> {
  try {
    const prescription = await prisma.prescription.update({
      where: { id },
      data: { status: 'active' }
    });
    revalidatePath('/list/prescriptions');
    return { success: true, error: null, data: prescription };
  } catch (error) {
    console.error('Error reactivating prescription:', error);
    return { success: false, error: 'Failed to reactivate prescription' };
  }
}


export const fetchActivities = async (userId: string) => {
  try {
    const [appointments, pets, healthRecords] = await Promise.all([
      prisma.appointment.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          pet: true,
          service: true,
        },
      }),
      prisma.pet.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.healthRecord.findMany({
        where: {
          pet: {
            userId,
          },
        },
        include: {
          pet: true,
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    return [
      ...appointments.map(apt => ({
        id: `apt-${apt.id}`,
        date: apt.date.toISOString(),
        description: `Appointment for ${apt.pet.name} - ${apt.service.name}`,
        type: 'appointment'
      })),
      ...pets.map(pet => ({
        id: `pet-${pet.id}`,
        date: pet.createdAt.toISOString(),
        description: `Added new pet: ${pet.name}`,
        type: 'pet'
      })),
      ...healthRecords.map(record => ({
        id: `health-${record.id}`,
        date: record.date.toISOString(),
        description: `Health record updated for ${record.pet.name}`,
        type: 'health'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 10);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

export async function fetchUserAppointmentsByStatus(status: string, page: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const where = status === 'missed' 
    ? {
        userId: session.user.id,
        OR: [
          { status: 'missed' },
          { 
            status: 'scheduled',
            date: { lt: new Date() }
          }
        ]
      }
    : { 
        userId: session.user.id,
        status 
      };

  const [appointments, count] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      include: {
        pet: true,
        service: true,
        user: true,
      },
      orderBy: { date: status === 'completed' || status === 'missed' ? 'desc' : 'asc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, count };
}

//rehoming pet
export type RehomingPetData = {
  name: string;
  age: string;
  gender: string;
  breed: string;
  type: string;
  imageUrl: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
};

export async function createRehomingPet(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      age: formData.get('age') as string,
      gender: formData.get('gender') as string,
      breed: formData.get('breed') as string,
      type: formData.get('type') as string,
      imageUrl: formData.get('imageUrl') as string,
      sellerName: formData.get('sellerName') as string,
      sellerPhone: formData.get('sellerPhone') as string,
      sellerEmail: formData.get('sellerEmail') as string,
    };

    const pet = await prisma.rehomingPet.create({
      data,
    });

    revalidatePath('/list/services');
    return { success: true, data: pet };
  } catch (error) {
    console.error('Failed to create rehoming pet:', error);
    return { success: false, error: 'Failed to create pet listing' };
  }
}

export async function getRehomingPets() {
  try {
    const pets = await prisma.rehomingPet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return pets;
  } catch (error) {
    console.error('Failed to fetch rehoming pets:', error);
    return [];
  }
}

export async function deleteRehomingPet(id: string) {
  try {
    await prisma.rehomingPet.delete({
      where: { id },
    });
    revalidatePath('/list/services');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete rehoming pet:', error);
    return { success: false, error: 'Failed to delete pet listing' };
  }
}