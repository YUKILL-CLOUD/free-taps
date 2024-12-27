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
    <section className="py-12 relative">
      <div 
        className="absolute top-0 w-full h-full" 
        style={{ 
          background: "linear-gradient(268.24deg, rgba(128, 0, 128, 0.76) 50%, rgba(186, 85, 211, 0.545528) 80.61%, rgba(75, 0, 130, 0) 117.35%)" 
        }}
      />
      
      <div className="relative container mx-auto px-4 z-10">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          How can we help you today?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpCards.map((card, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow duration-300 flex flex-col bg-white/90 backdrop-blur-sm"
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 p-3 bg-mainColor-light rounded-full w-fit">
                  {card.icon}
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-1 flex flex-col">
                <p className="text-muted-foreground mb-auto">{card.description}</p>
                <Button 
                  onClick={() => router.push(card.path)}
                  className="w-full mt-4 bg-mainColor-700 hover:bg-mainColor-light hover:text-mainColor-950"
                  variant="default"
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