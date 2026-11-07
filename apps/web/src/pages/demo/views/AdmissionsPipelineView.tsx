import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileCheck,
  UserCheck,
  ArrowRight,
  ShieldAlert,
  Phone,
  Mail,
  Filter,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useDemoStore, DemoAdmission, AdmissionStage } from '../../../store/demoStore';
import { CreateAdmissionEnquiryModal } from '../../../components/academic/CreateAdmissionEnquiryModal';
import { StudentFeeFixationModal } from '../../../components/finance/StudentFeeFixationModal';

interface AdmissionsPipelineViewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenStudent360?: (student: any) => void;
}

export const AdmissionsPipelineView: React.FC<AdmissionsPipelineViewProps> = ({
  onNavigateTab,
  onOpenStudent360,
}) => {
  const {
    admissions,
    updateAdmissionStage,
    confirmAdmissionAndActivate,
    studentFeeFixations,
    students,
    tenantScope,
  } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showFixationModal, setShowFixationModal] = useState(false);
  const [selectedAdmissionForFixation, setSelectedAdmissionForFixation] = useState<DemoAdmission | null>(null);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  // Compute counts
  const totalCount = admissions.length;
  const enquiryCount = admissions.filter((a) => a.stage === 'ENQUIRY').length;
  const reviewCount = admissions.filter((a) =>
    ['APPLICATION_STARTED', 'SUBMITTED', 'DOCUMENT_VERIFICATION', 'UNDER_REVIEW'].includes(a.stage || '')
  ).length;
  const approvedCount = admissions.filter((a) => a.stage === 'APPROVED' || a.status === 'APPROVED').length;
  const confirmedCount = admissions.filter(
    (a) => a.stage === 'ADMISSION_CONFIRMED' || a.status === 'CONFIRMED'
  ).length;

  const filteredAdmissions = admissions.filter((adm) => {
    const matchesSearch =
      adm.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.parent_phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (selectedStageFilter === 'ALL') return true;
    if (selectedStageFilter === 'ENQUIRY') return adm.stage === 'ENQUIRY';
    if (selectedStageFilter === 'REVIEW')
      return ['APPLICATION_STARTED', 'SUBMITTED', 'DOCUMENT_VERIFICATION', 'UNDER_REVIEW'].includes(
        adm.stage || ''
      );
    if (selectedStageFilter === 'APPROVED')
      return adm.stage === 'APPROVED' || (adm.status === 'APPROVED' && adm.stage !== 'ADMISSION_CONFIRMED');
    if (selectedStageFilter === 'CONFIRMED')
      return adm.stage === 'ADMISSION_CONFIRMED' || adm.status === 'CONFIRMED';
    return true;
  });

  const handleConfirmAdmission = (admissionId: string) => {
    const res = confirmAdmissionAndActivate(admissionId);
    setCelebrationToast(
      `🎉 Admission Confirmed! Generated ${res.admissionNumber}. Student activated across SIS, Attendance and Fees.`
    );
    setTimeout(() => {
      setCelebrationToast(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast */}
      {celebrationToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{celebrationToast}</span>
          </div>
          <button
            onClick={() => onNavigateTab('students')}
            className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>View in Student SIS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            Centralized Admission Funnel
          </div>
          <h1 className="text-2xl font-black text-slate-900">Admissions Pipeline & Approvals</h1>
          <p className="text-xs text-slate-600 mt-1">
            Track prospective student applications from initial enquiry to verification, approval, and final SIS enrollment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEnquiryModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + New Admission Enquiry
          </button>
        </div>
      </div>

      {/* 5 Stage Metric Stock Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedStageFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStageFilter === 'ALL'
              ? 'bg-blue-50/80 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Pipeline</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">All applications</span>
        </button>

        <button
          onClick={() => setSelectedStageFilter('ENQUIRY')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStageFilter === 'ENQUIRY'
              ? 'bg-amber-50/80 border-amber-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">1. Enquiries</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{enquiryCount}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Prospect interest</span>
        </button>

        <button
          onClick={() => setSelectedStageFilter('REVIEW')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStageFilter === 'REVIEW'
              ? 'bg-blue-50/80 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">2. In Verification</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{reviewCount}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Document review</span>
        </button>

        <button
          onClick={() => setSelectedStageFilter('APPROVED')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStageFilter === 'APPROVED'
              ? 'bg-purple-50/80 border-purple-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">3. Approved</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{approvedCount}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Ready for admission</span>
        </button>

        <button
          onClick={() => setSelectedStageFilter('CONFIRMED')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStageFilter === 'CONFIRMED'
              ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">4. Enrolled (SIS)</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{confirmedCount}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Active student masters</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by applicant, phone, or application #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">Stage:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ENQUIRY', label: 'Enquiries' },
            { id: 'REVIEW', label: 'Verification & Review' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'CONFIRMED', label: 'Confirmed (Active)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedStageFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedStageFilter === f.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredAdmissions.length > 0 ? (
        <div className="space-y-3">
          {filteredAdmissions.map((adm) => {
            const isConfirmed = adm.stage === 'ADMISSION_CONFIRMED' || adm.status === 'CONFIRMED';
            const isApproved = (adm.stage === 'APPROVED' || adm.status === 'APPROVED') && !isConfirmed;
            const isUnderReview = adm.stage === 'UNDER_REVIEW';
            const isVerification = adm.stage === 'DOCUMENT_VERIFICATION' || adm.status === 'VERIFIED';
            const isEnquiry = adm.stage === 'ENQUIRY' || (!adm.stage && adm.status === 'PENDING');

            return (
              <div
                key={adm.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg font-bold">
                      {adm.application_number}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{adm.applicant_name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                      {adm.target_class}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                      {adm.level}
                    </span>
                    {adm.source && (
                      <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        Source: {adm.source}
                      </span>
                    )}
                    {(() => {
                      const fix = studentFeeFixations.find(
                        (f) => (f.admission_id === adm.id || f.student_name.toLowerCase() === adm.applicant_name.toLowerCase()) && f.status === 'APPROVED'
                      );
                      if (fix) {
                        return (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Agreed Fee: ₹{fix.final_annual_payable.toLocaleString()} (-₹{fix.total_concession_amount.toLocaleString()} {fix.concession_category})
                          </span>
                        );
                      }
                      return (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[10px]">
                          Std Fee: {adm.target_class.includes('PUC') ? '₹65,000' : '₹50,000'}
                        </span>
                      );
                    })()}
                  </div>

                  {/* 5-Step Stage Tracker Visualizer */}
                  <div className="flex items-center gap-1 pt-1">
                    {[
                      { step: 1, label: 'Enquiry', active: true },
                      { step: 2, label: 'Form & Docs', active: !isEnquiry },
                      { step: 3, label: 'Review', active: isUnderReview || isApproved || isConfirmed },
                      { step: 4, label: 'Approved', active: isApproved || isConfirmed },
                      { step: 5, label: 'Confirmed', active: isConfirmed },
                    ].map((st, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                            st.active
                              ? isConfirmed && st.step === 5
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <span>{st.step}.</span>
                          <span>{st.label}</span>
                        </div>
                        {i < 4 && <span className="text-slate-300 text-[10px]">→</span>}
                      </div>
                    ))}
                  </div>

                  <p className="text-slate-500 text-xs">
                    Parent: <strong className="text-slate-700">{adm.parent_name}</strong> • Phone:{' '}
                    <strong className="text-slate-700">{adm.parent_phone}</strong> • Submitted:{' '}
                    {adm.submission_date}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!isConfirmed && (
                    <button
                      onClick={() => {
                        setSelectedAdmissionForFixation(adm);
                        setShowFixationModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Negotiate student fee and record management approved concessions"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Negotiate / Fix Fee</span>
                    </button>
                  )}

                  {isEnquiry && (
                    <button
                      onClick={() => updateAdmissionStage(adm.id, 'DOCUMENT_VERIFICATION')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Process Application Form →
                    </button>
                  )}

                  {isVerification && (
                    <button
                      onClick={() => updateAdmissionStage(adm.id, 'UNDER_REVIEW')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Verify Documents & Review →
                    </button>
                  )}

                  {isUnderReview && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateAdmissionStage(adm.id, 'APPROVED')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        ✓ Approve Application
                      </button>
                      <button
                        onClick={() => updateAdmissionStage(adm.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => handleConfirmAdmission(adm.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      🎓 Confirm Admission & Activate Student
                    </button>
                  )}

                  {isConfirmed && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Active in Student SIS
                      </span>
                      <button
                        onClick={() => onNavigateTab('students')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Open SIS Directory →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Admission Applications Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {tenantScope === 'akshara-trial' || tenantScope === 'pilot-clean'
                ? 'Your pilot admissions pipeline is ready for authentic student applications. Register your first admission enquiry to begin the lifecycle.'
                : 'No applicants matched your search and stage filter criteria.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Register First Admission Enquiry
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateAdmissionEnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
      />

      <StudentFeeFixationModal
        isOpen={showFixationModal}
        targetAdmission={selectedAdmissionForFixation}
        onClose={() => {
          setShowFixationModal(false);
          setSelectedAdmissionForFixation(null);
        }}
      />
    </div>
  );
};
