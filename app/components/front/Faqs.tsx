import React from 'react'

export default function Faqs() {
    const faqsList = [
        {
            q: "What services do you offer at your veterinary clinic?",
            a: "We offer a comprehensive range of services including routine check-ups, vaccinations, dental care, surgery, emergency care, and preventive medicine. Our facility is equipped with modern diagnostic equipment to provide the best care for your pets."
        },
        {
            q: "How do I schedule an appointment?",
            a: "You can easily schedule an appointment through our online booking system, by calling our clinic directly, or by visiting us in person. For emergencies, we recommend calling us immediately for immediate assistance."
        },
        {
            q: "What should I bring to my pet's first appointment?",
            a: "Please bring any previous medical records, vaccination history, and current medications. It's also helpful to have a list of any concerns or questions you'd like to discuss with our veterinarian."
        },
        {
            q: "Do you offer emergency services?",
            a: "Yes, we provide emergency veterinary services during our operating hours. For after-hours emergencies, we have partnerships with local 24-hour emergency animal hospitals and can direct you to the nearest facility."
        },
        {
            q: "What payment methods do you accept?",
            a: "We accept various payment methods including cash, credit cards, and pet insurance. We also offer payment plans for certain treatments to help make veterinary care more accessible for all pet owners."
        }
    ]

    return (
        <section className='py-14 bg-gray-100'>
            <div className="max-w-screen-xl mx-auto px-4 gap-12 md:flex md:px-8">
                <div className='flex-1'>
                    <div className="max-w-lg">
                        <h3 className='font-semibold text-mainHover'>
                            Frequently Asked Questions
                        </h3>
                        <p className='mt-3 text-gray-600 text-3xl font-extrabold sm:text-4xl'>
                            Everything You Need to Know About Our Care
                        </p>
                    </div>
                </div>
                <div className='flex-1 mt-12 md:mt-0'>
                    <ul className='space-y-4 divide-y divide-gray-700'>
                        {faqsList.map((item, idx) => (
                            <li
                                className="py-5"
                                key={idx}>
                                <summary
                                    className="flex items-center justify-between font-semibold text-gray-600">
                                    {item.q}
                                </summary>
                                <p
                                    dangerouslySetInnerHTML={{ __html: item.a }}
                                    className='mt-3 text-gray-500 leading-relaxed'>
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};
