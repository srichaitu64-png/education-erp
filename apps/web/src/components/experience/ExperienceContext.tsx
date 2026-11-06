import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AtmosphereType,
  CelebrationEvent,
  CelebrationType,
  ErrorEvent,
  ErrorSeverity,
  ExperienceContextValue,
  ExperienceSettings,
} from './experience.types';
import { DEFAULT_EXPERIENCE_SETTINGS, STORAGE_KEY } from './experience.config';

export const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings from localStorage
  const [settings, setSettings] = useState<ExperienceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_EXPERIENCE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load experience settings from localStorage', e);
    }
    return DEFAULT_EXPERIENCE_SETTINGS;
  });

  const [activeAtmosphere, setActiveAtmosphereState] = useState<AtmosphereType>(settings.atmosphere);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [activeCelebration, setActiveCelebration] = useState<CelebrationEvent | null>(null);
  const [activeError, setActiveError] = useState<ErrorEvent | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save experience settings to localStorage', e);
    }
  }, [settings]);

  // Listen to system reduced-motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const setAtmosphere = useCallback((atmosphere: AtmosphereType) => {
    setActiveAtmosphereState(atmosphere);
  }, []);

  const updateSettings = useCallback((partial: Partial<ExperienceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      if (partial.atmosphere && partial.atmosphere !== prev.atmosphere) {
        setActiveAtmosphereState(partial.atmosphere);
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_EXPERIENCE_SETTINGS);
    setActiveAtmosphereState(DEFAULT_EXPERIENCE_SETTINGS.atmosphere);
  }, []);

  const triggerCelebration = useCallback(
    (type: CelebrationType, details?: { title?: string; subtitle?: string; durationMs?: number }) => {
      if (!settings.celebrationsEnabled || isReducedMotion) return;

      const event: CelebrationEvent = {
        id: `cel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type,
        title: details?.title || 'Operation Confirmed Successfully',
        subtitle: details?.subtitle,
        timestamp: Date.now(),
        durationMs: details?.durationMs || 2800,
      };

      setActiveCelebration(event);

      // Automatically clear after duration
      setTimeout(() => {
        setActiveCelebration((current) => (current?.id === event.id ? null : current));
      }, event.durationMs);
    },
    [settings.celebrationsEnabled, isReducedMotion]
  );

  const clearCelebration = useCallback(() => {
    setActiveCelebration(null);
  }, []);

  const triggerError = useCallback(
    (
      severity: ErrorSeverity,
      title: string,
      message: string,
      options?: { recoveryActionLabel?: string; onRecover?: () => void }
    ) => {
      if (!settings.errorExpressionsEnabled) return;

      const event: ErrorEvent = {
        id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        severity,
        title,
        message,
        recoveryActionLabel: options?.recoveryActionLabel,
        onRecover: options?.onRecover,
        timestamp: Date.now(),
      };

      setActiveError(event);

      // Auto dismiss Level 1 after 4s
      if (severity === 'level-1-info') {
        setTimeout(() => {
          setActiveError((cur) => (cur?.id === event.id ? null : cur));
        }, 4000);
      }
    },
    [settings.errorExpressionsEnabled]
  );

  const clearError = useCallback(() => {
    setActiveError(null);
  }, []);

  const openSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      settings,
      activeAtmosphere,
      isReducedMotion,
      activeCelebration,
      activeError,
      setAtmosphere,
      updateSettings,
      resetSettings,
      triggerCelebration,
      clearCelebration,
      triggerError,
      clearError,
      openSettingsModal,
      closeSettingsModal,
      isSettingsModalOpen,
    }),
    [
      settings,
      activeAtmosphere,
      isReducedMotion,
      activeCelebration,
      activeError,
      setAtmosphere,
      updateSettings,
      resetSettings,
      triggerCelebration,
      clearCelebration,
      triggerError,
      clearError,
      openSettingsModal,
      closeSettingsModal,
      isSettingsModalOpen,
    ]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
};

