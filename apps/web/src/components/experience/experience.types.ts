/**
 * Central Natural Experience Engine Types
 * Pure visual atmosphere, interactions, and celebrations with STRICT zero audio.
 */

export type AtmosphereType =
  | 'soap-bubbles'          // Signature: Transparent realistic soap bubbles with iridescent highlights
  | 'gentle-rain'           // Natural light rainfall with subtle droplet drift
  | 'peaceful-snowfall'     // Delicate snowfall with horizontal drift
  | 'spring-breeze'         // Gentle air particles and soft breeze
  | 'flower-petals'         // Floating rose and cherry blossom petals
  | 'butterflies'           // Delicate fluttering butterflies
  | 'floating-leaves'       // Autumn leaves gently tumbling in wind
  | 'underwater-bubbles'    // Effervescent aquatic bubbles rising
  | 'warm-sunlight'         // Soft sunlight rays and floating dust particles
  | 'minimal-professional'  // Very subtle clean ambient light only
  | 'disabled';             // Completely disabled

export type VisualIntensity = 'subtle' | 'balanced' | 'expressive';

export type CelebrationType =
  | 'admission-petals'       // Student admission confirmed: Flower petal shower & gentle bloom
  | 'registration-bubbles'   // Student/Staff registration: Floating iridescent bubbles
  | 'attendance-ripple'      // Attendance submitted: Natural calm green ripple
  | 'fee-golden-light'       // Fee payment confirmed: Warm golden light & fiscal shimmer
  | 'report-document-flow'   // Report generated: Flowing document light & particle gather
  | 'exam-achievement'       // Examination results published: Elegant achievement celebration
  | 'record-saved';          // General entity saved: Gentle upward rising bubbles

export type ErrorSeverity =
  | 'level-1-info'           // Minor: gentle amber/blue pulse
  | 'level-2-validation'     // Validation: soft red outline & gentle field ripple
  | 'level-3-critical';      // Critical operation failure: controlled alert & optional visual emblem (ZERO AUDIO)

export interface CelebrationEvent {
  id: string;
  type: CelebrationType;
  title: string;
  subtitle?: string;
  timestamp: number;
  durationMs?: number;
}

export interface ErrorEvent {
  id: string;
  severity: ErrorSeverity;
  title: string;
  message: string;
  recoveryActionLabel?: string;
  onRecover?: () => void;
  timestamp: number;
}

export interface ExperienceSettings {
  atmosphere: AtmosphereType;
  intensity: VisualIntensity;
  ambientEffectsEnabled: boolean;
  pointerEffectsEnabled: boolean;
  buttonInteractionsEnabled: boolean;
  pageTransitionsEnabled: boolean;
  celebrationsEnabled: boolean;
  errorExpressionsEnabled: boolean;
  enableExpressiveErrorIllustrations: boolean; // Optional Level 3 crest visual (strictly silent)
  customPageAtmospheres: Record<string, AtmosphereType>;
}

export interface PagePersonality {
  id: string;
  name: string;
  category: 'academic' | 'administrative' | 'financial' | 'operations' | 'security' | 'public';
  defaultAtmosphere: AtmosphereType;
  accentColor: string;
  description: string;
}

export interface ExperienceContextValue {
  settings: ExperienceSettings;
  activeAtmosphere: AtmosphereType;
  isReducedMotion: boolean;
  activeCelebration: CelebrationEvent | null;
  activeError: ErrorEvent | null;
  setAtmosphere: (atmosphere: AtmosphereType) => void;
  updateSettings: (partial: Partial<ExperienceSettings>) => void;
  resetSettings: () => void;
  triggerCelebration: (type: CelebrationType, details?: { title?: string; subtitle?: string; durationMs?: number }) => void;
  clearCelebration: () => void;
  triggerError: (severity: ErrorSeverity, title: string, message: string, options?: { recoveryActionLabel?: string; onRecover?: () => void }) => void;
  clearError: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  isSettingsModalOpen: boolean;
}

