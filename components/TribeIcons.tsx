import React from 'react';

export const TribeSanctumIcon = ({ size = 24, className = '', active = false }) => {
    const mainColor = active ? '#EAB308' : '#6B21A8'; // Yellow when active, Purple when inactive
    const accentColor = active ? '#6B21A8' : '#EAB308';

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none">
            {/* Tribal Shield */}
            <path d="M50 10 L85 25 L85 60 L50 90 L15 60 L15 25 Z" stroke={mainColor} strokeWidth="8" strokeLinejoin="round" />
            <path d="M50 10 L50 90" stroke={mainColor} strokeWidth="6" />
            <path d="M25 40 L40 55 L25 70" stroke={accentColor} strokeWidth="7" strokeLinejoin="round" />
            <path d="M75 40 L60 55 L75 70" stroke={accentColor} strokeWidth="7" strokeLinejoin="round" />
            <circle cx="50" cy="55" r="7" fill={accentColor} />
        </svg>
    );
};

export const TribeLoungeIcon = ({ size = 24, className = '', active = false }) => {
    const mainColor = active ? '#EAB308' : '#6B21A8';
    const accentColor = active ? '#6B21A8' : '#EAB308';

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none">
            {/* Tribal Campfire / Teepee */}
            <path d="M20 80 L80 80" stroke={mainColor} strokeWidth="8" strokeLinecap="round" />
            <path d="M30 80 L50 20 L70 80" stroke={mainColor} strokeWidth="8" strokeLinejoin="round" />
            <path d="M40 80 L50 50 L60 80" stroke={accentColor} strokeWidth="7" strokeLinejoin="round" />
            <circle cx="50" cy="35" r="7" fill={accentColor} />
            <path d="M20 40 L35 45" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <path d="M80 40 L65 45" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
        </svg>
    );
};

export const TribeKitchenIcon = ({ size = 24, className = '', active = false }) => {
    const mainColor = active ? '#EAB308' : '#6B21A8';
    const accentColor = active ? '#6B21A8' : '#EAB308';

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none">
            {/* Tribal Bowl / Food */}
            <path d="M15 55 C15 85 85 85 85 55 Z" stroke={mainColor} strokeWidth="8" strokeLinejoin="round" />
            <path d="M10 55 L90 55" stroke={mainColor} strokeWidth="8" strokeLinecap="round" />

            {/* Taco/Steam elements */}
            <path d="M30 55 C30 30 70 30 70 55" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            <path d="M40 20 L40 28 M50 15 L50 28 M60 20 L60 28" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />

            {/* Bowl decorations */}
            <path d="M35 65 L45 75 L55 65 L65 75" stroke={accentColor} strokeWidth="6" strokeLinejoin="round" />
        </svg>
    );
};

export const TribeCirclesIcon = ({ size = 24, className = '', active = false }) => {
    const mainColor = active ? '#EAB308' : '#6B21A8';
    const accentColor = active ? '#6B21A8' : '#EAB308';

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none">
            {/* Tribal Mandala / Circles */}
            <circle cx="50" cy="50" r="28" stroke={mainColor} strokeWidth="8" />
            <circle cx="50" cy="50" r="14" stroke={accentColor} strokeWidth="7" />

            {/* Outer rays */}
            <path d="M50 10 L50 22 M50 78 L50 90 M10 50 L22 50 M78 50 L90 50" stroke={mainColor} strokeWidth="8" strokeLinecap="round" />

            {/* Inner dots/rays */}
            <path d="M25 25 L33 33 M75 75 L67 67 M25 75 L33 67 M75 25 L67 33" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            <circle cx="50" cy="50" r="6" fill={mainColor} />
        </svg>
    );
};
