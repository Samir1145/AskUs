import React, { createContext, useContext, useState, useCallback } from 'react';

interface JoinedGroupsContextType {
    joinedGroups: Set<string>;
    toggleJoin: (groupId: string) => void;
    isJoined: (groupId: string) => boolean;
    getJoinedCount: () => number;
    getJoinedIds: () => string[];
}

const JoinedGroupsContext = createContext<JoinedGroupsContextType | undefined>(undefined);

export const JoinedGroupsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());

    const toggleJoin = useCallback((groupId: string) => {
        setJoinedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    }, []);

    const isJoined = useCallback((groupId: string) => {
        return joinedGroups.has(groupId);
    }, [joinedGroups]);

    const getJoinedCount = useCallback(() => {
        return joinedGroups.size;
    }, [joinedGroups]);

    const getJoinedIds = useCallback(() => {
        return Array.from(joinedGroups);
    }, [joinedGroups]);

    return (
        <JoinedGroupsContext.Provider value={{ joinedGroups, toggleJoin, isJoined, getJoinedCount, getJoinedIds }}>
            {children}
        </JoinedGroupsContext.Provider>
    );
};

export const useJoinedGroups = (): JoinedGroupsContextType => {
    const context = useContext(JoinedGroupsContext);
    if (!context) {
        throw new Error('useJoinedGroups must be used within a JoinedGroupsProvider');
    }
    return context;
};
