import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HealthRecordForm } from "@/app/components/forms/HealthRecordForm"
import { toast } from "react-toastify"
import {prisma} from '@/lib/prisma'
import { AppointmentWithRelations } from "@/app/components/front/AppointmentTable"
import {createHealthRecordRelation, updateAppointmentStatus } from "@/lib/actions"

interface HealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentWithRelations;
  onFormSubmit: () => void;
}

export function HealthRecordModal({ isOpen, onClose, appointment, onFormSubmit }: HealthRecordModalProps) {
  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await createHealthRecordRelation(formData, appointment.id);
      if (!result.success) {
        toast.error(result.error || 'Failed to add health record');
        return;
      }

      toast.success('Health record added successfully');
      
      const statusResult = await updateAppointmentStatus({} as any, {
        id: appointment.id,
        status: 'completed'
      });

      console.log('Status update result:', statusResult);

      if (statusResult.success) {
        toast.success('Appointment marked as completed');
        onFormSubmit();
        onClose();
        window.location.reload();
      } else {
        console.error('Status update failed:', statusResult);
        toast.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle>Add Health Record for {appointment.pet.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <HealthRecordForm 
            pets={[appointment.pet]}
            onSubmit={handleSubmit}
            defaultValues={{
              petId: appointment.pet.id,
              appointmentId: appointment.id,
              date: new Date(appointment.date),
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}