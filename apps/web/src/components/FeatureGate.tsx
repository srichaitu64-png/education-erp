import React from 'react';
import { Lock, Sparkles, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface FeatureGateProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  inlineBadge?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureId,
  children,
  fallback,
  inlineBadge = false,
}) => {
  const { entitlements, currentPlan, user } = useAuthStore();

  // Superadmin bypasses for platform preview
  if (user?.is_superadmin) {
    return <>{children}</>;
  }

  const entitlement = entitlements[featureId];

  // If feature is enabled, render children directly
  if (entitlement && entitlement.is_enabled) {
    return <>{children}</>;
  }

  // If inline badge requested (e.g. inside navigation sidebar items)
  if (inlineBadge) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
        <Lock className="w-3 h-3 text-amber-600" />
        {entitlement?.required_plan || 'Premium'}
      </span>
    );
  }

  // Custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Standard Commercial SaaS Feature Lock Card
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center max-w-2xl mx-auto my-6 shadow-sm">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
        <Lock className="w-8 h-8 text-amber-600" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200 mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        Requires {entitlement?.required_plan || 'Higher'} Plan
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {entitlement?.name || 'Premium Commercial Feature'} 🔒
      </h3>

      <p className="text-gray-600 text-sm max-w-lg mx-auto mb-6">
        {entitlement?.description ||
          'This enterprise capability is locked under your current subscription tier.'}
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-md mx-auto text-xs text-gray-500 mb-6 flex items-center justify-between">
        <span>Current Subscription: <strong className="text-gray-800">{currentPlan}</strong></span>
        <span>Eligible Upgrade: <strong className="text-blue-600">{entitlement?.required_plan || 'Enterprise'}</strong></span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={`/dashboard/subscription/upgrade?feature=${featureId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
        >
          Upgrade Subscription
          <ArrowUpRight className="w-4 h-4" />
        </a>
        <a
          href="/contact-sales"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
        >
          Request 30-Day Pilot Trial
        </a>
      </div>
    </div>
  );
};

