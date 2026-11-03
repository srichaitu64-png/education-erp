import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  Sparkles,
  Building2,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

interface FeatureItem {
  id: string;
  name: string;
  module: string;
  category: string;
  description: string;
  min_plan_tier: number;
}

interface TenantItem {
  id: string;
  name: string;
  code: string;
  institution_type: string;
  status: string;
}

export const EntitlementsManager: React.FC = () => {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [overrideModal, setOverrideModal] = useState<{
    feature: FeatureItem | null;
    status: 'ALLOW' | 'DENY';
    reason: string;
    days: number;
  }>({ feature: null, status: 'ALLOW', reason: '', days: 30 });

  const loadData = async () => {
    setLoading(true);
    try {
      const [featRes, tenantRes] = await Promise.all([
        api.get('/platform/features'),
        api.get('/platform/tenants'),
      ]);
      setFeatures(featRes.data);
      setTenants(tenantRes.data);
      if (tenantRes.data.length > 0 && !selectedTenantId) {
        setSelectedTenantId(tenantRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load platform entitlements data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyOverride = async () => {
    if (!overrideModal.feature || !selectedTenantId) return;

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + overrideModal.days);

      await api.post('/platform/entitlements/override', {
        tenant_id: selectedTenantId,
        feature_id: overrideModal.feature.id,
        override_status: overrideModal.status,
        reason: overrideModal.reason || 'Super Admin Administrative Action',
        expires_at: expiresAt.toISOString(),
      });

      alert(`Success: ${overrideModal.status} override applied to ${overrideModal.feature.name} for ${overrideModal.days} days!`);
      setOverrideModal({ feature: null, status: 'ALLOW', reason: '', days: 30 });
      loadData();
    } catch (err: any) {
      alert(`Error applying override: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleRevokeOverride = async (featureId: string) => {
    if (!selectedTenantId) return;
    try {
      await api.post('/platform/entitlements/revoke', {
        tenant_id: selectedTenantId,
        feature_id: featureId,
      });
      alert('Override revoked successfully.');
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const filteredFeatures = features.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'ALL' || f.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const modules = Array.from(new Set(features.map((f) => f.module)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Lock className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">Subscription Entitlement & Feature Locking Engine</h2>
          </div>
          <p className="text-sm text-gray-500">
            Control platform module locks, plan entitlements, and apply institution-specific temporary overrides.
          </p>
        </div>

        {/* Tenant Selector */}
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-blue-500"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
          <button
            onClick={loadData}
            title="Refresh Catalog"
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search features by name, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
          >
            <option value="ALL">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feat) => {
          const tierNames = ['Trial', 'Starter', 'Standard', 'Professional', 'Premium', 'Enterprise'];
          const requiredPlan = tierNames[feat.min_plan_tier] || 'Enterprise';

          return (
            <div
              key={feat.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-gray-400 truncate">{feat.id}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {requiredPlan}
                  </span>
                </div>
                <h4 className="font-bold text-base text-gray-900 mb-1">{feat.name}</h4>
                <p className="text-xs text-gray-500 mb-4">{feat.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400 font-medium">{feat.category}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setOverrideModal({
                        feature: feat,
                        status: 'ALLOW',
                        reason: 'Promotional Trial Override',
                        days: 30,
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    <Unlock className="w-3 h-3" />
                    Unlock
                  </button>

                  <button
                    onClick={() =>
                      setOverrideModal({
                        feature: feat,
                        status: 'DENY',
                        reason: 'Emergency Administrative Restriction',
                        days: 30,
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <Lock className="w-3 h-3" />
                    Lock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Override Modal */}
      {overrideModal.feature && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              {overrideModal.status === 'ALLOW' ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Unlock className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Apply {overrideModal.status} Override
                </h3>
                <p className="text-xs text-gray-500">{overrideModal.feature.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Override Reason</label>
                <input
                  type="text"
                  value={overrideModal.reason}
                  onChange={(e) => setOverrideModal({ ...overrideModal, reason: e.target.value })}
                  placeholder="e.g. 30-Day Evaluation Trial requested by Principal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={overrideModal.days}
                  onChange={(e) => setOverrideModal({ ...overrideModal, days: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setOverrideModal({ feature: null, status: 'ALLOW', reason: '', days: 30 })}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOverride}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

