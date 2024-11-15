import { Pet, Veterinarian, Appointment, Prescription } from "@prisma/client";

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export interface PrescriptionBase {
  id: string;
  petId: string;
  veterinarianId: string;
  appointmentId?: string;
  medication: string;
  dosage: string;
  instructions: string;
  startDate: Date;
  endDate?: Date;
  status: PrescriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type PrescriptionWithRelations = {
  id: string;
  petId: string;
  userId: string;
  appointmentId?: string | null;
  veterinarianId: string;
  medication: any[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  pet: {
    id: string;
    name: string;
    type: string;
    breed: string;
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
    };
  };
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  veterinarian: {
    id: string;
    name: string;
    prclicNo: string;
  };
  appointment?: {
    id: string;
    date: Date;
  } | null;
};

export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  license: string;
  logo?: string;
}

export interface PrintableContent {
  prescription: PrescriptionWithRelations;
  clinicInfo: ClinicInfo;
  qrCode?: string;
}

export type Medication = {
  name: string;
  dosage: string;
  instructions: string;
};

export type PrescriptionFormData = {
  petId: string;
  veterinarianId: string;
  appointmentId?: string;
  medication: Medication[];
  status: 'active' | 'completed' | 'cancelled';
};
