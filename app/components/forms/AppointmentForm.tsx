'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { createAppointment, getBookedTimes } from '@/lib/actions';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Pet = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
};

type AppointmentFormProps = {
  pets: Pet[];
  services: Service[];
  onClose: () => void;
  onAppointmentCreated: () => void;
};

type AppointmentFormData = {
  petId: string;
  serviceId: string;
  date: string;
  time: string;
  notes: string;
};

export function AppointmentForm({ pets, services, onClose, onAppointmentCreated }: AppointmentFormProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AppointmentFormData>({
    defaultValues: {
      petId: pets.length === 1 ? pets[0].id : '',
      serviceId: '',
      date: '',
      time: '',
      notes: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBookedTimes = async () => {
      if (!selectedDate) return;
      
      try {
        const bookedTimesData = await getBookedTimes(selectedDate);
        console.log('Booked times:', bookedTimesData);
        setBookedTimes(bookedTimesData);
      } catch (error) {
        console.error('Error loading booked times:', error);
        toast.error('Failed to load booked time slots');
      }
    };

    loadBookedTimes();
  }, [selectedDate]);

  useEffect(() => {
    if (pets.length === 1) {
      setSelectedPet(pets[0]);
    }
  }, [pets]);

  const isValidDate = (date: string) => {
    const selectedDate = new Date(date);
    const day = selectedDate.getDay();
    return day >= 0 && day <= 6; // 0 (Sunday) to 6 (Saturday)
  };

  const generateTimeOptions = () => {
    const times: string[]  = [];
    const selectedDay = selectedDate ? new Date(selectedDate).getDay() : -1;
    
    // Return empty array if no date selected
    if (selectedDay === -1) return times;
    
    // Set office hours based on the day
    let startHour = 8;  // Default start time
    let endHour = 17;   // Default end time
    
    // Special hours for Sunday (half day)
    if (selectedDay === 0) { // Sunday
      endHour = 12; // Half day until noon
    }
    
    // Generate time slots based on the day
    if (selectedDay >= 1 && selectedDay <= 6) { // Monday to Saturday
      for (let hour = startHour; hour < endHour; hour++) {
        if (hour === 12) continue; // Skip 12 PM (lunch break)
        for (let minute = 0; minute < 60; minute += 15) {
          // Correctly handle AM/PM format
        const isPM = hour >= 12;
        const hourIn12Format = hour % 12 || 12; // Convert 24-hour to 12-hour
        const period = isPM ? 'PM' : 'AM';
        const time = new Date(2000, 0, 1, hour, minute);
        const formattedTime = `${hourIn12Format}:${minute.toString().padStart(2, '0')} ${period}`;
        times.push(formattedTime);
      }
    }
  } else if (selectedDay === 0) { // Sunday (half day)
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Correctly handle AM/PM format for Sunday
        const isPM = hour >= 12;
        const hourIn12Format = hour % 12 || 12; // Convert 24-hour to 12-hour
        const period = isPM ? 'PM' : 'AM';
        const time = new Date(2000, 0, 1, hour, minute);
        const formattedTime = `${hourIn12Format}:${minute.toString().padStart(2, '0')} ${period}`;
        times.push(formattedTime);
      }
    }
  }
    
    return times;
  };

  const isTimeBooked = (time: string) => {
    if (!selectedDate || !bookedTimes.length) return false;

    // Parse the input time
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours);
    
    // Convert to 24-hour format
    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    return bookedTimes.some(bookedTime => {
      // Split the booked time string (format: "HH:mm AM/PM")
      const [bookedTimeStr, bookedPeriod] = bookedTime.split(' ');
      const [bookedHours, bookedMinutes] = bookedTimeStr.split(':');
      let bookedHour = parseInt(bookedHours);

      // Convert booked time to 24-hour format
      if (bookedPeriod.toUpperCase() === 'PM' && bookedHour !== 12) {
        bookedHour += 12;
      } else if (bookedPeriod.toUpperCase() === 'AM' && bookedHour === 12) {
        bookedHour = 0;
      }

      return bookedHour === hour && parseInt(bookedMinutes) === parseInt(minutes);
    });
  };

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setValue('petId', pet.id);
    setShowSuggestions(false);
    setSearchTerm(pet.name);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    if (e.target.value === '') {
      setSelectedPet(null);
      setValue('petId', '');
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!data.petId || !data.serviceId || !data.date || !data.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const result = await createAppointment({ success: false, error: null }, formData);
      if (result.success) {
        toast.success('Appointment created successfully!');
        reset();
        setSelectedPet(null);
        setSearchTerm('');
        onClose();
        onAppointmentCreated();
        window.location.href = '/appointments';
      } else {
        toast.error(result.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error creating appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2 relative" ref={searchRef}>
        <Label htmlFor="petSearch" className="text-sm font-medium">Pet</Label>
        <Input
          type="text"
          id="petSearch"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for a pet"
          className="w-full"
        />
        {showSuggestions && (
          <ul className="absolute z-50 left-0 right-0 mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-sm overflow-auto border border-gray-200">
            {filteredPets.length > 0 ? (
              filteredPets.map((pet) => (
                <li
                  key={pet.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePetSelect(pet)}
                >
                  {pet.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No pets found</li>
            )}
          </ul>
        )}
        <input type="hidden" {...register("petId")} value={selectedPet?.id || ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceId" className="text-sm font-medium">Service</Label>
        <Select onValueChange={(value) => setValue('serviceId', value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium">Date</Label>
        <div className="relative">
          <Input 
            type="date" 
            id="date" 
            {...register('date')} 
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full cursor-pointer"
            onClick={(e) => {
              const input = e.target as HTMLInputElement;
              input.showPicker();
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time" className="text-sm font-medium">Time</Label>
        <Select onValueChange={(value) => setValue('time', value)}>
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
                const isPM = hour >= 12;
                const period = isPM ? 'PM' : 'AM';
                
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

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
        <Textarea 
          id="notes" 
          {...register('notes')} 
          className="min-h-[100px]"
          placeholder="Add any additional notes here..."
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creating...' : 'Create Appointment'}
      </Button>
    </form>
  );
}
