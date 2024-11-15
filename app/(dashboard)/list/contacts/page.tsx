import HeroSection from '@/app/components/front/ContactHero'
import ContactNumbers from '@/app/components/front/ContactInfo'
import ContactMap from '@/app/components/front/Map'
import React, { ReactNode } from 'react'

export default function Contact() {
    return (
        <div>
            <HeroSection/>
            <ContactMap/>
            <ContactNumbers/>
        </div>  
    )
}
