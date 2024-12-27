'use client'
import React from 'react';
import PetForm from './PetForm';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PetSchema } from "@/lib/formValidationSchema";

type PetFormModalProps = {
  type: "create" | "update";
  data?: PetSchema & { id: string };
  onPetSubmitted?: () => void;
  trigger?: React.ReactNode;
};

export function PetFormModal({ type, data, onPetSubmitted, trigger }: PetFormModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default">
            {type === "create" ? "Add Pet" : "Edit Pet"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>
            {type === "create" ? "Add New Pet" : "Edit Pet"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <PetForm 
            type={type}
            data={data}
            onSubmitSuccess={onPetSubmitted}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}