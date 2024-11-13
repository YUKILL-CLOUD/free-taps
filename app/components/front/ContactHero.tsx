"use client"
export default function HeroSection() {
return (
<section className="relative pt-20 lg:pt-24 pb-20 bg-gradient-to-b from-mainColor-200 to-gray-50 dark:from-mainColor/5 dark:to-gray-900">
            <div className="absolute top-0 inset-x-0 h-64 flex items-start">
                    <div className="h-24 w-2/3 bg-gradient-to-br from-mainColor/40 via-purple-400/30 to-transparent blur-2xl dark:from-mainColor dark:invisible dark:opacity-40">
                    </div>
                    <div className="h-20 w-3/5 bg-gradient-to-r from-mainColor/30 via-purple-300/20 to-transparent blur-2xl dark:from-mainColor dark:opacity-40">
                    </div>
                </div>
                <div className="relative mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-12">
                    <div aria-hidden="true" className="absolute inset-y-0 w-44 left-0 hidden dark:flex">
                        <div className="h-full md:h-1/2 lg:h-full w-full bg-gradient-to-tr from-mainColor/20 via-purple-400/10 to-transparent opacity-40 dark:blur-2xl dark:from-mainColor dark:opacity-20">
                        </div>
                    </div>
                    <div className="mx-auto space-y-2 text-center lg:text-center flex flex-col max-w-3xl justify-center lg:justify-start lg:py-8 flex-1 lg:w-1/2 lg:max-w-none">
                    <h1 className="text-mainColor dark:text-mainColor text-3xl/snug sm:text-5xl/tight lg:text-4xl/tight xl:text-[3.50rem]/tight font-bold">
                        Connect with our Friendly Clinic
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 lg:text-lg max-w-2xl lg:max-w-none mx-auto">
                        Get in touch with our veterinary team for appointments, inquiries, or any concerns about your pet's health. We're here to help!
                    </p>
                    <div className="mt-6 pt-8">
                    {/* <a href="/list/contact/form" 
                       className="inline-block py-2.5 px-6 text-white font-medium bg-mainColor hover:bg-mainHover transition-all duration-300 rounded-full shadow-lg hover:shadow-mainColor/30 transform hover:-translate-y-0.5">
                            Make Connections
                    </a> */}
                </div>
                </div>
                </div>
            </section>
)
}
