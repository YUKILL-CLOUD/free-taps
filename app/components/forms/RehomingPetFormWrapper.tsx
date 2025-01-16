'use client'
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RehomingPetForm } from './RehomingPetForm';

export function RehomingPetFormWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Add New Pet for Rehoming</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Pet for Rehoming</DialogTitle>
        </DialogHeader>
        <RehomingPetForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
} 