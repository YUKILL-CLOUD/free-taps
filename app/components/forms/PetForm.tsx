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
  
  const methods = useForm<PetSchema>({
    resolver: zodResolver(petSchema),
    defaultValues: data ? {
      ...data,
      birthday: data.birthday ? new Date(data.birthday) : undefined,
    } : undefined,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = methods;

  const onSubmit = async (formData: PetSchema) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsSubmitting(true);
    const result = type === "create"
      ? await createPet({
          ...formData,
          birthday: new Date(formData.birthday),
          img: img,
          userId: session.user.id,
        })
      : await updatePet({
          ...formData,
          birthday: new Date(formData.birthday),
          img: img,
          id: data!.id,
        });
    setIsSubmitting(false);

    if (result.success) {   
      toast.success(`Pet ${type === "create" ? "created" : "updated"} successfully!`);
      if (onSubmitSuccess) onSubmitSuccess();
      if (type === "create") {
        reset();
        setImg(null);
        window.location.reload();
      }
    } else {
      toast.error(result.error || `Failed to ${type} pet. Please try again.`);
    }
  };

  const handleDelete = async () => {
    if (!data?.id) return;
  
    if (window.confirm("Are you sure you want to delete this pet?")) {
      setIsSubmitting(true);
      const result = await deletePet(data.id);
      setIsSubmitting(false);
  
      if (result.success) {
        toast.success("Pet deleted successfully!");
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        toast.error(result.error || "Failed to delete pet. Please try again.");
      }
    }
  };

  return (
    <form className="space-y-4 p-3 sm:p-4 mx-auto" onSubmit={handleSubmit(onSubmit)}>
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
              render={({ field }) => (
                <InputField
                  label="Birthday"
                  type="date"
                  {...field}
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

// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import Image from "next/image";
// import InputField from "../InputField";
// import { petSchema, PetSchema } from "@/lib/formValidationSchema";
// import { createPet, deletePet, updatePet } from "@/lib/action";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { CldUploadWidget } from 'next-cloudinary';
// import { useState } from "react";
// import { useUser } from "@clerk/nextjs";

// const PetForm = ({
//   type,
//   data,
//   onSubmitSuccess,
// }: {
//   type: "create" | "update";
//   data?: PetSchema & { id: number };
//   onSubmitSuccess?: () => void;
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<PetSchema>({
//     resolver: zodResolver(petSchema),
//     defaultValues: data,
//   });

//   const { user } = useUser();
//   const [img, setImg] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const onSubmit = async (formData: PetSchema) => {
//     if (!user?.id) {
//       toast.error("Unable to find user, please try again.");
//       return;
//     }

//     setIsSubmitting(true);
//     const result = type === "create"
//       ? await createPet({ success: false, error: null }, {
//           ...formData,
//           img: img,
//           userId: user.id, // Pass the Clerk user ID
//         })
//       : await updatePet({ success: false, error: null }, {
//           ...formData,
//           img: img,
//           id: data!.id,
//           userId: user.id, // Pass the Clerk user ID for updates as well
//         });
//     setIsSubmitting(false);

//     if (result.success) {
//       toast.success(`Pet ${type === "create" ? "created" : "updated"} successfully!`);
//       if (onSubmitSuccess) onSubmitSuccess(); // Call the success callback
//       if (type === "create") {
//         reset();
//         setImg(null);
//       }
//     } else {
//       toast.error(result.error || `Failed to ${type} pet. Please try again.`);
//     }
//   };

//   const handleDelete = async () => {
//     if (!data?.id) return;

//     if (window.confirm("Are you sure you want to delete this pet?")) {
//       setIsSubmitting(true);
//       const result = await deletePet({ success: false, error: null }, data.id);
//       setIsSubmitting(false);

//       if (result.success) {
//         toast.success("Pet deleted successfully!");
//         // You might want to redirect the user or update the UI here
//       } else {
//         toast.error(result.error || "Failed to delete pet. Please try again.");
//       }
//     }
//   };

//   return (
//     <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
//       <h1 className="text-xl font-semibold">{type === "create" ? "Add your pet" : "Update your pet"}</h1>
//       <span className="text-xs text-gray-400 font-medium">Basic Information</span>
//       {user && (
//         <p className="text-sm text-gray-500">
//           Owner: <strong>{user.firstName} {user.lastName}</strong>
//         </p>
//       )}
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Pet name"
//           name="name"
//           defaultValue={data?.name}
//           register={register}
//           error={errors?.name}
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Type</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("type")}
//             defaultValue={data?.type}
//           >
//             <option value="Dog">Dog</option>
//             <option value="Cat">Cat</option>
//           </select>
//           {errors.type?.message && (
//             <p className="text-xs text-red-400">{errors.type.message.toString()}</p>
//           )}
//         </div>
//         <InputField
//           label="Breed"
//           name="breed"
//           defaultValue={data?.breed}
//           register={register}
//           error={errors?.breed}
//         />
//         {/* Removed userId input field */}
//       </div>
//       <span className="text-xs text-gray-400 font-medium">Personal Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Blood Type"
//           name="bloodType"
//           defaultValue={data?.bloodType}
//           register={register}
//           error={errors.bloodType}
//         />
//         <InputField 
//           label="Birthday" 
//           name="birthday" 
//           type="date" 
//           defaultValue={data?.birthday ? data.birthday.toISOString().split("T")[0] : ''}
//           register={register} 
//           error={errors.birthday} 
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Sex</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("sex")}
//             defaultValue={data?.sex}
//           >
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//           </select>
//           {errors.sex?.message && (
//             <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>
//           )}
//         </div>
//         <CldUploadWidget uploadPreset="tapales" onSuccess={(result: any) => {
//           setImg(result.info.secure_url);
//         }}>
//           {({ open }) => (
//             <div
//               className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
//               onClick={() => open()}
//             >
//               <Image src="/upload.png" alt="" width={28} height={28} />
//               <span>Upload a photo</span>
//             </div>
//           )}
//         </CldUploadWidget>
//       </div>
//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="bg-blue-400 text-white p-2 rounded-md"
//       >
//         {isSubmitting ? 'Submitting...' : (type === "create" ? "Create" : "Update")}
//       </button>
      
//       {type === "update" && (
//         <button
//           type="button"
//           onClick={handleDelete}
//           disabled={isSubmitting}
//           className="bg-red-400 text-white p-2 rounded-md"
//         >
//           {isSubmitting ? 'Deleting...' : 'Delete Pet'}
//         </button>
//       )}
//     </form>
//   );
// };

// export default PetForm;

