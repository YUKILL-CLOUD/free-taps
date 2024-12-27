"use client";

import { deletePet } from "@/lib/actions";
import { Pencil, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


const PetForm = dynamic(() => import("../forms/PetForm"), {
  loading: () => <h1>Loading...</h1>,   
});


const FormModal = ({
  table,
  type,
  data,
  id,
  onSubmitSuccess,
  trigger,
}: {
  table: "pet"
  type: "create" | "update" | "delete";
  data?: any;
  id?: string;
  onSubmitSuccess?: () => void;
  trigger?: React.ReactNode; 
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-5 h-5";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (id) {
      const result = await deletePet(id); // Pass ActionResult and petId
      if (result.success) {
        toast.success("Pet has been deleted!");
        setOpen(false);
        router.refresh(); // Refresh to update the list
        if (onSubmitSuccess) onSubmitSuccess(); // Call success callback
      } else {
        toast.error(result.error || "Failed to delete pet.");
      }
    }
  };

  const Form = () => {
    if (type === "delete") {
      return (
        <form className="p-4 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
            Delete
          </button>
        </form>
      );
    } else {
      return (
        <PetForm 
          type={type} 
          data={data}
          onSubmitSuccess={() => {
            setOpen(false);
            if (onSubmitSuccess) onSubmitSuccess();
          }} 
        />
      );
    }
  };

  return (
    <>
    {trigger ? (
      <div onClick={() => setOpen(true)}>{trigger}</div>
    ) : (
      <button
        className={ `${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Pencil className="w-4 h-4 text-green-500 " />
      </button>
    )}
    {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-md relative w-full max-w-5xl max-h-[90vh] flex flex-col">
          <div className="p-4 overflow-y-auto flex-grow">
            <Form />
          </div>
          <button
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      )}
    </>
  );
};

export default FormModal;