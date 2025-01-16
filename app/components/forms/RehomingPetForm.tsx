'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRehomingPet } from '@/lib/actions';

type RehomingPetFormData = {
  name: string;
  age: string;
  gender: string;
  breed: string;
  type: string;
  imageUrl: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
};

export function RehomingPetForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RehomingPetFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [img, setImg] = useState<string>('');

  const onSubmit = async (data: RehomingPetFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries({ ...data, imageUrl: img }).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const result = await createRehomingPet(formData);
      if (result.success) {
        toast.success('Pet listing created successfully');
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Error creating pet listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Pet Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Pet name is required' })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Pet Type</Label>
        <Select onValueChange={(value) => register('type').onChange({ target: { value } })}>
          <SelectTrigger>
            <SelectValue placeholder="Select pet type" />
          </SelectTrigger>
          <SelectContent>
            {['Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'Others'].map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            {...register('age', { required: 'Age is required' })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={(value) => register('gender').onChange({ target: { value } })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="breed">Breed</Label>
        <Input
          id="breed"
          {...register('breed', { required: 'Breed is required' })}
        />
      </div>

      <div className="space-y-2">
        <Label>Pet Photo</Label>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {img && (
            <div className="shrink-0">
              <CldImage width="100" height="100" src={img} alt="Pet photo" className="rounded-lg" />
            </div>
          )}
           <CldUploadWidget uploadPreset="tapales" onSuccess={(result: any) => {
            setImg(result.info.secure_url);
          }}>
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload a photo
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Seller Information</h3>
        <div className="space-y-2">
          <Label htmlFor="sellerName">Name</Label>
          <Input
            id="sellerName"
            {...register('sellerName', { required: 'Seller name is required' })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerPhone">Phone</Label>
          <Input
            id="sellerPhone"
            {...register('sellerPhone', { required: 'Phone number is required' })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerEmail">Email</Label>
          <Input
            id="sellerEmail"
            type="email"
            {...register('sellerEmail', { required: 'Email is required' })}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating...' : 'Create Listing'}
      </Button>
    </form>
  );
}