import React from 'react';
import {format, toZonedTime } from 'date-fns-tz'
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
  onViewClick?: (appointment: AppointmentWithRelations) => void;
  title?: string;
  isScheduledSection?: boolean;
};

export function AdminAppointmentTable({ 
  appointments, 
  actions, 
  onRecordClick,
  onViewClick,
  isScheduledSection = false
}: AdminAppointmentTableProps) {
  return (
    <div className="w-full border rounded-md">
      <div className="max-w-full overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Pet</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">Owner</TableHead>
                  <TableHead className="whitespace-nowrap">Service</TableHead>
                  {isScheduledSection && (
                    <TableHead className="whitespace-nowrap">Record Type</TableHead>
                  )}
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
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
                      <TableCell className="whitespace-nowrap hidden sm:table-cell">
                        <span className="sm:hidden">
                          {appointment.user.firstName.charAt(0).toUpperCase()}. {appointment.user.lastName.charAt(0).toUpperCase() + appointment.user.lastName.slice(1)}
                        </span>
                        <span className="hidden sm:block">
                        {appointment.user.firstName.charAt(0).toUpperCase() + appointment.user.firstName.slice(1)} {appointment.user.lastName.charAt(0).toUpperCase() + appointment.user.lastName.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="sm:hidden truncate max-w-[70px] block">
                          {appointment.service.name}
                        </span>
                        <span className="hidden sm:block">
                          {appointment.service.name}
                        </span>
                      </TableCell>
                      {isScheduledSection && (
                        <TableCell className="whitespace-nowrap">
                          {recordType !== '-' && isScheduled && onRecordClick && (
                            <Button
                              variant="link"
                              className="p-0 h-auto font-normal text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
                              onClick={() => onRecordClick(recordType, appointment)}
                            >
                              {recordType}
                            </Button>
                          )}
                          {recordType === '-' && recordType}
                        </TableCell>
                      )}
                      <TableCell >
                        {format(new Date(appointment.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                      {(() => {
                        console.log('admin table');
                        console.log('Raw time:', appointment.time);
                        
                        // Create a Date object from the raw UTC time (which is in appointment.time)
                        const timeDate = new Date(appointment.time); // UTC time from the backend

                        // Convert the UTC time to the desired local time zone (e.g., 'Asia/Manila')
                        const timeZone = 'Asia/Manila';  // Replace with your desired time zone
                        const localTime = toZonedTime(timeDate, timeZone);  // Convert UTC to local time

                        // Format the local time in 12-hour AM/PM format
                        const formattedTime = format(localTime, 'hh:mm a', { timeZone });

                        console.log('Formatted time:', formattedTime);
                        return formattedTime;  // Render the formatted time
                      })()}
                    </TableCell>
                      <TableCell className="whitespace-nowrsap hidden sm:table-cell">
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
