'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createAppointmentsAdmin, getBookedTimes, fetchUsers, fetchPetsByUser } from '@/lib/actions';
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
import { UserData } from '@/types/user';
import { Pet, Service } from '@prisma/client';

interface AdminAppointmentFormProps {
  onClose: () => void;
  onFormSubmit: () => void;
  services: Service[];
}

export function AdminAppointmentForm({ onClose, onFormSubmit, services }: AdminAppointmentFormProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedTimes, setBookedTimes] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    const loadPets = async () => {
      if (!selectedUser) return;
      
      setIsLoadingPets(true);
      try {
        const petsData = await fetchPetsByUser(selectedUser);
        setPets(petsData);
      } catch (error) {
        toast.error('Failed to load pets');
      } finally {
        setIsLoadingPets(false);
      }
    };

    const timeoutId = setTimeout(loadPets, 300); // 300ms debounce
    return () => clearTimeout(timeoutId);
  }, [selectedUser]);
  useEffect(() => {
    const loadBookedTimes = async () => {
      if (!selectedDate) return;
      
      setIsLoadingTimes(true);
      try {
        const bookedTimesData = await getBookedTimes(selectedDate);
        console.log('Booked times:', bookedTimesData); // Debug log
        setBookedTimes(bookedTimesData.map(time => new Date(time)));
      } catch (error) {
        console.error('Error loading booked times:', error);
        toast.error('Failed to load booked time slots');
      } finally {
        setIsLoadingTimes(false);
      }
    };

    loadBookedTimes();
  }, [selectedDate]);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => 
    users.filter(user =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [users, searchTerm]
  );

  const handleUserSelect = (user: UserData) => {
    setSelectedUser(user.id);
    setSearchTerm(user.firstName + ' ' + user.lastName);
    setShowSuggestions(false);
    // Filter pets for selected user
    const userPets = pets.filter(pet => pet.userId === user.id);
    setPets(userPets);
  };

  const generateTimeOptions = () => {
    const times: string[] = [];
    const selectedDay = selectedDate ? new Date(selectedDate).getDay() : -1;
    
    if (selectedDay === -1) return times;
    
    let startHour = 8;
    let endHour = 17;
    
    if (selectedDay === 0) {
      endHour = 12;
    }
    
    if (selectedDay >= 1 && selectedDay <= 6) {
      for (let hour = startHour; hour < endHour; hour++) {
        if (hour === 12) continue;
        for (let minute = 0; minute < 60; minute += 15) {
          const time = new Date(2000, 0, 1, hour, minute);
          times.push(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }));
        }
      }
    } else if (selectedDay === 0) {
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const time = new Date(2000, 0, 1, hour, minute);
          times.push(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }));
        }
      }
    }
    
    return times;
  };

  const isTimeBooked = (time: string) => {
    if (!selectedDate || !bookedTimes.length) return false;

    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours);
    
    // Convert to 24-hour format
    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    // Create a date object for comparison
    const timeToCheck = new Date(selectedDate);
    timeToCheck.setHours(hour, parseInt(minutes), 0, 0);

    return bookedTimes.some(bookedTime => {
      const bookedDateTime = new Date(bookedTime);
      return bookedDateTime.getHours() === timeToCheck.getHours() && 
             bookedDateTime.getMinutes() === timeToCheck.getMinutes();
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!selectedUser || !selectedPet || !selectedService || !selectedDate || !selectedTime) {
        setIsSubmitting(false);
        toast.error('Please fill in all required fields');
        return;
      }

      const formData = new FormData();
      formData.append('userId', selectedUser);
      formData.append('petId', selectedPet);
      formData.append('serviceId', selectedService);
      formData.append('date', selectedDate);
      formData.append('time', selectedTime);

      const result = await createAppointmentsAdmin(formData);
      
      if (result.success) {
        toast.success('Appointment created successfully');
        onFormSubmit();
        onClose();
        setSelectedUser('');
        setSelectedPet('');
        setSelectedService('');
        setSelectedDate('');
        setSelectedTime('');
      } else {
        toast.error(result.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('An error occurred while creating the appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2" ref={searchRef}>
        <Label htmlFor="owner" className="text-sm font-medium">Owner</Label>
        <div className="relative">
          <Input
            type="text"
            id="owner"
            value={searchTerm}
            onChange={async (e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
              setIsSearching(true);
              // Add debounce delay
              await new Promise(resolve => setTimeout(resolve, 300));
              setIsSearching(false);
            }}
            placeholder="Search by name or email..."
            className="w-full"
            required
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        {showSuggestions && searchTerm && !isSearching && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="font-medium">{`${user.firstName} ${user.lastName}`}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No users found</div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pet" className="text-sm font-medium">Pet</Label>
        <Select
          value={selectedPet}
          onValueChange={setSelectedPet}
          disabled={isLoadingPets}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingPets ? "Loading pets..." : "Select pet"} />
          </SelectTrigger>
          <SelectContent>
            {pets.map((pet) => (
              <SelectItem key={pet.id} value={pet.id}>
                {pet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service" className="text-sm font-medium">Service</Label>
        <Select
          value={selectedService}
          onValueChange={setSelectedService}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service" />
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
            name="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full cursor-pointer"
            onClick={(e) => {
              const input = e.target as HTMLInputElement;
              input.showPicker();
            }}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time" className="text-sm font-medium">Time</Label>
        <Select 
          name="time"
          value={selectedTime}
          onValueChange={setSelectedTime}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingTimes ? "Loading times..." : "Select time"} />
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
