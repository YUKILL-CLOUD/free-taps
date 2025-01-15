'use client'
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRehomingPets } from '@/lib/actions';

type RehomingPet = {
  id: string;
  name: string;
  age: string;
  gender: string;
  breed: string;
  type: string;
  imageUrl: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
};

export function RehomingPetCarousel() {
  const [pets, setPets] = useState<RehomingPet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPet, setSelectedPet] = useState<RehomingPet | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      const data = await getRehomingPets();
      setPets(data);
    };
    fetchPets();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % pets.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + pets.length) % pets.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setTouchStart(null);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div
        ref={carouselRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="min-w-full p-4 cursor-pointer"
              onClick={() => setSelectedPet(pet)}
            >
              <div className="relative group">
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  <p className="text-white text-xl">Click to view details</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold">{pet.name}</h3>
                <p className="text-gray-600">{pet.breed} • {pet.age}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="absolute left-2 top-1/2 transform -translate-y-1/2"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {pets.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      <Dialog open={!!selectedPet} onOpenChange={() => setSelectedPet(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPet?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <img
              src={selectedPet?.imageUrl}
              alt={selectedPet?.name}
              className="w-full h-[300px] object-cover rounded-lg"
            />
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Pet Details</h3>
                <p>Type: {selectedPet?.type}</p>
                <p>Breed: {selectedPet?.breed}</p>
                <p>Age: {selectedPet?.age}</p>
                <p>Gender: {selectedPet?.gender}</p>
              </div>
              <div>
                <h3 className="font-semibold">Contact Information</h3>
                <p>Name: {selectedPet?.sellerName}</p>
                <p>Phone: {selectedPet?.sellerPhone}</p>
                <p>Email: {selectedPet?.sellerEmail}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}