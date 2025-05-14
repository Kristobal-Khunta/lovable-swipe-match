
import { createContext } from 'react';
import { AppContextType } from './types';

// Create the context with undefined as default value
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Export components and hooks
export { AppProvider } from './AppProvider';
export { useApp } from './useApp';
