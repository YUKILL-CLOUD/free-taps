"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Role, Veterinarian } from "@prisma/client";
import { getServerSession } from "next-auth";
import { PetSchema } from "@/lib/formValidationSchema";
import { revalidatePath } from "next/cache";
import { ITEM_PER_PAGE } from "./settings";

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
    const id = formData.get('id') as string;
    const data = {
      name: formData.get('name') as string,
      specialization: formData.get('specialization') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      prclicNo: formData.get('prclicNo') as string,
      prtNo: formData.get('prtNo') as string,
      tinNo: formData.get('tinNo') as string,
    };

    if (!id) {
      // Create new veterinarian if no ID
      await prisma.veterinarian.create({
        data
      });
    } else {
      // Update existing veterinarian if ID exists
      await prisma.veterinarian.update({
        where: { id },
        data
      });
    }

      return {message: 'Success'};
  } catch (error) {
    return { message: 'Error: ' + error };
  }
}
// Announcement Actions
export async function getAnnouncements(limit?: number) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        status: "active",
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    
    return announcements;
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

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        startDate,
        endDate,
        status: "active",
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

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        startDate,
        endDate,
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
    const [hours, minutes] = (data.time as string).split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: date,
        time: date,
      },
    });

    if (existingAppointment) {
      return { success: false, error: 'This time slot has just been booked. Please choose another time.' };
    }

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

    // if (newAppointment.user.email) {
    //   await sendAppointmentEmail(
    //     newAppointment.user.email,
    //     'created',
    //     {
    //       petName: newAppointment.pet.name,
    //       serviceName: newAppointment.service.name,
    //       date: newAppointment.date,
    //       time: newAppointment.time,
    //       notes: newAppointment.notes,
    //     }
    //   );
    // }

    revalidatePath('/appointments');
    return { success: true, error: null, data: newAppointment };
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

    // // Send email notification
    // if (updatedAppointment.user.email) {
    //   await sendAppointmentEmail(
    //     updatedAppointment.user.email,
    //     'status_changed',
    //     {
    //       petName: updatedAppointment.pet.name,
    //       serviceName: updatedAppointment.service.name,
    //       date: updatedAppointment.date,
    //       time: updatedAppointment.time,
    //       status: status,
    //     }
    //   );
    // }

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

    // Combine date and time strings
    const dateTime = new Date(`${dateStr}T${timeStr}`);

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
    // if (appointment.user?.email) {
    //   await sendAppointmentEmail(
    //     appointment.user.email,
    //     'created',
    //     {
    //       petName: appointment.pet?.name || '',
    //       serviceName: appointment.service?.name || '',
    //       date: appointment.date,
    //       time: appointment.time,
    //     }
    //   );
    // }

    revalidatePath('/list/appointments');
    return { success: true, data: appointment };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error: 'Failed to create appointment' };
  }
}
export async function fetchUserAppointments(userId: string, limit: number = 5) {
  const appointments = await prisma.appointment.findMany({
    where: { 
      userId: userId,
      date: {
        gte: new Date(),
      },
    },
    include: {
      pet: true,
      service: true,
      user: true,
    },
    orderBy: {
      date: 'asc',
    },
    take: limit,
  });

  return appointments;
}
export async function fetchAdminAppointments(
  pendingPage: number, 
  scheduledPage: number,
  completedPage: number,
  missedPage: number
) {
  // First update any missed appointments
  await updateMissedAppointments();
  
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
      where: { status: 'pending' },
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
      where: { status: 'scheduled' },
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
      where: { status: 'completed' },
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
      where: { status: 'missed' },
      include: {
        pet: true,
        service: true,
        user: true,
      },
      orderBy: { date: 'desc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (missedPage - 1),
    }),
    prisma.appointment.count({ where: { status: 'pending' } }),
    prisma.appointment.count({ where: { status: 'scheduled' } }),
    prisma.appointment.count({ where: { status: 'completed' } }),
    prisma.appointment.count({ where: { status: 'missed' } }),
  ]);

  return { 
    pendingAppointments, 
    scheduledAppointments, 
    completedAppointments,
    missedAppointments,
    pendingCount,
    scheduledCount,
    completedCount,
    missedCount
  };
}
export async function updateMissedAppointments() {
  const now = new Date();
  
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

    // // Send missed appointment email
    // if (appointment.user.email) {
    //   await sendAppointmentEmail(
    //     appointment.user.email,
    //     'missed',
    //     {
    //       petName: appointment.pet.name,
    //       serviceName: appointment.service.name,
    //       date: appointment.date,
    //       time: appointment.time,
    //     }
    //   );
    // }
  }

  return missedAppointments.length;
}
export async function getBookedTimes(date: string): Promise<Date[]> {
  try {
    const bookedTimes = await prisma.appointment.findMany({
      where: {
        date: new Date(date),
      },
      select: {
        time: true,
      },
    });

    return bookedTimes.map(appointment => appointment.time);
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