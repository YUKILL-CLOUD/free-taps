"use client"
import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Icon } from '@iconify/react';

type Services = {
    id: number;
    title: string;
    description: string;
    icon: string;
    fullDescription?: React.ReactNode;
};

type ServiceCard = {
    title: string;
    description: string;
    icon: string;
    fullDescription?: React.ReactNode;
    onReadMore: () => void;
};

const ServiceCard: React.FC<ServiceCard> = ({ title, description, icon, onReadMore }) => {
    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-5 bg-mainColor-light xl:p-7 hover:cursor-default rounded-lg bg-gray-100 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 group transition-all duration-300 hover:shadow-lg">
            <div className="absolute w-40 h-10 rounded-full border-8 border-sky-600/20 dark:border-sky-500/30 blur-md -z-10 -top-1 right-5 rotate-45" />
            <div className="flex min-w-max items-start">
                <div className="p-1.5 rounded-full shadow-md relative bg-gradient-to-br from-mainColor to-purple-400 dark:from-mainColor dark:to-purple-600">
                    <div className="bg-white dark:bg-gray-900 rounded-full p-3 flex">
                        <Icon icon={icon} className="w-10 h-10 text-mainColor dark:text-mainColor" />
                    </div>
                </div>
            </div>
            <div className="space-y-5 flex flex-col md:flex-1 relative">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-justify line-clamp-3">
                    {description}
                </p>
                <button 
                    onClick={onReadMore}
                    className="text-mainColor hover:text-mainHover dark:text-mainColor dark:hover:text-mainHover flex items-center gap-x-3 w-max transition-colors duration-300"
                >
                    Read more
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

const Features: React.FC = () => {
    const [selectedService, setSelectedService] = useState<Services | null>(null);

    const services: Services[] = [
        {
            id: 1,
            title: "Immunization",
            description: "To ensure safe and nourishing environment for your pet, our clinic offers deworming and rabies vaccinations for canines and felines.",
            icon: "medical-icon:i-immunizations",
            fullDescription: (
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                            Vaccinations have been a hot topic of conversation for some time now, but we don’t only need to worry about protecting the human population from dangerous and potentially deadly diseases. Dogs, cats, and other animals can be just as likely to catch viruses and other transmissible diseases, many of which can prove fatal. Pet vaccinations work in the same way as human vaccines – by preparing your pet’s body to recognize and fight specific harmful bacteria or viruses. Vaccines can significantly reduce or completely prevent symptoms and effects of some of the diseases that our animals come into contact with. They are usually provided on a regular schedule since their effectiveness doesn’t necessarily last forever.
                        </p>
                    <h1 className="text-mainColor-default dark:text-gray-300 text-2xl lg:text-2xl font-semibold pt-8">
                        Rabies Vaccination
                    </h1>
                        <p className=" text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                            Rabies is a zoonotic viral disease which infects domestic and wild animals. It is transmitted to other animals and humans through close contact with saliva from infected animals (i.e., bites, scratches, licks on broken skin, and mucous membranes). Once symptoms of the disease develop, rabies is fatal to both animals and humans. Rabies differs from many other infections in that the development of clinical disease can be prevented through timely immunization even after exposure to the infecting agent. The rabies vaccine is an altered or inactive version of the virus, which invokes an immune response in your pet and creates antibodies that fight the disease. Your pet’s immune response to the vaccine deteriorates over time, and your pet needs multiple doses throughout their lives to protect them from the disease. Vets usually advise dogs and cats to receive booster doses every year or every three years, depending on the vaccine.
                        </p>
                        <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold px-1">Dogs</span> – Puppies must be around 12 to 16 weeks old to receive the first dose of the rabies vaccine. This is called the primary dose, and the second dose of the vaccine is given within one year of the primary vaccination. Subsequent doses, known as booster doses, are administered every year or every three years, depending on the vaccine.
                        </p>
                        <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold px-1">Cats</span> – Kittens receive their first rabies vaccination at 8 to 12 weeks old. The second dose of the vaccine is given within a year of the first dose. Booster doses are administered yearly or once every three years, depending on the vaccine and the manufacturer’s instructions.
                        </p>
                    <h1 className="text-mainColor-default dark:text-gray-300 text-2xl lg:text-2xl font-semibold pt-4">
                        Deworming
                    </h1>
                        <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        Deworming is an important preventative care regime for reducing parasites (internal and external) and improving your pet’s health. It is also important to help to prevent transmission of parasites to you and your human family members! Here are some things to know about those unwanted houseguests your cat or dog might unknowingly be hosting. 
                        </p>
                        <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold px-1"> Puppies and Kittens need to be dewormed more often:</span> It is recommended that your puppy or kitten is dewormed every 2 weeks until they reach 3 months of age. Puppies and kittens are usually born with parasites passed on from mom (even if mom is dewormed) before they are born. After this, in our area, deworming depends on exposure risk. Please discuss this with your vet.
                        </p>
                        <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold px-1"> Just because you can’t see them, doesn’t mean they’re not there: </span>Sometimes we can see little wiggly worms in our pet’s feces, but this is not always the case. When in doubt, a fecal examination is done to check for parasites.
                        </p>
                        <p className=" text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-left text-mainColor-default font-bold px-1">  There are certain factors that can increase exposure. </span>
                        </p>
                        <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold px-1"> Certain people are at higher risk than others: </span> Children, the elderly, pregnant women, cancer patients, diabetics and anyone else with a suppressed immune system are at a greater risk. Many dogs and cat parasites are “zoonotic”, meaning they are transmissible from animals and cause disease in humans. Be cautious and take extra care if there is anyone in your household who might be at a greater risk for exposure.
                        </p>
                </div>
            )
        },
        {
            id: 2,
            title: "Consultation and Physical Check-up",
            description: "The clinic provides thorough physical check up and consultation for canines and felines.",
            icon: "healthicons:doctor",
            fullDescription: (
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                        Regular check-ups are essential for maintaining your pet's health and detecting potential issues early. Our comprehensive physical examinations include detailed assessments of your pet's overall health status and preventive care recommendations.
                    </p>
                    <h1 className="text-mainColor-default dark:text-gray-300 text-2xl lg:text-2xl font-semibold pt-8">
                        What to Expect During a Check-up
                    </h1>
                    <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        During your pet's check-up, our veterinarians will perform a thorough examination that includes:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Weight and body condition assessment</li>
                        <li>Heart and respiratory rate check</li>
                        <li>Temperature measurement</li>
                        <li>Ear and eye examination</li>
                        <li>Dental health evaluation</li>
                        <li>Skin and coat inspection</li>
                        <li>Musculoskeletal assessment</li>
                        <li>Abdominal palpation</li>
                    </ul>

                    <h1 className="text-mainColor-default dark:text-gray-300 text-2xl lg:text-2xl font-semibold pt-4">
                        Consultation Services
                    </h1>
                    <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        Our consultation services cover a wide range of topics including:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Preventive care recommendations</li>
                        <li>Nutrition and diet advice</li>
                        <li>Behavior concerns</li>
                        <li>Age-related health issues</li>
                        <li>Vaccination schedules</li>
                        <li>Parasite prevention</li>
                    </ul>

                    <h1 className="text-mainColor-default dark:text-gray-300 text-2xl lg:text-2xl font-semibold pt-4">
                        When to Schedule a Check-up
                    </h1>
                    <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold">Puppies and Kittens:</span> Monthly visits until 16 weeks of age
                    </p>
                    <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold">Adult Pets:</span> Annual wellness exams
                    </p>
                    <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold">Senior Pets:</span> Bi-annual check-ups recommended
                    </p>
                    <p className="text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                        <span className="text-mainColor-default font-bold">Emergency Cases:</span> Immediate consultation for sudden illness, injury, or concerning symptoms
                    </p>
                </div>
            )
        },
        {
            id: 3,
            title: "Complete Blood Count Testing",
            description: "Our clinic provides comprehensive blood testing services to evaluate your pet's overall health status and detect potential health issues early.",
            icon:  "medical-icon:i-laboratory",
            fullDescription: (
                <div className="space-y-4">
                    <p className=" text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                        This is a simple blood test that provides information about the different cell types in the blood. These include red blood cells, which carry oxygen to the tissues; white blood cells, which fight infection and respond to inflammation; and platelets, which help the blood to clot.
                        The CBC provides details about the number, size, and shape of the various cell types and identifies the presence of abnormal cells in circulation. See handout "Complete Blood Count" for further information. <br />
                        A small sample of blood is collected into a special tube that prevents the blood from clotting. The sample is then put in a machine called an automated blood analyzer, which counts the different cell types and describes various characteristics of the cells. In addition, a drop of blood is spread thinly on a glass slide, creating a blood smear. This smear is stained with special dyes and examined under the microscope to look at the appearance of individual cells. The blood smear is assessed by a trained technician or veterinarian and may be sent to a pathologist for review if the cells are abnormal.
                        </p>
                        <h1 className="text-mainColor-default dark:text-gray-300 text-2xl lg:text-2xl font-semibold">
                        The CBC provides information about the three types of cells found in blood:
                    </h1>
                            <ol className=" text-left list-decimal pl-5 space-y-2">
                                <li>red blood cells (also called erythrocytes or red cells),</li>
                                <li>white blood cells (also called leukocytes or white cells), and</li>
                                <li> platelets (also called thrombocytes). </li>
                            </ol>
                        
                        <p className=" text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg lg:max-w-none mx-auto lg:mx-0">
                            A CBC reports details on the number, size, and shape of each cell type, as well as any variation in appearance.
                        </p>
                </div>
            )
        },
        {
            id: 4,
            title: "Pharmacy",
            description: "Access a wide range of pet medications, supplements, and preventive care products through our fully licensed pharmacy, with expert guidance from our veterinary team.",
            icon: "medical-icon:i-pharmacy",
            fullDescription: (
                <div className="space-y-4">
                    <p className=" text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                        Our fully licensed pet pharmacy offers the same medications and supplements you get from your vet, and we provide those medications with unmatched value and convenience.
                        Having a written prescription can also be a plus if you live or work close to a pharmacy. If your pet is on a long term prescription you can pick up your pet medications when convenient.
                        We prepare medications specially flavored for your animal, whether they are canine, or feline. Even if your pet refuses to take his/her medication orally, we can provide a wide range of medications that may be applied topically to the skin. Please contact us if you have any questions regarding a compounded veterinary preparation.
                        </p>
                        <h1 className="text-mainColor-default dark:text-gray-300 text-2xl lg:text-2xl font-semibold">
                        Our pharmacy can prepare:
                        </h1>
                        <ul className="list-disc pl-5 space-y-2 pb-5 text-left">
                                <li>Flavored medication</li>
                                <li>Medicine in ideal size, strength, and dosage form</li>
                                <li>Unavailable medications</li>
                                <li>Combinations to improve compliance</li>
                        </ul>
                        <h1 className="text-mainColor-default dark:text-gray-300 text-2xl lg:text-2xl font-semibold">
                        Medicines available:
                        </h1>
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 list-disc pl-5 space-y-2 pb-5 text-gray-700 dark:text-gray-300 text-left">
                            <li>Groffonia seed extract (5- hydroxytryptophan)</li>
                            <li>Acetaminophen</li>
                            <li>Alpha lipoic acid</li>
                            <li>Aspirin (at high doses)</li>
                            <li>Caffeine</li>
                            <li>NSAIDs</li>
                            <li>Imidazolines (e.g., Afrin®, Visine®)</li>
                            <li>Phenazopyridine</li>
                            <li>Phenylephrine</li>
                            <li>Pseudoephedrine</li>
                            <li>Vitamin D (esp. in rodenticides)</li>
                            <li>Benzocaine, benzoic acid derivatives</li>
                            <li>Attention deficit and hyperactivity medications</li>
                            <li>Benzodiazepines</li>
                            <li>Z-drugs</li>
                            <li>Birth control (esp. female pets)</li>
                            <li>Beta blockers</li>
                            <li>Statins</li>
                            <li>Baclofen</li>
                            <li>Asthma inhalers</li>
                            <li>Heartworm medications (genetic variants)</li>
                            <li>Isoniazid</li>
                        </ul>
                </div>
            )
        },
    ];

    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5 flex flex-col items-start gap-10 xl:gap-14">
                <div className="flex flex-col gap-5">
                    <div className="space-y-4 max-w-xl">
                        <span className="text-mainColor-default dark:text-blue-500 font-semibold pl-6 relative before:absolute before:top-1/2 before:left-0 before:w-5 before:h-px before:bg-blue-600 dark:before:bg-blue-500 before:rounded-full">
                            Services
                        </span>
                        <h1 className="font-bold text-gray-800 dark:text-white text-3xl">We are here to help with best services
                        </h1>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                        Providing comprehensive veterinary care with dedication and expertise
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 md:gap-10">
                    {services.map(service => (
                        <ServiceCard 
                            key={service.id} 
                            {...service} 
                            onReadMore={() => setSelectedService(service)}
                        />
                    ))}
                </div>

                <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedService?.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {selectedService?.fullDescription}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    )
}

export default Features
