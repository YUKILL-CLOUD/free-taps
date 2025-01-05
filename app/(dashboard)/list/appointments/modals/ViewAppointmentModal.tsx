import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { AppointmentWithRelations } from "@/app/components/front/AppointmentTable"
import { StatusBadge } from "@/app/components/front/StatusBadge"

interface ViewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentWithRelations;
}

export function ViewAppointmentModal({ isOpen, onClose, appointment }: ViewAppointmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Pet</h3>
              <p>{appointment.pet.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Owner</h3>
              <p>{appointment.user.firstName} {appointment.user.lastName}</p>
            </div>
            <div>
              <h3 className="font-semibold">Service</h3>
              <p>{appointment.service.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <StatusBadge status={appointment.status} />
            </div>
            <div>
              <h3 className="font-semibold">Date</h3>
              <p>{format(new Date(appointment.date), 'MMMM dd, yyyy')}</p>
            </div>
            <div>
              <h3 className="font-semibold">Time</h3>
              <p>{format(new Date(appointment.time), 'hh:mm a')}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-gray-700">
              {appointment.notes || 'No notes available'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 