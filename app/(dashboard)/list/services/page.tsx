import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import HeroSection from '@/app/components/front/ContactHero';
import Features from '@/app/components/front/Features';
// import PetRehoming from '@/app/components/front/PetRehoming';
import { ServiceModal } from '@/app/components/front/ServiceModal';
import { DeleteServiceModal } from '@/app/components/front/DeleteServiceModal';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { EditServiceModal } from "@/app/components/front/EditServiceModal";

export default async function ServicesPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        return redirect('/');
    }

    const services = await prisma.service.findMany({
        orderBy: { name: 'asc' },
    });
    
    // const rehomingPets = await prisma.rehomingPet.findMany({
    //     orderBy: { createdAt: 'desc' },
    // });

    return (
        <div className="container mx-auto px-4 py-8"> 
            <HeroSection/>
            <h1 className="text-3xl font-bold mb-6">Services</h1>
            {session.user.role === "admin" && (
                <ServiceModal/> 
            )}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div key={service.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="flex flex-col h-full">
                            <h2 className="text-2xl font-bold mb-3 text-mainColor">{service.name}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{service.description}</p>
                            <div className="space-y-2">
                                <div className="bg-mainColor-light/20 rounded-lg p-3">
                                    <p className="font-semibold text-mainColor">
                                        <span className="text-gray-500">Price:</span> Php {service.price.toFixed(2)}+
                                    </p>
                                </div>
                                <div className="bg-mainColor-light/20 rounded-lg p-3">
                                    <p className="font-semibold text-mainColor">
                                        <span className="text-gray-500">Duration:</span> {service.duration} minutes
                                    </p>
                                </div>
                            </div>
                            {session.user.role === "admin" && (
                                <div className="mt-4 flex justify-end space-x-3">
                                    <EditServiceModal service={service} />
                                    <DeleteServiceModal service={service} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Features/>
            {/* <PetRehoming initialPets={rehomingPets} /> */}
        </div>
    );
}
