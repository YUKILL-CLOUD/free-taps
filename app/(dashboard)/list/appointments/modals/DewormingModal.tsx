import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DewormingForm } from "@/app/components/forms/DewormingForm"
import { toast } from "react-toastify"
import {prisma} from "@/lib/prisma"
import { AppointmentWithRelations } from "@/app/components/front/AppointmentTable"
import { createDewormingRecord, updateAppointmentStatus} from "@/lib/actions"

interface DewormingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentWithRelations;
  onFormSubmit: () => void;
  veterinarians: { id: string; name: string }[];
}

export function DewormingModal({ isOpen, onClose, appointment, onFormSubmit, veterinarians }: DewormingModalProps) {
  const handleSubmit = async (formData: FormData) => {
    const result = await createDewormingRecord(formData, appointment.id);
    if (result.success) {
      toast.success('Deworming record added successfully');
      // Update appointment status to completed
      const statusResult = await updateAppointmentStatus({} as any, { id: appointment.id, status: 'completed' });
      if (statusResult.success) {
        toast.success('Appointment marked as completed');
        onFormSubmit(); // Refresh the appointments
        window.location.reload(); // Force a full reload
      } else {
        toast.error('Failed to update appointment status');
      }
      onClose();
    } else {
      toast.error(result.error || 'Failed to add deworming record');
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
          pets={[appointment.pet]}
          veterinarians={veterinarians}
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