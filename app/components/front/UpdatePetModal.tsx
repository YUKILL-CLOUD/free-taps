"use client"
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import UpdatePetForm from "../forms/UpdatePetForm";

const UpdatePetModal = ({ data, onSuccess }: { data: any; onSuccess?: () => void }) => {
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
                data={data}
                onSubmitSuccess={() => {
                  setOpen(false);
                  if (onSuccess) onSuccess();
                }}
              />
            </div>
            <button
              className="absolute top-2 right-2 p-1"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdatePetModal;