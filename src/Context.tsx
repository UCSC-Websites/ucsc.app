import {createContext} from 'react';

export interface ContextType {
    mobile: boolean | undefined;
    isDrawerOpen: boolean;
    setDrawerOpen: (value: boolean) => void;
    desktopMenuHeight: number;
    setDesktopMenuHeight: (value: number) => void;
	theme: string;
	setTheme: (value: string | ((prev: string) => string)) => void;
    selectedDateOffset: number;
    setSelectedDateOffset: (offset: number) => void;
}

export const Context = createContext<ContextType | null>(null);