'use client'
import { useState } from 'react';
import { RehomingPetForm } from './RehomingPetForm';

export function RehomingPetFormWrapper() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <RehomingPetForm onClose={() => setIsOpen(false)} />
    );
} 