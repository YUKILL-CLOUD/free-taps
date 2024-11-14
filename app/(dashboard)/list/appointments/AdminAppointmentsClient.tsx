'use client'

import { useEffect, useState } from 'react';
import { AppointmentWithRelations } from '@/app/components/front/AppointmentTable';
import { updateAppointmentStatus, deleteAppointment, fetchAdminAppointments, getVeterinarians } from '@/lib/actions';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { MoreHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DewormingModal } from './modals/DewormingModal';
import { HealthRecordModal } from './modals/HealthRecordModal';
import { getRecordType } from '@/lib/appointments';
import { AdminAppointmentTable } from './AdminAppointmentTable';
import Pagination from '@/app/components/front/Pagination';
import { VaccinationModal } from './modals/VaccinationModal';
import { CreateAppointmentModal } from './modals/CreateAppointmentModal';


type AdminAppointmentsClientProps = {
  initialPendingAppointments: AppointmentWithRelations[];
  initialScheduledAppointments: AppointmentWithRelations[];
  initialCompletedAppointments: AppointmentWithRelations[];
  initialMissedAppointments: AppointmentWithRelations[];
  initialCounts: {
    pending: number;
    scheduled: number;
    completed: number;
    missed: number;
  };
};

export default function AdminAppointmentsClient({
  initialPendingAppointments,
  initialScheduledAppointments,
  initialCompletedAppointments,
  initialMissedAppointments,
  initialCounts,
}: AdminAppointmentsClientProps) {
  const [appointments, setAppointments] = useState({
    pending: initialPendingAppointments,
    scheduled: initialScheduledAppointments,
    completed: initialCompletedAppointments,
    missed: initialMissedAppointments,
  });

  const [counts, setCounts] = useState(initialCounts);
  const [pages, setPages] = useState({
    pending: 1,
    scheduled: 1,
    completed: 1,
    missed: 1,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isHealthRecordModalOpen, setIsHealthRecordModalOpen] = useState(false);
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);
  const [isDewormingModalOpen, setIsDewormingModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);

  const [veterinarians, setVeterinarians] = useState<{ id: string; name: string;
    specialization: string;
    phone: string;
    email: string;
    prclicNo: string;
    prtNo: string;
    tinNo: string; }[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const loadVeterinarians = async () => {
      const vets = await getVeterinarians();
      setVeterinarians(vets);
    };
    
    loadVeterinarians();
  }, []);

  useEffect(() => {
    // Update pages state when URL parameters change
    const pendingPage = parseInt(searchParams?.get('pendingPage') || '1');
    const scheduledPage = parseInt(searchParams?.get('scheduledPage') || '1');
    const completedPage = parseInt(searchParams?.get('completedPage') || '1');
    const missedPage = parseInt(searchParams?.get('missedPage') || '1');

    setPages({
      pending: pendingPage,
      scheduled: scheduledPage,
      completed: completedPage,
      missed: missedPage,
    });
  }, [searchParams]);

  const refreshAppointments = async () => {
    try {
      const result = await fetchAdminAppointments(
        pages.pending, 
        pages.scheduled,
        pages.completed,
        pages.missed
      );

      if (!result) {
        toast.error('Failed to fetch appointments');
        return;
      }

      setAppointments({
        pending: result.pendingAppointments || [],
        scheduled: result.scheduledAppointments || [],
        completed: result.completedAppointments || [],
        missed: result.missedAppointments || [],
      });

      setCounts({
        pending: result.pendingCount || 0,
        scheduled: result.scheduledCount || 0,
        completed: result.completedCount || 0,
        missed: result.missedCount || 0
      });
    } catch (error) {
      toast.error('An error occurred while refreshing appointments');
      console.error('Error refreshing appointments:', error);
    }
  };

  const getAvailableStatusTransitions = (appointment: AppointmentWithRelations) => {
    const recordType = getRecordType(appointment.service.name);
    const hasRequiredRecord = appointment.HealthRecord || appointment.Vaccination || appointment.Deworming;

    switch (appointment.status) {
      case 'pending':
        return ['scheduled', 'cancelled'];
      case 'scheduled':
        if (recordType !== '-' && !hasRequiredRecord) {
          return ['cancelled', 'missed']; // Can't complete without record
        }
        return ['completed', 'cancelled', 'missed'];
      case 'completed':
        return ['scheduled']; // Allow rescheduling
      case 'missed':
        return ['scheduled']; // Allow rescheduling
      default:
        return [];
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const result = await updateAppointmentStatus({} as any, { id: appointmentId, status: newStatus });
      if (result.success) {
        toast.success(`Appointment status updated to ${newStatus}`);
        refreshAppointments();
      } else {
        toast.error(result.error || 'Failed to update appointment status');
      }
    } catch (error) {
      toast.error('An error occurred while updating the appointment status');
    }
  };

  const handleDelete = async (appointmentId: string) => {
    try {
      const result = await deleteAppointment({} as any, appointmentId);
      if (result.success) {
        toast.success('Appointment cancelled successfully');
        // Update the local state
        setAppointments(prev => ({
          ...prev,
          pending: prev.pending.filter(a => a.id !== appointmentId),
          scheduled: prev.scheduled.filter(a => a.id !== appointmentId)
        }));
        setCounts(prev => ({
          ...prev,
          pending: prev.pending - 1,
          scheduled: prev.scheduled - 1
        }));
      } else {
        toast.error(result.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the appointment');
    }
  };

  const renderActions = (appointment: AppointmentWithRelations) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {getAvailableStatusTransitions(appointment).map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(appointment.id, status)}
            className={status === 'completed' ? 'text-green-600' : ''}
          >
            Mark as {status}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => handleDelete(appointment.id)}
        >
          Cancel Appointment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );


  const handlePageChange = (type: 'pending' | 'scheduled' | 'completed' | 'missed', newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set(`${type}Page`, newPage.toString());
    router.push(`/list/appointments?${params.toString()}`);
  };

  useEffect(() => {
    refreshAppointments();
  }, [pages.pending, pages.scheduled, pages.completed, pages.missed, refreshAppointments]);

  const handleRecordClick = (type: string, appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    switch (type) {
      case 'Health Record':
        setIsHealthRecordModalOpen(true);
        break;
      case 'Vaccination':
        setIsVaccinationModalOpen(true);
        break;
      case 'Deworming':
        setIsDewormingModalOpen(true);
        break;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Appointment Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Appointment
        </Button>
      </div>

      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFormSubmit={refreshAppointments}
      />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({counts.scheduled})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({counts.completed})
          </TabsTrigger>
          <TabsTrigger value="missed">
            Missed ({counts.missed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminAppointmentTable 
                appointments={appointments.pending}
                actions={renderActions}
                onRecordClick={undefined}
              />
              <div className="mt-4">
                <Pagination 
                  page={pages.pending} 
                  count={counts.pending} 
                  onPageChange={(page) => handlePageChange('pending', page)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminAppointmentTable 
                appointments={appointments.scheduled}
                actions={renderActions}
                onRecordClick={handleRecordClick}
              />
              <div className="mt-4">
                <Pagination 
                  page={pages.scheduled} 
                  count={counts.scheduled} 
                  onPageChange={(page) => handlePageChange('scheduled', page)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminAppointmentTable 
                appointments={appointments.completed}
                actions={renderActions}
                onRecordClick={undefined}
              />
              <div className="mt-4">
                <Pagination 
                  page={pages.completed} 
                  count={counts.completed} 
                  onPageChange={(page) => handlePageChange('completed', page)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missed">
          <Card>
            <CardHeader>
              <CardTitle>Missed Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminAppointmentTable 
                appointments={appointments.missed}
                actions={renderActions}
                onRecordClick={undefined}
              />
              <div className="mt-4">
                <Pagination 
                  page={pages.missed} 
                  count={counts.missed} 
                  onPageChange={(page) => handlePageChange('missed', page)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedAppointment && (
        <>
          <HealthRecordModal
            isOpen={isHealthRecordModalOpen}
            onClose={() => {
              setIsHealthRecordModalOpen(false);
              setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onFormSubmit={refreshAppointments}
          />
          <VaccinationModal
            isOpen={isVaccinationModalOpen}
            onClose={() => {
              setIsVaccinationModalOpen(false);
              setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onFormSubmit={refreshAppointments}
            refreshAppointments={refreshAppointments}
            veterinarians={veterinarians}
          />
          <DewormingModal
            isOpen={isDewormingModalOpen}
            onClose={() => {
              setIsDewormingModalOpen(false);
              setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onFormSubmit={refreshAppointments}
            veterinarians={veterinarians}
          />
        </>
      )}
    </div>
  );
}