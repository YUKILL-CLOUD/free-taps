'use client'
import React, { useState } from 'react';
import { AppointmentForm } from '@/app/components/forms/AppointmentForm';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AppointmentFormModalProps = {
  pets: { id: string; name: string }[];
  services: { id: string; name: string }[];
  onAppointmentCreated: () => void;
};

export function AppointmentFormModal({ pets, services, onAppointmentCreated }: AppointmentFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Add Appointment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Add New Appointment</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AppointmentForm 
            pets={pets} 
            services={services} 
            onClose={handleClose} 
            onAppointmentCreated={onAppointmentCreated} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}