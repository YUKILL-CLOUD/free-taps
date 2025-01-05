"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPrescriptionAction } from "@/lib/actions";
import { MedicationFields } from "./MedicationFields";

// Schema definitions remain the same
const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  instructions: z.string().min(1, "Instructions are required"),
});

const prescriptionSchema = z.object({
  petId: z.string().min(1, "Pet is required"),
  veterinarianId: z.string().min(1, "Veterinarian is required"),
  appointmentId: z.string().optional(),
  medications: z.array(medicationSchema).min(1, "At least one medication is required"),
  status: z.enum(["active", "completed", "cancelled"]).default("active"),
  userId: z.string(), // Add this line to match schema
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

type PrescriptionFormProps = {
  pets: { id: string; name: string }[];
  veterinarians: { id: string; name: string }[];
  preSelectedPetId?: string;
  appointments?: any[] | null;
  userId: string;
  onSubmit?: (formData: FormData) => Promise<void>;
  defaultValues?: {
    petId?: string;
    date?: Date;
  };
};

export function PrescriptionForm({
  pets,
  veterinarians,
  preSelectedPetId,
  appointments,
  userId,
  defaultValues
}: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<{ id: string; name: string } | null>(
    preSelectedPetId ? pets.find(pet => pet.id === preSelectedPetId) || null : null
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Set default veterinarian
  const defaultVeterinarian = veterinarians[0];

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      petId: preSelectedPetId || undefined,
      veterinarianId: defaultVeterinarian?.id,
      appointmentId: undefined,
      medications: [{ name: '', dosage: '', instructions: '' }],
      status: "active",
      userId: userId,
    },
  });

  // Add useEffect to handle preselected pet
  useEffect(() => {
    if (preSelectedPetId) {
      const pet = pets.find(p => p.id === preSelectedPetId);
      if (pet) {
        setSelectedPet(pet);
        setSearchTerm(pet.name);
        form.setValue('petId', pet.id);
      }
    }
  }, [preSelectedPetId, pets, form]);

  // Filter pets based on search term
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

  const handlePetSelect = (pet: { id: string; name: string }) => {
    setSelectedPet(pet);
    setSearchTerm(pet.name);
    form.setValue('petId', pet.id);
    setShowSuggestions(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    if (value === '') {
      setSelectedPet(null);
      form.setValue('petId', '');
    }
  };


  async function onSubmit(data: PrescriptionFormData) {
    console.log('Form - Submit data:', data);
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('petId', data.petId);
      formData.append('veterinarianId', data.veterinarianId);
      formData.append('userId', userId);
      if (data.appointmentId) {
        formData.append('appointmentId', data.appointmentId);
      }
      formData.append('medications', JSON.stringify(data.medications));
      formData.append('status', data.status);

      console.log('Form - FormData created:', Object.fromEntries(formData.entries()));
      
      const result = await createPrescriptionAction(formData);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success('Prescription created successfully');
      router.push('/list/prescriptions');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div ref={searchRef} className="relative">
            <FormLabel>Search Pet</FormLabel>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Type to search for a pet..."
            />
            {showSuggestions && (
              <ul className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredPets.length > 0 ? (
                  filteredPets.map((pet) => (
                    <li
                      key={pet.id}
                      className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      onClick={() => handlePetSelect(pet)}
                    >
                      {pet.name}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-muted-foreground">No pets found</li>
                )}
              </ul>
            )}
            <input type="hidden" {...form.register("petId")} value={selectedPet?.id || ''} />
          </div>

          {/* Hidden veterinarian field */}
          <input 
            type="hidden" 
            {...form.register("veterinarianId")} 
            value={defaultVeterinarian?.id || ''} 
          />

          {appointments && (
            <FormField
              control={form.control}
              name="appointmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Appointment</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an appointment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointments.map((apt) => (
                        <SelectItem key={apt.id} value={String(apt.id)}>
                          {format(apt.date, 'PPP')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="space-y-4">
            <label className="block text-sm font-medium">Medications</label>
            <MedicationFields />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Prescription'}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}
