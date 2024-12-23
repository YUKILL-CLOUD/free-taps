"use client"
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { deletePet } from "@/lib/actions";
import { toast } from "react-toastify";

const DeletePetModal = ({ id, onSuccess }: { id: string; onSuccess?: () => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        setIsDeleting(true);
        const result = await deletePet(id);
        if (result.success) {
          toast.success("Pet deleted successfully!");
          if (onSuccess) onSuccess();
        } else {
          toast.error(result.error || "Failed to delete pet");
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('An error occurred while deleting the pet');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-5 h-5 text-red-500" />
    </Button>
  );
};

export default DeletePetModal;