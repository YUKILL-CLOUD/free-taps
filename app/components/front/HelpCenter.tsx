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
    <section className="min-h-screen py-12 relative flex items-center">
      <div 
        className="absolute inset-0" 
        style={{ 
          background: "linear-gradient(268.24deg, rgba(128, 0, 128, 0.85) 50%, rgba(186, 85, 211, 0.65) 80.61%, rgba(75, 0, 130, 0.5) 117.35%)",
          backdropFilter: "blur(8px)"
        }}
      />
      
      <div className="relative container mx-auto px-4 z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 text-white">
          How can we help you today?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpCards.map((card, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow duration-300 flex flex-col 
                bg-white/20 backdrop-blur-lg border border-white/30 
                shadow-xl hover:shadow-2xl 
                hover:bg-white/30 hover:border-white/40 
                transition-all duration-300 text-white"
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 p-3 bg-white/25 rounded-full w-fit">
                  {card.icon}
                </div>
                <CardTitle className="text-xl text-white">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-1 flex flex-col">
                <p className="text-white/80 mb-auto">{card.description}</p>
                <Button 
                  onClick={() => router.push(card.path)}
                  className="w-full mt-4 bg-white/25 hover:bg-white/40 text-white border border-white/50
                    hover:border-white/60 transition-all duration-300"
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