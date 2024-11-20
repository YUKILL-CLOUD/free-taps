import { VaccinationForm } from "@/app/components/forms/VaccinationForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { AppointmentWithRelations } from "@/app/components/front/AppointmentTable"
import { createVaccinationRecord, updateAppointmentStatus, createAppointmentAdmin } from "@/lib/actions"
import { Veterinarian } from "@prisma/client"
import { addMonths } from "date-fns"

interface VaccinationResponse {
  success: boolean;
  error?: string;
  data?: {
    nextDueDate: Date;
  };
}

interface VaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentWithRelations;
  onFormSubmit: () => void;
  refreshAppointments: () => Promise<void>;
  veterinarians: {
    id: string;
    name: string;
    specialization: string;
    phone: string;
    email: string;
    prclicNo: string;
    prtNo: string;
    tinNo: string;
  }[];
}

export function VaccinationModal({ isOpen, onClose, appointment, onFormSubmit, refreshAppointments, veterinarians }: VaccinationModalProps) {
  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await createVaccinationRecord(formData, appointment.id) as VaccinationResponse;
      if (result.success) { 
        toast.success('Vaccination record added successfully');
        
        // First update current appointment status to completed
        const statusResult = await updateAppointmentStatus({} as any, { 
          id: appointment.id, 
          status: 'completed' 
        });
        
        if (statusResult.success) {
          toast.success('Current appointment marked as completed');
          
          // Then create next scheduled appointment if there's a next due date
          if (result.data?.nextDueDate) {
            try {
              // Create a proper date object for the next appointment
              const nextDate = new Date(result.data.nextDueDate);
              const [hours, minutes] = '09:00'.split(':');
              nextDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

              const nextAppointmentData = new FormData();
              nextAppointmentData.append('userId', appointment.userId);
              nextAppointmentData.append('petId', appointment.petId);
              nextAppointmentData.append('serviceId', appointment.serviceId);
              nextAppointmentData.append('date', nextDate.toISOString());
              nextAppointmentData.append('time', nextDate.toISOString());
              nextAppointmentData.append('status', 'pending');

              const appointmentResult = await createAppointmentAdmin(nextAppointmentData);

              if (appointmentResult.success) {
                // Update the status to scheduled after creation
                const statusResult = await updateAppointmentStatus({} as any, { 
                  id: appointmentResult.data?.id || '', 
                  status: 'scheduled' 
                });
                
                if (statusResult.success) {
                  toast.success('Next vaccination appointment scheduled');
                  await refreshAppointments();
                } else {
                  toast.error('Failed to update follow-up appointment status');
                }
              } else {
                toast.error('Failed to schedule next appointment');
              }
            } catch (error) {
              console.error('Error creating follow-up appointment:', error);
              toast.error('Failed to create follow-up appointment');
            }
          }
          
          await onFormSubmit(); // Wait for form submit to complete
          onClose();
        } else {
          toast.error('Failed to update appointment status');
        }
      } else {
        toast.error(result.error || 'Failed to add vaccination record');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An error occurred while processing the vaccination');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle>Add Vaccination Record for {appointment.pet.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <VaccinationForm 
            pets={[appointment.pet]}
            onSubmit={handleSubmit}
            veterinarians={veterinarians}
            defaultValues={{
              petId: appointment.pet.id,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}