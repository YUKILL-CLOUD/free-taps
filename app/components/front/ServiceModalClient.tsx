"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  duration: z.number().min(0, 'Duration must be a positive number'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServiceModalClient({ createService }: { createService: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const onSubmit = async (data: ServiceFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
  
    const result = await createService({ success: false, error: null }, formData);
    if (result.success) {
      setIsOpen(false);
      reset();
      toast.success('Service created successfully!');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to create service. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-mainColor-light shadow-md hover:bg-mainColor-dark text-grey-50">
          Add New Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-mainColor-default">Add New Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Service Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., General Checkup"
              className="w-full border-gray-300 focus:border-mainColor-light"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed description of the service"
              className="w-full border-gray-300 focus:border-mainColor-light min-h-[100px]"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
              Price (PHP) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full border-gray-300 focus:border-mainColor-light"
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
              Duration (Minutes) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="duration"
              {...register('duration', { valueAsNumber: true })}
              type="number"
              step="1"
              placeholder="30"
              className="w-full border-gray-300 focus:border-mainColor-light"
            />
            {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-mainColor-default hover:bg-mainColor-dark text-white"
            >
              Create Service
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}