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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="min-w-[100px]">Pet</TableHead>
              <TableHead className="min-w-[120px]">Owner</TableHead>
              <TableHead className="min-w-[120px]">Service</TableHead>
              <TableHead className="min-w-[100px]">Record Type</TableHead>
              <TableHead className="min-w-[100px]">Date</TableHead>
              <TableHead className="min-w-[80px]">Time</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[60px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => {
              const recordType = getRecordType(appointment.service.name);
              const isScheduled = appointment.status === 'scheduled';
              return (
                <TableRow key={appointment.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {appointment.pet.name}
                  </TableCell>
                  <TableCell>
                    {appointment.user.firstName} {appointment.user.lastName}
                  </TableCell>
                  <TableCell>
                    {appointment.service.name}
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    {format(new Date(appointment.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(appointment.time), 'hh:mm a')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={appointment.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {actions(appointment)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
