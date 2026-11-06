import { useContext, useEffect } from 'react';
import { ExperienceContext } from './ExperienceContext';
import { AtmosphereType, CelebrationType, ErrorSeverity, ExperienceContextValue } from './experience.types';
import { PAGE_PERSONALITIES } from './experience.config';

export const useExperience = (): ExperienceContextValue => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};

/**
 * Activates the specific atmosphere for a given page/tab personality.
 * Automatically restores previous atmosphere on unmount.
 */
export const usePageAtmosphere = (pageId: string) => {
  const { setAtmosphere, settings } = useExperience();

  useEffect(() => {
    // Check if user has a custom override for this page
    const customAtmosphere = settings.customPageAtmospheres?.[pageId];
    if (customAtmosphere) {
      setAtmosphere(customAtmosphere);
      return;
    }

    // Check registry for default personality
    const personality = PAGE_PERSONALITIES[pageId];
    if (personality) {
      setAtmosphere(personality.defaultAtmosphere);
    } else {
      // Fallback to signature soap bubbles
      setAtmosphere(settings.atmosphere || 'soap-bubbles');
    }
  }, [pageId, settings.customPageAtmospheres, settings.atmosphere, setAtmosphere]);
};

/**
 * Hook to trigger confirmed backend success visual celebrations.
 */
export const useSuccessCelebration = () => {
  const { triggerCelebration, clearCelebration } = useExperience();
  return {
    celebrateAdmission: (studentName?: string) =>
      triggerCelebration('admission-petals', {
        title: 'Student Admission Confirmed',
        subtitle: studentName ? `${studentName} enrolled in academic registry` : 'New enrolment created successfully',
      }),
    celebrateRegistration: (title?: string, subtitle?: string) =>
      triggerCelebration('registration-bubbles', {
        title: title || 'Registration Completed',
        subtitle: subtitle || 'Credentials & record provisioned in tenant repository',
      }),
    celebrateAttendance: (dateText?: string) =>
      triggerCelebration('attendance-ripple', {
        title: 'Attendance Successfully Recorded',
        subtitle: dateText ? `Roll recorded for ${dateText}` : 'Biometric & manual records synchronized',
      }),
    celebrateFeePayment: (amountText?: string, receiptNo?: string) =>
      triggerCelebration('fee-golden-light', {
        title: 'Fee Payment Confirmed',
        subtitle: amountText
          ? `Receipt ${receiptNo || 'Issued'} • ${amountText} posted to fiscal ledger`
          : 'Transaction reconciled in institution ledger',
      }),
    celebrateReportGeneration: (reportName?: string) =>
      triggerCelebration('report-document-flow', {
        title: 'Report Generated & Ready',
        subtitle: reportName ? `${reportName} ready for download` : 'Consolidated export compiled',
      }),
    celebrateExamPublication: (examName?: string) =>
      triggerCelebration('exam-achievement', {
        title: 'Examination Results Published',
        subtitle: examName ? `${examName} marksheets released` : 'Official grades posted to student portal',
      }),
    celebrateRecordSaved: (entityName?: string) =>
      triggerCelebration('record-saved', {
        title: 'Record Saved Successfully',
        subtitle: entityName ? `${entityName} updated` : 'Changes persisted to database',
      }),
    celebrateCustom: (type: CelebrationType, title?: string, subtitle?: string) =>
      triggerCelebration(type, { title, subtitle }),
    clearCelebration,
  };
};

/**
 * Hook to trigger multi-level visual error expressions (strictly visual, zero audio).
 */
export const useErrorExpression = () => {
  const { triggerError, clearError } = useExperience();
  return {
    showInfoPulse: (title: string, message: string) =>
      triggerError('level-1-info', title, message),
    showValidationError: (title: string, message: string) =>
      triggerError('level-2-validation', title, message),
    showCriticalError: (
      title: string,
      message: string,
      options?: { recoveryActionLabel?: string; onRecover?: () => void }
    ) => triggerError('level-3-critical', title, message, options),
    clearError,
  };
};

