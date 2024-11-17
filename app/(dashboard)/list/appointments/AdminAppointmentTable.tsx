import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from '@/app/components/front/StatusBadge';
import { Button } from '@/components/ui/button';
import { AppointmentWithRelations } from '@/app/components/front/AppointmentTable';
import { getRecordType } from '@/lib/appointments';

type AdminAppointmentTableProps = {
  appointments: AppointmentWithRelations[];
  actions: (appointment: AppointmentWithRelations) => React.ReactNode;
  onRecordClick?: (type: string, appointment: AppointmentWithRelations) => void;
  title?: string;  // Make title optional
};

export function AdminAppointmentTable({ appointments, actions, onRecordClick }: AdminAppointmentTableProps) {
  return (
    <div className="w-full border rounded-md">
      <div className="max-w-full overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px] whitespace-nowrap">Pet</TableHead>
                  <TableHead className="w-[120px] whitespace-nowrap">Owner</TableHead>
                  <TableHead className="w-[120px] whitespace-nowrap">Service</TableHead>
                  <TableHead className="w-[100px] whitespace-nowrap">Record Type</TableHead>
                  <TableHead className="w-[100px] whitespace-nowrap">Date</TableHead>
                  <TableHead className="w-[80px] whitespace-nowrap">Time</TableHead>
                  <TableHead className="w-[80px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="w-[60px] text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => {
                  const recordType = getRecordType(appointment.service.name);
                  const isScheduled = appointment.status === 'scheduled';
                  return (
                    <TableRow key={appointment.id} className="hover:bg-muted/50">
                      <TableCell className="whitespace-nowrap">
                        {appointment.pet.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {appointment.user.firstName} {appointment.user.lastName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {appointment.service.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {recordType !== '-' && isScheduled && onRecordClick && (
                          <Button
                            variant="link"
                            className="p-0 h-auto font-normal"
                            onClick={() => onRecordClick(recordType, appointment)}
                          >
                            {recordType}
                          </Button>
                        )}
                        {recordType === '-' && recordType}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(appointment.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(appointment.time), 'hh:mm a')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={appointment.status} />
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {actions(appointment)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
