'use client'
import React, { useState } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { updateAppointment, deleteAppointment } from '@/lib/actions';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Appointment, Deworming, HealthRecord, Pet, Prescription, Service, User, Vaccination } from '@prisma/client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { MoreHorizontal, Calendar, Clock, X, Pencil, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from './StatusBadge';
import { UpdateAppointmentModal } from './UpdateAppointmetModal';

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export type AppointmentWithRelations = Appointment & {
    pet: Pet;
    service: Service;
    petId: string;
    serviceId: string;
    user: User;
    HealthRecord?: any;
    Vaccination?: any;
    Deworming?: any;
    hasConflict?: boolean;
    // healthRecords: HealthRecord[];
    // vaccinations: Vaccination[];
    // dewormings: Deworming[];
    // prescriptions: Prescription[];  
};

type AppointmentTableProps = {
    appointments: AppointmentWithRelations[];
    refreshAppointments: () => void;
    onViewClick?: (appointment: AppointmentWithRelations) => void;
  };
  
export function AppointmentTable({ appointments, refreshAppointments, onViewClick }: AppointmentTableProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);

  const handleUpdate = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setIsUpdateModalOpen(true);
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      const result = await deleteAppointment({} as any, appointmentId);
      if (result.success) {
        toast.success('Appointment cancelled successfully');
        refreshAppointments();
      } else {
        toast.error(result.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the appointment');
    }
  };

  const renderActions = (appointment: AppointmentWithRelations) => (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {(appointment.status === 'pending' || appointment.status === 'scheduled') && (
            <DropdownMenuItem onClick={() => handleUpdate(appointment)} className="flex items-center justify-between">
              Update <Pencil className="h-4 w-4 ml-2" />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onViewClick?.(appointment)} className="flex items-center justify-between">
            View Details<Eye className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCancel(appointment.id)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <>
      <Table>
        <TableCaption>A list of your appointments.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Pet</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.pet.name}</TableCell>
              <TableCell>
                <div className="md:hidden truncate max-w-[80px]">
                  {appointment.service.name}
                </div>
                <div className="hidden md:block">
                  {appointment.service.name}
                </div>
              </TableCell>
              <TableCell>
                {(() => {
                  const isoDate = appointment.date.toISOString();
                  const [datePart] = isoDate.split("T");
                  const [year, month, day] = datePart.split("-");
                  
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
                })()}
              </TableCell>
              <TableCell>
                {(() => {
                  const isoTime = appointment.time.toISOString();
                  const timeString = isoTime.split('T')[1].split('.')[0];
                  const [hours, minutes] = timeString.split(':').map(Number);
                  
                  // Convert to 12-hour format
                  const hour12 = hours % 12 || 12;
                  const period = hours >= 12 ? 'PM' : 'AM';
                  
                  // Format minutes to always show two digits
                  const formattedMinutes = minutes.toString().padStart(2, '0');
                  
                  return `${hour12}:${formattedMinutes} ${period}`;
                })()}
              </TableCell>
              {/* if appointment.time lang anmg i butang if the time is 15:00 then show 3:00 PM + 8 hours = 8pm 
              if namamn ma subtract 8 from the time 15:00 - 8 = 7:00 then show 7:00 AM the time is correct but the day is wwrong
              {(() => {
                  // Create a Date object from the appointment time
                  const timeDate = new Date(appointment.time);
                  
                  // Subtract 8 hours (8 hours * 60 minutes * 60 seconds * 1000 milliseconds)
                  timeDate.setHours(timeDate.getHours() - 8);

                  // Format the adjusted time into 12-hour format with AM/PM
                  return format(timeDate, 'hh:mm a');
                })()} 
                 this is the closest i can get*/}
              <TableCell className="hidden sm:table-cell"><StatusBadge status={appointment.status} /></TableCell>
              <TableCell>{renderActions(appointment)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isUpdateModalOpen && selectedAppointment && (
        <UpdateAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={refreshAppointments}
        />
      )}
      
    </>
  );
}
