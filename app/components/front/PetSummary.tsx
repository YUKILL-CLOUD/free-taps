import { Pet } from "@prisma/client";

interface PetSummaryProps {
  pets: Pet[];
}

export default function PetSummary({ pets }: PetSummaryProps) {
  if (!pets || pets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200">
      <h2 className="text-xl font-semibold mb-4">Your Pets</h2>
      <div className="max-h-[250px] overflow-y-auto">
        <ul className="space-y-2">
          {pets.map((pet) => (
            <li key={pet.id} className="border-b pb-2">
              <p className="font-medium">{pet.name}</p>
              <p className="text-sm text-gray-600">{pet.breed}</p>
              <p className="text-xs text-gray-500">{pet.type}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
