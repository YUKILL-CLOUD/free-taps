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
              <p>{(() => {
                  const isoDate = appointment.date.toISOString();
                  const [datePart] = isoDate.split("T");
                  const [year, month, day] = datePart.split("-");
                  
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
                })()}</p>
            </div>
            <div>
              <h3 className="font-semibold">Time</h3>
              <p> {(() => {
                  const isoTime = appointment.time.toISOString();
                  const timeString = isoTime.split('T')[1].split('.')[0];
                  const [hours, minutes] = timeString.split(':').map(Number);
                  
                  // Convert to 12-hour format
                  const hour12 = hours % 12 || 12;
                  const period = hours >= 12 ? 'PM' : 'AM';
                  
                  // Format minutes to always show two digits
                  const formattedMinutes = minutes.toString().padStart(2, '0');
                  
                  return `${hour12}:${formattedMinutes} ${period}`;
                })()}</p>
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