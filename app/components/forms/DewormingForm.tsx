"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Deworming  } from "@prisma/client";
import InputField from "../front/InputField";

const dewormingSchema = z.object({
  petId: z.string().min(1, "Pet selection is required"),
  date: z.string().min(1, "Date is required"),
  dewormingName: z.string().min(1, "Deworming name is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  medicineName: z.string().min(1, "Medicine name is required"),
  weight: z.string().min(1, "Weight is required")
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Weight must be a positive number"),
  nextDueDate: z.string().optional(),
  veterinarianId: z.string().min(1, "Veterinarian selection is required"),
});

type DewormingSchema = z.infer<typeof dewormingSchema>;

type DewormingFormProps = {
  pets: { id: string; name: string }[];
  veterinarians: { id: string; name: string }[];
  preSelectedPetId?: string;
  initialData?: Partial<Deworming>;
  appointmentId?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  defaultValues?: {
    petId?: string;
    appointmentId?: string;
    date?: Date;
    veterinarianId?: string;
  };
};

export function DewormingForm({ pets, veterinarians, preSelectedPetId, initialData, onSubmit }: DewormingFormProps) {
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<DewormingSchema>({
    resolver: zodResolver(dewormingSchema),
    defaultValues: initialData ? {
      petId: initialData.petId?.toString() ?? '',
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : getCurrentDate(),
      dewormingName: initialData.dewormingName ?? '',
      medicineName: initialData.medicineName ?? '',
      manufacturer: initialData.manufacturer ?? '',
      weight: initialData.weight?.toString() ?? '',
      nextDueDate: initialData.nextDueDate ? new Date(initialData.nextDueDate).toISOString().split('T')[0] : '',
      veterinarianId: initialData.veterinarianId?.toString() ?? '', // Fix: Convert to string
    } : {
      date: getCurrentDate(),
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<{ id: string; name: string } | null>(
    preSelectedPetId ? pets.find(pet => pet.id === preSelectedPetId) || null : null
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preSelectedPetId) {
      const pet = pets.find(p => p.id === preSelectedPetId);
      if (pet) {
        setSelectedPet(pet);
        setSearchTerm(pet.name);
        setValue('petId', pet.id.toString());
      }
    }
  }, [preSelectedPetId, pets, setValue]);

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
    setValue('petId', pet.id.toString());
    setShowSuggestions(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    if (e.target.value === '') {
      setSelectedPet(null);
      setValue('petId', '');
    }
  };

  const handleFormSubmit = async (data: DewormingSchema) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      await onSubmit(formData);
      toast.success("Deworming record saved successfully!");

      // Reset the form after successful submission
      reset({
        petId: '',
        date: getCurrentDate(),
        dewormingName: '',
        medicineName: '',
        manufacturer: '',
        weight: '',
        nextDueDate: '',
      });
      setSearchTerm('');
      setSelectedPet(null);
    } catch (error) {
      toast.error("Failed to save deworming record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      {!preSelectedPetId && (
        <div ref={searchRef} className="relative">
          <label htmlFor="petSearch" className="block text-sm font-medium text-gray-700">Search Pet</label>
          <input
            type="text"
            id="petSearch"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Type to search for a pet..."
          />
          {showSuggestions && (
            <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {filteredPets.length > 0 ? (
                filteredPets.map((pet) => (
                  <li
                    key={pet.id}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                    onClick={() => handlePetSelect(pet)}
                  >
                    {pet.name}
                  </li>
                ))
              ) : (
                <li className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700">
                  No pets found
                </li>
              )}
            </ul>
          )}
          <input type="hidden" {...register("petId")} value={selectedPet?.id || ''} />
          {errors.petId && <p className="mt-1 text-sm text-red-600">{errors.petId.message}</p>}
        </div>
      )}

      <InputField
        label="Date"
        type="date"
        placeholder="Select a date"
        {...register("date")}
        error={errors.date}
        register={register}
      />
      <InputField
        label="Weight (kg)"
        type="number"
        step="0.01"
        placeholder="Enter weight in kg"
        {...register("weight")}
        error={errors.weight}
        register={register}
      />
      <InputField
        label="Deworm Name"
        placeholder="Enter deworming name"
        {...register("dewormingName")}
        error={errors.dewormingName}
        register={register}
      />

      <InputField
        label="Medicine Name"
        placeholder="Enter medicine name"
        {...register("medicineName")}
        error={errors.medicineName}
        register={register}
      />
      
      <InputField
        label="Manufacturer"
        placeholder="Enter manufacturer name"
        {...register("manufacturer")}
        error={errors.manufacturer}
        register={register}
      />

      <InputField
        label="Next Due Date"
        type="date"
        placeholder="Select next due date"
        {...register("nextDueDate")}
        error={errors.nextDueDate}
        register={register}
      />

      <div>
        <p className="text-md font-medium text-gray-700">Veterinarian: {veterinarians[0]?.name || "Not assigned, !must not be empty before submitting!"}</p>
          <input
            type="hidden"
            id="veterinarianId"
            {...register("veterinarianId")}
            value={veterinarians[0]?.id.toString() || ""}
          />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || (!preSelectedPetId && !selectedPet)}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : (initialData ? "Update" : "Create") + " Vaccination Record"}
      </button>
    </form>
  );
}
