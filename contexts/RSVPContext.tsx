import React, { createContext, useContext, useState, useCallback } from 'react';

interface RSVPContextType {
    rsvpEvents: Set<string>;
    toggleRSVP: (eventId: string) => void;
    isRSVPed: (eventId: string) => boolean;
    getRSVPCount: () => number;
    getRSVPIds: () => string[];
}

const RSVPContext = createContext<RSVPContextType | undefined>(undefined);

export const RSVPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [rsvpEvents, setRsvpEvents] = useState<Set<string>>(new Set());

    const toggleRSVP = useCallback((eventId: string) => {
        setRsvpEvents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    }, []);

    const isRSVPed = useCallback((eventId: string) => {
        return rsvpEvents.has(eventId);
    }, [rsvpEvents]);

    const getRSVPCount = useCallback(() => {
        return rsvpEvents.size;
    }, [rsvpEvents]);

    const getRSVPIds = useCallback(() => {
        return Array.from(rsvpEvents);
    }, [rsvpEvents]);

    return (
        <RSVPContext.Provider value={{ rsvpEvents, toggleRSVP, isRSVPed, getRSVPCount, getRSVPIds }}>
            {children}
        </RSVPContext.Provider>
    );
};

export const useRSVP = (): RSVPContextType => {
    const context = useContext(RSVPContext);
    if (!context) {
        throw new Error('useRSVP must be used within an RSVPProvider');
    }
    return context;
};
