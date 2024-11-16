import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from 'react'
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { createAppointmentAdmin } from "@/lib/actions"
import { Pet, Service, User } from "@prisma/client"
import { fetchUsers, fetchServices, fetchPetsByUser } from "@/lib/actions"
import { UserData } from '@/types/user'

interface PetData {
  id: string;
  userId: string;
  type: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  breed: string;
  bloodType: string;
  birthday: Date;
  sex: string;
  img: string | null;
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: () => void;
}

export function CreateAppointmentModal({ isOpen, onClose, onFormSubmit }: CreateAppointmentModalProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [pets, setPets] = useState<PetData[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, servicesData] = await Promise.all([
          fetchUsers(),
          fetchServices()
        ]);
        setUsers(usersData);
        setServices(servicesData);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const loadPets = async () => {
      if (selectedUser) {
        try {
          const petsData = await fetchPetsByUser(selectedUser);
          setPets(petsData);
        } catch (error) {
          toast.error('Failed to load pets');
        }
      } else {
        setPets([]);
        setSelectedPet('');
      }
    };

    loadPets();
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedUser || !selectedPet || !selectedService) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    formData.append('userId', selectedUser);
    formData.append('petId', selectedPet);
    formData.append('serviceId', selectedService);
    
    const result = await createAppointmentAdmin(formData);
    if (result.success) {
      toast.success('Appointment created successfully');
      onFormSubmit();
      onClose();
      // Reset form
      setSelectedUser('');
      setSelectedPet('');
      setSelectedService('');
    } else {
      toast.error(result.error || 'Failed to create appointment');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Create New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Select onValueChange={setSelectedUser} value={selectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="userId" value={selectedUser} />
            </div>

            <div className="space-y-2">
              <label>Pet</label>
              <Select name="petId" disabled={!selectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label>Service</label>
              <Select name="serviceId">
                <SelectTrigger>
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label>Date</label>
              <Input
                type="date"
                name="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>

            <div className="space-y-2">
              <label>Time</label>
              <Input
                type="time"
                name="time"
                min="09:00"
                max="17:00"
                step="1800"
                required
              />
              <p className="text-sm text-muted-foreground">
                Available times: 9:00 AM to 5:00 PM
              </p>
            </div>

            <Button type="submit" className="w-full">
              Create Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}