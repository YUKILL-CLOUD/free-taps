'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  CalendarPlus,
  PawPrint,
  LayoutDashboard,
  Stethoscope,
} from "lucide-react";

export default function HelpCenter() {
  const router = useRouter();

  const helpCards = [
    {
      title: "Register a Pet",
      description: "Add your furry friend to our system",
      icon: <PawPrint className="h-6 w-6" />,
      path: "/list/pets",
    },
    {
      title: "Book Appointment",
      description: "Schedule a visit with our veterinarians",
      icon: <CalendarPlus className="h-6 w-6" />,
      path: "/appointments",
    },
    {
      title: "View Dashboard",
      description: "Check your pet's health records and appointments",
      icon: <LayoutDashboard className="h-6 w-6" />,
      path: "/user",
    },
    {
      title: "Our Services",
      description: "Explore our veterinary services",
      icon: <Stethoscope className="h-6 w-6" />,
      path: "/list/services",
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          How can we help you today?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpCards.map((card, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  {card.icon}
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">{card.description}</p>
                <Button 
                  onClick={() => router.push(card.path)}
                  className="w-full"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}