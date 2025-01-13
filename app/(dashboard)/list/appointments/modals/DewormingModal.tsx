import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DewormingForm } from "@/app/components/forms/DewormingForm"
import { toast } from "react-toastify"
import {prisma} from "@/lib/prisma"
import { AppointmentWithRelations } from "@/app/components/front/AppointmentTable"
import { createDewormingRecord, updateAppointmentStatus, createAppointmentsAdmin} from "@/lib/actions"

interface DewormingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentWithRelations;
  onFormSubmit: () => void;
  veterinarians: { id: string; name: string }[];
}

interface DewormingResponse {
  success: boolean;
  error?: string;
  data?: {
    nextDueDate: Date;
  };
}

export function DewormingModal({ isOpen, onClose, appointment, onFormSubmit, veterinarians }: DewormingModalProps) {
  const handleSubmit = async (formData: FormData) => {
    try {
      // Add notes to the form data if provided
      const notes = formData.get('notes')?.toString() || '';
      if (notes) {
        formData.set('notes', notes);
      }

      const result = await createDewormingRecord(formData, appointment.id) as DewormingResponse;
      
      if (result.success) {
        toast.success('Deworming record added successfully');
        
        // Update current appointment status to completed
        const statusResult = await updateAppointmentStatus({} as any, { 
          id: appointment.id, 
          status: 'completed' 
        });
        
        if (statusResult.success) {
          toast.success('Current appointment marked as completed');
          
          // Create next scheduled appointment if there's a next due date
          if (result.data?.nextDueDate) {
            try {
              const nextDate = new Date(result.data.nextDueDate);
              
              const nextAppointmentData = new FormData();
              nextAppointmentData.append('userId', appointment.userId);
              nextAppointmentData.append('petId', appointment.petId);
              nextAppointmentData.append('serviceId', appointment.serviceId);
              nextAppointmentData.append('date', nextDate.toISOString().split('T')[0]);
              nextAppointmentData.append('time', '09:00 AM');
              nextAppointmentData.append('notes', 'Follow-up deworming appointment');
              
              const appointmentResult = await createAppointmentsAdmin(nextAppointmentData);

              if (appointmentResult.success) {
                toast.success('Next deworming appointment scheduled');
              } else {
                toast.error('Failed to schedule next appointment');
              }
            } catch (error) {
              console.error('Error creating follow-up appointment:', error);
              toast.error('Failed to create follow-up appointment');
            }
          }
          
          await onFormSubmit();
          onClose();
        } else {
          toast.error('Failed to update appointment status');
        }
      } else {
        toast.error(result.error || 'Failed to add deworming record');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An error occurred while processing the deworming record');
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="w-[95%] max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto p-4 md:p-6">
      <DialogHeader className="mb-4">
        <DialogTitle>Add Deworming Record for {appointment.pet.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <DewormingForm 
          pets={[{
            id: appointment.pet.id,
            name: appointment.pet.name,
            user: appointment.user
          }]}
          veterinarians={veterinarians}
          onSubmit={handleSubmit}
          defaultValues={{
            petId: appointment.pet.id,
          }}
        />
      </div>
    </DialogContent>
  </Dialog>
);
}