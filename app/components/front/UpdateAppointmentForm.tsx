// components/UpdateAppointmentForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateAppointment, getBookedTimes } from '@/lib/actions';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentWithRelations } from './AppointmentTable';

// Add the generateTimeOptions function
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 8; hour < 17; hour++) {
    if (hour === 12) continue; // Skip 12 PM (lunch break)
    for (let minute = 0; minute < 60; minute += 15) {
      const time = new Date(2000, 0, 1, hour, minute);
      times.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }
  }
  return times;
};

type UpdateAppointmentFormProps = {
  appointment: AppointmentWithRelations;
  onClose: () => void;
};

export function UpdateAppointmentForm({ appointment, onClose }: UpdateAppointmentFormProps) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: new Date(appointment.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      notes: appointment.notes || '',
    },
  });
  const [selectedDate, setSelectedDate] = useState<string>(new Date(appointment.date).toISOString().split('T')[0]);
  const [bookedTimes, setBookedTimes] = useState<Date[]>([]);

  useEffect(() => {
    if (selectedDate) {
      getBookedTimes(selectedDate).then(times => 
        setBookedTimes(times.filter(time => 
          new Date(time).getTime() !== new Date(appointment.time).getTime()
        ))
      );
    }
  }, [selectedDate, appointment.time]);

  const isTimeBooked = (time: string) => {
    const [hours, minutes] = time.split(':');
    let hourNum = parseInt(hours, 10);
    const period = time.slice(-2).toLowerCase();
    
    if (period === 'pm' && hourNum !== 12) {
      hourNum += 12;
    } else if (period === 'am' && hourNum === 12) {
      hourNum = 0;
    }
    
    return bookedTimes.some(bookedTime => 
      bookedTime.getHours() === hourNum && 
      bookedTime.getMinutes() === parseInt(minutes, 10)
    );
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append('id', appointment.id.toString());
    formData.append('petId', appointment.petId.toString());
    formData.append('serviceId', appointment.serviceId.toString());
    formData.append('date', data.date);
    formData.append('time', data.time);
    formData.append('notes', data.notes);
    formData.append('status', 'pending');

    try {
      const result = await updateAppointment({} as any, formData);
      if (result.success) {
        toast.success('Appointment updated successfully');
        onClose();
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to update appointment');
      }
    } catch (error) {
      toast.error('An error occurred while updating the appointment');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input 
          type="date" 
          id="date" 
          {...register('date')} 
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">Time</Label>
        <Select 
          onValueChange={(value) => setValue('time', value)} 
          defaultValue={new Date(appointment.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="col-span-2 pb-2 text-sm font-medium text-gray-500">
                {selectedDate ? (
                  new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                ) : 'Please select a date first'}
              </div>
              {generateTimeOptions().map((time) => {
                const isBooked = isTimeBooked(time);
                const timeObj = new Date(`2000/01/01 ${time}`);
                const hour = timeObj.getHours();
                
                return (
                  <SelectItem 
                    key={time} 
                    value={time}
                    disabled={isBooked}
                    className={`
                      flex items-center justify-center p-2 rounded-md transition-colors
                      ${isBooked 
                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }
                      ${hour === 12 ? 'col-span-2 border-t border-gray-200 mt-2' : ''}
                    `}
                  >
                    {time}
                  </SelectItem>
                );
              })}
            </div>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          {selectedDate && new Date(selectedDate).getDay() === 0 
            ? "Sunday: 8:00 AM - 12:00 PM"
            : "Business Hours: 8:00 AM - 5:00 PM (Lunch Break: 12:00 PM - 1:00 PM)"}
        </p>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} />
      </div>
      <Button type="submit">Update Appointment</Button>
    </form>
  );
}
