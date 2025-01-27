import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "react-datepicker/dist/react-datepicker.css";
import { CldUploadWidget, CldImage} from 'next-cloudinary';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createPet, updatePet, deletePet } from "@/lib/actions";
import { PetSchema } from "@/lib/formValidationSchema";
import { petSchema } from "@/lib/formValidationSchema";
import InputField from "../front/InputField";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  register?: any;
  error?: any;
  value?: string;
  onChange?: (e: any) => void;
}

const PetForm = ({
  type,
  data,
  onSubmitSuccess,
}: {
  type: "create" | "update";
  data?: PetSchema & { id: string };
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
    defaultValues: data ? {
      ...data,
      birthday: data.birthday ? new Date(data.birthday) : undefined,
    } : undefined,
  });

  const onSubmit = async (formData: PetSchema) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to continue");
      return;
    }

    try {
      setIsSubmitting(true);

      if (type === "create") {
        const result = await createPet({
          ...formData,
          img: img,
          userId: session.user.id,
        });
        handleSubmitResult(result);
      } else if (type === "update" && data?.id) {
        console.log('Updating pet with data:', {
          ...formData,
          id: data.id,
          img: img || data.img,
          birthday: formData.birthday ? new Date(formData.birthday) : data.birthday,
        });

        const result = await updatePet({
          ...formData,
          id: data.id,
          img: img || data.img,
          birthday: formData.birthday ? new Date(formData.birthday) : data.birthday,
        });
        handleSubmitResult(result);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResult = (result: { success: boolean; error: string | null }) => {
    if (result.success) {
      toast.success(`Pet ${type === "create" ? "created" : "updated"} successfully!`);
      if (onSubmitSuccess) onSubmitSuccess();
      window.location.reload();
    } else {
      toast.error(result.error || `Failed to ${type} pet`);
    }
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        setIsSubmitting(true);
        const result = await deletePet(data.id);
        if (result.success) {
          toast.success("Pet deleted successfully!");
          if (onSubmitSuccess) onSubmitSuccess();
        } else {
          toast.error(result.error || "Failed to delete pet");
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('An error occurred while deleting the pet');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-100 p-3 sm:p-6 rounded-lg">
        <h2 className="text-base sm:text-lg font-semibold mb-3">Basic Information</h2>
        {session?.user && (
          <p className="text-sm text-gray-500 mb-2">
            Owner: <strong>{session.user.firstName} {session.user.lastName}</strong>
          </p>
        )}
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
              className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-purple-250 sm:text-sm rounded-md"
            >
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Fish">Fish</option>
              <option value="Bird">Bird</option>
              <option value="Reptile">Reptile</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Rodent">Rodent</option>
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
            defaultValue={data?.birthday ? new Date(data.birthday) : undefined}
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
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.sex && <p className="mt-2 text-sm text-red-600">{errors.sex.message}</p>}
          </div>
        </div>
      </div>
  
      <div className="bg-gray-100p-4 sm:p-6 rounded-lg">
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
  
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSubmitting ? 'Submitting...' : (type === "create" ? "Create Pet" : "Update Pet")}
        </button>
        {type === "update" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {isSubmitting ? 'Deleting...' : 'Delete Pet'}
          </button>
        )}
      </div>
    </form>
  );
};

export default PetForm;

