'use client'

import Image from 'next/image'
import React from 'react'

interface InfoCardProps {
    title: string;
    description: string;
    iconSrc: string; 
    accentColor: string; 
    // Menggunakan kelas khusus untuk menyesuaikan ukuran grid di page.tsx
    className?: string; 
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, iconSrc, accentColor, className }) => (
    // Struktur Blok Kaku: Border tebal primary, latar belakang light/white.
    // Shadow Keras (Hard Shadow) diterapkan pada hover untuk Neo-Brutalism
    <div 
        className={`
            border-2 border-[var(--color-primary)] p-6 bg-[var(--color-light)] space-y-3 flex flex-col items-start 
            transition-all duration-150 hover:shadow-[4px_4px_0px_0px_var(--color-primary)] cursor-default
            ${className}
        `}
    >
        {/* Kontainer Ikon: Warna aksen cerah, border tebal, Shadow Keras. 
            Menggunakan warna primer untuk border dan shadow.
        */}
        <div 
            style={{ backgroundColor: accentColor }}
            className={`w-14 h-14 border-2 border-[var(--color-primary)] p-2 flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-primary)]`}
        >
            {/* Placeholder Image Halftone. */}
            <Image 
                src={iconSrc} 
                alt={title} 
                width={32} 
                height={32} 
                className="w-8 h-8 object-contain"
            />
        </div>
        
        <h3 className="text-xl font-bold text-[var(--color-primary)]">{title}</h3>
        {/* Menggunakan font-sans untuk body text agar ramah pengguna umum */}
        <p className="text-[var(--color-primary)]/90 text-sm leading-normal font-sans">
            {description}
        </p>
    </div>
);

export default InfoCard;
