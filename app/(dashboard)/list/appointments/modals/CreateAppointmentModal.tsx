'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from 'react'
import { toast } from "react-toastify"
import { AdminAppointmentForm } from "@/app/components/forms/AdminAppointmentForm"
import { fetchUsers, fetchServices } from "@/lib/actions"
import { Service } from "@prisma/client"
import { UserData } from '@/types/user'

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: () => void;
}

export function CreateAppointmentModal({ isOpen, onClose, onFormSubmit }: CreateAppointmentModalProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, servicesData] = await Promise.all([
          fetchUsers(),
          fetchServices()
        ]);
        setUsers(usersData);
        setServices(servicesData);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle>Create New Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AdminAppointmentForm
            onClose={onClose}
            onFormSubmit={onFormSubmit}
            services={services}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}