/**
 * Face Model Provider
 *
 * React Context provider for face-api.js model loading state.
 * Manages model initialization and exposes loading status to components.
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { loadFaceModels } from './modelLoader';

// Model loading state interface
export interface ModelLoadingState {
  modelsLoaded: boolean;
  loading: boolean;
  error: string | null;
}

// Context value interface
interface ModelContextValue extends ModelLoadingState {
  reloadModels: () => Promise<void>;
}

// Create context
const ModelContext = createContext<ModelContextValue | undefined>(undefined);

// Provider props
interface ModelProviderProps {
  children: ReactNode;
  autoLoad?: boolean;
}

/**
 * Face Model Provider Component
 *
 * Wraps the application to provide model loading state.
 * Automatically loads models on mount unless autoLoad is false.
 */
export function ModelProvider({
  children,
  autoLoad = true,
}: ModelProviderProps) {
  const [state, setState] = useState<ModelLoadingState>({
    modelsLoaded: false,
    loading: false,
    error: null,
  });

  // Load models function - wrapped in useCallback for stable reference
  const loadModels = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await loadFaceModels();
      setState({ modelsLoaded: true, loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load models';
      console.error('Model loading error:', errorMessage);
      setState({ modelsLoaded: false, loading: false, error: errorMessage });
    }
  }, []);

  // Auto-load models on mount
  useEffect(() => {
    if (autoLoad) {
      // Use a separate async function to avoid calling setState directly in effect
      const initModels = async () => {
        await loadModels();
      };
      initModels();
    }
  }, [autoLoad, loadModels]);

  const contextValue: ModelContextValue = {
    ...state,
    reloadModels: loadModels,
  };

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
}

/**
 * Hook to access model loading state
 *
 * @throws Error if used outside ModelProvider
 * @returns Model loading state and reload function
 */
export function useModelLoader(): ModelContextValue {
  const context = useContext(ModelContext);

  if (context === undefined) {
    throw new Error('useModelLoader must be used within a ModelProvider');
  }

  return context;
}
