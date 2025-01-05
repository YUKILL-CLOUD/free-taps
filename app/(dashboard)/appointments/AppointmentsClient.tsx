'use client'

import { useState } from 'react';
import { AppointmentFormModal } from '@/app/components/forms/AppointmentFormModal';
import { AppointmentTable, AppointmentWithRelations } from '@/app/components/front/AppointmentTable';
import Pagination from '@/app/components/front/Pagination';
import { fetchUserAppointmentsByStatus } from '@/lib/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from 'next/navigation';
import { ViewAppointmentModal } from '../list/appointments/modals/ViewAppointmentModal';

type AppointmentsClientProps = {
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
  pets: { id: string; name: string }[];
  services: { id: string; name: string }[];
  userId: string;
};

export default function AppointmentsClient({ 
  initialPendingAppointments,
  initialScheduledAppointments,
  initialCompletedAppointments,
  initialMissedAppointments,
  initialCounts,
  pets,
  services 
}: AppointmentsClientProps) {
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const refreshAppointments = async () => {
    const results = await Promise.all([
      fetchUserAppointmentsByStatus('pending', pages.pending),
      fetchUserAppointmentsByStatus('scheduled', pages.scheduled),
      fetchUserAppointmentsByStatus('completed', pages.completed),
      fetchUserAppointmentsByStatus('missed', pages.missed),
    ]);

    setAppointments({
      pending: results[0].appointments,
      scheduled: results[1].appointments,
      completed: results[2].appointments,
      missed: results[3].appointments,
    });

    setCounts({
      pending: results[0].count,
      scheduled: results[1].count,
      completed: results[2].count,
      missed: results[3].count,
    });
  };

  const handlePageChange = (type: 'pending' | 'scheduled' | 'completed' | 'missed', newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set(`${type}Page`, newPage.toString());
    router.push(`/appointments?${params.toString()}`);
  };

  const handleViewAppointment = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <AppointmentFormModal pets={pets} services={services} onAppointmentCreated={refreshAppointments} />
      </div>

      <Tabs defaultValue="scheduled" className="w-full">
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

        {Object.entries(appointments).map(([status, appointmentsList]) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{status} Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentTable 
                  appointments={appointmentsList} 
                  refreshAppointments={refreshAppointments}
                  onViewClick={handleViewAppointment}
                />
                <div className="mt-4">
                  <Pagination 
                    page={pages[status as keyof typeof pages]} 
                    count={counts[status as keyof typeof counts]}
                    onPageChange={(page) => handlePageChange(status as any, page)} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {selectedAppointment && (
        <ViewAppointmentModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
}
