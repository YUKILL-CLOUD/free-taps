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
              <TableCell>{format(new Date(appointment.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                      {(() => { 
                        console.log('usertable');
                        console.log('Raw time:', appointment.time);
                       
                        // Create a Date object from the raw UTC time (which is in appointment.time)
                        const timeDate = new Date(appointment.time); // UTC time from the backend

                        // Convert the UTC time to the desired local time zone (e.g., 'Asia/Manila')
                        const timeZone = 'Asia/Manila';  // Replace with your desired time zone
                        const localTime = toZonedTime(timeDate, timeZone);  // Convert UTC to local time

                        // Format the local time in 12-hour AM/PM format
                        const formattedTime = format(localTime, 'hh:mm a', { timeZone });

                        console.log('Formatted time:', formattedTime);
                        return formattedTime;  // Render the formatted time
                      })()}
                    </TableCell>
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
