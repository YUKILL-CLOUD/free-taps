"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import { toast } from 'react-toastify';
import { updatePet } from "@/lib/actions";
import { PetSchema, petSchema } from "@/lib/formValidationSchema";
import InputField from "../front/InputField";

const UpdatePetForm = ({
  data,
  onSubmitSuccess,
}: {
  data: PetSchema & { id: string };
  onSubmitSuccess?: () => void;
}) => {
  const { data: session } = useSession();
  const [img, setImg] = useState<string | null>(data?.img || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PetSchema>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      ...data,
      birthday: data.birthday ? new Date(data.birthday) : undefined,
    },
  });

  const handleUpdate = async (formData: PetSchema) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to continue");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await updatePet({
        ...formData,
        id: data.id,
        img: img || data.img,
        birthday: formData.birthday ? new Date(formData.birthday) : data.birthday,
      });

      if (result.success) {
        toast.success("Pet updated successfully!");
        if (onSubmitSuccess) onSubmitSuccess(); // Call success callback
      } else {
        toast.error(result.error || "Failed to update pet");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while updating the pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = handleSubmit(handleUpdate);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-100 p-3 sm:p-6 rounded-lg">
        <h2 className="text-base sm:text-lg font-semibold mb-3">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <InputField
            label="Pet Name"
            name="name"
            register={register}
            error={errors.name}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              {...register("type")}
              className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Others">Others</option>
            </select>
            {errors.type && <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>}
          </div>
          <InputField
            label="Breed"
            name="breed"
            register={register}
            error={errors.breed}
          />
        </div>
      </div>

      {/* Health Information */}
      <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Health Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <InputField
            label="Blood Type"
            name="bloodType"
            register={register}
            error={errors.bloodType}
          />
          <Controller
            name="birthday"
            control={control}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Birthday"
                name="birthday"
                type="date"
                value={value instanceof Date ? value.toISOString().split('T')[0] : value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(new Date(e.target.value))}
                error={errors.birthday}
                register={register}
              />
            )}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Sex</label>
            <select
              {...register("sex")}
              className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.sex && <p className="mt-2 text-sm text-red-600">{errors.sex.message}</p>}
          </div>
        </div>
      </div>

      {/* Pet Photo */}
      <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Pet Photo</h2>
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full sm:w-auto inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md ${isSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isSubmitting ? 'Updating...' : 'Update Pet'}
        </button>
      </div>
    </form>
  );
};

export default UpdatePetForm;
