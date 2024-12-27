"use client"
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import UpdatePetForm from "../forms/UpdatePetForm";
import { PetSchema } from "@/lib/formValidationSchema";

const UpdatePetModal = ({ 
  data, 
  onSuccess 
}: { 
  data: PetSchema & { id: string }; 
  onSuccess?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="w-5 h-5 text-green-500" />
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md relative w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="p-4 overflow-y-auto flex-grow">
              <UpdatePetForm 
                data={{
                  id: data.id,
                  name: data.name,
                  type: data.type,
                  breed: data.breed,
                  bloodType: data.bloodType,
                  birthday: typeof data.birthday === "string" ? new Date(data.birthday) : data.birthday,
                  sex: data.sex,
                  img: data.img
                }}
                onSubmitSuccess={() => {
                  setOpen(false);
                  if (onSuccess) onSuccess();
                }}
              />
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

export default UpdatePetModal;