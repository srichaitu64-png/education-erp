import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck,
  ShieldCheck,
  Percent,
  Calculator,
  ArrowRight,
  Bus,
  Home,
  Plus,
  Trash2,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  useDemoStore,
  DemoStudentFeeFixation,
  DemoStudent,
  DemoAdmission,
} from '../../store/demoStore';

interface StudentFeeFixationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudent?: DemoStudent | null;
  targetAdmission?: DemoAdmission | null;
  onSuccess?: (fixation: DemoStudentFeeFixation) => void;
}

export const StudentFeeFixationModal: React.FC<StudentFeeFixationModalProps> = ({
  isOpen,
  onClose,
  targetStudent,
  targetAdmission,
  onSuccess,
}) => {
  const {
    feeStructures,
    saveStudentFeeFixation,
    currentRole,
    students,
    admissions,
  } = useDemoStore();

  const [studentName, setStudentName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [classOrStream, setClassOrStream] = useState('Class 6');
  const [concessionCategory, setConcessionCategory] = useState('Management Negotiation');
  const [concessionMethod, setConcessionMethod] = useState<'OVERALL_ALLOCATION' | 'HEAD_WISE_ADJUSTMENTS'>('OVERALL_ALLOCATION');
  const [standardAnnualFee, setStandardAnnualFee] = useState<number>(50000);
  const [negotiatedPayable, setNegotiatedPayable] = useState<number>(36000);
  const [reasonRemarks, setReasonRemarks] = useState(
    'Special concession approved under Management Discretionary Quota by Chairman.'
  );

  // Additional charges
  const [transportOpted, setTransportOpted] = useState(false);
  const [hostelOpted, setHostelOpted] = useState(false);
  const [coachingOpted, setCoachingOpted] = useState(false);

  // Head-wise adjustments for Method B
  const [headAdjustments, setHeadAdjustments] = useState([
    { head_code: 'TUITION', title: 'Tuition & Academic Instruction', standard_amount: 30000, concession_amount: 14000 },
    { head_code: 'LABORATORY', title: 'Science & Computer Lab', standard_amount: 7500, concession_amount: 0 },
    { head_code: 'LIBRARY_DEV', title: 'Digital Library & Campus Amenities', standard_amount: 5000, concession_amount: 0 },
    { head_code: 'EXAMINATION', title: 'Assessments & Examinations', standard_amount: 7500, concession_amount: 0 },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Initialize from targets
  useEffect(() => {
    if (targetStudent) {
      setStudentName(`${targetStudent.first_name} ${targetStudent.last_name}`);
      setClassOrStream(targetStudent.class_name || 'Class 6');
      setAcademicYear(targetStudent.academic_year || '2026-2027');
      setTransportOpted(!!targetStudent.is_transport_opted);
      setHostelOpted(!!targetStudent.is_hostel_opted);
    } else if (targetAdmission) {
      setStudentName(targetAdmission.applicant_name);
      setClassOrStream(targetAdmission.target_class || 'Class 6');
    } else if (!studentName) {
      setStudentName('Aarav Sharma');
    }
  }, [targetStudent, targetAdmission]);

  // Update standard fee when class changes
  useEffect(() => {
    const matchingStruct = feeStructures.find(
      (fs) => fs.class_or_stream.toLowerCase().includes(classOrStream.toLowerCase())
    );
    if (matchingStruct) {
      setStandardAnnualFee(matchingStruct.total_annual_fee);
      // Update head adjustments template
      setHeadAdjustments(
        matchingStruct.fee_heads.map((h) => ({
          head_code: h.head_code,
          title: h.title,
          standard_amount: h.amount,
          concession_amount: 0,
        }))
      );
    } else {
      const isPu = classOrStream.includes('PUC');
      const std = isPu ? 65000 : classOrStream === 'Class 6' ? 50000 : 55000;
      setStandardAnnualFee(std);
      setHeadAdjustments([
        { head_code: 'TUITION', title: 'Tuition & Academic Instruction', standard_amount: Math.round(std * 0.6), concession_amount: 0 },
        { head_code: 'LABORATORY', title: 'Science & Computer Lab', standard_amount: Math.round(std * 0.15), concession_amount: 0 },
        { head_code: 'LIBRARY_DEV', title: 'Digital Library & Amenities', standard_amount: Math.round(std * 0.10), concession_amount: 0 },
        { head_code: 'EXAMINATION', title: 'Assessments & Examinations', standard_amount: Math.round(std * 0.15), concession_amount: 0 },
      ]);
    }
  }, [classOrStream, feeStructures]);

  if (!isOpen) return null;

  // Additional charges calculation
  const additionalChargesList = [
    ...(transportOpted ? [{ charge_code: 'TRANSPORT', title: 'Campus Bus Transport Fleet Service', category: 'TRANSPORT', amount: 12000 }] : []),
    ...(hostelOpted ? [{ charge_code: 'HOSTEL', title: 'Cauvery Hostel & Dining Mess', category: 'HOSTEL', amount: 25000 }] : []),
    ...(coachingOpted ? [{ charge_code: 'COACHING', title: 'Advanced Foundation Coaching Package', category: 'ACADEMIC', amount: 10000 }] : []),
  ];
  const additionalChargesTotal = additionalChargesList.reduce((acc, c) => acc + c.amount, 0);

  // Concession & Net calculation
  let totalConcession = 0;
  let finalBasePayable = standardAnnualFee;

  if (concessionMethod === 'OVERALL_ALLOCATION') {
    finalBasePayable = Math.max(0, Math.min(standardAnnualFee, negotiatedPayable));
    totalConcession = Math.max(0, standardAnnualFee - finalBasePayable);
  } else {
    totalConcession = headAdjustments.reduce((acc, h) => acc + (h.concession_amount || 0), 0);
    finalBasePayable = Math.max(0, standardAnnualFee - totalConcession);
  }

  const finalTotalPayable = finalBasePayable + additionalChargesTotal;

  // Compute head breakdown
  const computedHeadAllocations = headAdjustments.map((h, idx) => {
    let conc = 0;
    if (concessionMethod === 'HEAD_WISE_ADJUSTMENTS') {
      conc = h.concession_amount || 0;
    } else {
      // Allocate overall concession: prioritize Tuition first
      if (h.head_code === 'TUITION') {
        conc = Math.min(totalConcession, h.standard_amount * 0.9);
      } else {
        const remainingAfterTuition = Math.max(0, totalConcession - Math.min(totalConcession, (headAdjustments.find(x => x.head_code === 'TUITION')?.standard_amount || 0) * 0.9));
        conc = Math.min(remainingAfterTuition, h.standard_amount * 0.5);
      }
    }
    const finalPay = Math.max(0, h.standard_amount - conc);
    return {
      head_code: h.head_code,
      title: h.title,
      standard_amount: h.standard_amount,
      concession_amount: conc,
      final_payable: finalPay,
    };
  });

  // Term Installments (40%, 35%, 25%)
  const termInstallments = [
    {
      term_code: 'TERM_1',
      name: 'Term 1 (June-Aug)',
      due_date: '2026-06-30',
      share_pct: 40,
      amount: Math.round(finalTotalPayable * 0.40),
    },
    {
      term_code: 'TERM_2',
      name: 'Term 2 (Sep-Nov)',
      due_date: '2026-11-15',
      share_pct: 35,
      amount: Math.round(finalTotalPayable * 0.35),
    },
    {
      term_code: 'TERM_3',
      name: 'Term 3 (Dec-Feb)',
      due_date: '2027-01-31',
      share_pct: 25,
      amount: finalTotalPayable - Math.round(finalTotalPayable * 0.40) - Math.round(finalTotalPayable * 0.35),
    },
  ];

  const handleHeadConcessionChange = (code: string, valStr: string) => {
    const val = Math.max(0, parseFloat(valStr) || 0);
    setHeadAdjustments((prev) =>
      prev.map((h) => (h.head_code === code ? { ...h, concession_amount: Math.min(val, h.standard_amount) } : h))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentName.trim()) {
      setErrorMsg('Student or applicant name is required.');
      return;
    }

    const createdFixation = saveStudentFeeFixation({
      student_id: targetStudent?.id,
      admission_id: targetAdmission?.id,
      student_name: studentName.trim(),
      admission_number: targetStudent?.admission_number,
      academic_year: academicYear,
      class_or_stream: classOrStream,
      standard_annual_fee: standardAnnualFee,
      total_concession_amount: totalConcession,
      concession_category: concessionCategory,
      concession_method: concessionMethod,
      final_annual_payable: finalTotalPayable,
      head_allocations: computedHeadAllocations,
      additional_charges: additionalChargesList,
      term_installments: termInstallments,
      reason_remarks: reasonRemarks,
      status: 'APPROVED',
      created_by_name: currentRole === 'CHAIRMAN_DIRECTOR' ? 'Chairman & Managing Trustee' : 'Dr. Ramesh Kumar (Principal)',
      approved_by_name: currentRole === 'CHAIRMAN_DIRECTOR' ? 'Chairman & Managing Trustee' : 'Chairman & Managing Trustee',
      approved_at: new Date().toISOString(),
    });

    setSuccessToast(
      `✓ Agreement Saved! Fixed ₹${finalTotalPayable.toLocaleString()} (Concession: ₹${totalConcession.toLocaleString()}) for ${studentName}.`
    );

    if (onSuccess) {
      onSuccess(createdFixation);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#172B4D] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">Management Student Fee Fixation & Concession Calculator</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase">
                  Institutional Negotiation Protocol
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Fix approved negotiated fees, student-specific concessions and payment installments without altering standard institutional fee master
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 font-bold ml-2">✕</button>
            </div>
          )}

          {successToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Student & Class Profile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Student / Applicant Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
              >
                <option value="2026-2027">2026-2027 (Current)</option>
                <option value="2027-2028">2027-2028 (Upcoming)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enrolled Class / Stream</label>
              <select
                value={classOrStream}
                onChange={(e) => setClassOrStream(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
              >
                <option value="Class 6">Class 6 (Middle School - ₹50,000 Standard)</option>
                <option value="Class 10">Class 10 (Secondary - ₹55,000 Standard)</option>
                <option value="I PUC - PCMB">I PUC - PCMB (Integrated - ₹65,000 Standard)</option>
                <option value="II PUC - PCMC">II PUC - PCMC (Integrated - ₹65,000 Standard)</option>
              </select>
            </div>
          </div>

          {/* Pricing Protocol & Method Switcher */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Standard vs Negotiated Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
              <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                Standard Institutional Master Baseline
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ₹{standardAnnualFee.toLocaleString()}
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Official Fee Master for {classOrStream}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[10px] inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Master Untouched
                  </span>
                </div>
              </div>
            </div>

            {/* Negotiation Category */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                Approved Concession Category
              </span>
              <select
                value={concessionCategory}
                onChange={(e) => setConcessionCategory(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
              >
                <option value="Management Negotiation">Management Negotiation (Chairman Discretion)</option>
                <option value="Merit Scholarship">Merit Scholarship (Board Distinction &gt; 95%)</option>
                <option value="Sibling Discount">Sibling Concession (Elder sibling studying on campus)</option>
                <option value="Staff Concession">Institutional Staff Ward Concession</option>
                <option value="Sports Quota">State / National Sports Quota Scholarship</option>
                <option value="Financial Hardship">Financial Hardship / EWS Support</option>
              </select>
            </div>
          </div>

          {/* Method Selection Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-black text-slate-800 uppercase tracking-wider text-xs">
                Select Concession Fixation Method
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setConcessionMethod('OVERALL_ALLOCATION')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    concessionMethod === 'OVERALL_ALLOCATION'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Method A: Overall Negotiated Total
                </button>
                <button
                  type="button"
                  onClick={() => setConcessionMethod('HEAD_WISE_ADJUSTMENTS')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    concessionMethod === 'HEAD_WISE_ADJUSTMENTS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Method B: Head-Wise Adjustments
                </button>
              </div>
            </div>

            {/* METHOD A: OVERALL NEGOTIATION */}
            {concessionMethod === 'OVERALL_ALLOCATION' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Agreed Annual Final Payable (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={standardAnnualFee}
                        value={negotiatedPayable}
                        onChange={(e) => setNegotiatedPayable(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-lg text-slate-900 font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Example: Enter ₹36,000 agreed with parent (Original: ₹50,000)
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Calculated Concession Discount (₹)
                    </label>
                    <div className="p-2.5 bg-white border border-emerald-300 rounded-xl font-black text-lg text-emerald-600 font-mono">
                      ₹{totalConcession.toLocaleString()} ({Math.round((totalConcession / standardAnnualFee) * 100)}% Discount)
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Controlled allocation automatically deducts first from Tuition, keeping other heads compliant.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD B: HEAD-WISE ADJUSTMENTS */}
            {concessionMethod === 'HEAD_WISE_ADJUSTMENTS' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-[11px] text-slate-600">
                  Enter custom concession discount against individual institutional fee heads:
                </p>
                <div className="space-y-2">
                  {headAdjustments.map((h) => (
                    <div key={h.head_code} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="col-span-5">
                        <span className="font-bold text-slate-900 block">{h.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Code: {h.head_code}</span>
                      </div>
                      <div className="col-span-2 text-right font-mono font-bold text-slate-600">
                        ₹{h.standard_amount.toLocaleString()}
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          max={h.standard_amount}
                          value={h.concession_amount}
                          onChange={(e) => handleHeadConcessionChange(h.head_code, e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-lg text-right font-mono font-bold text-rose-600"
                          placeholder="Concession"
                        />
                      </div>
                      <div className="col-span-2 text-right font-mono font-black text-emerald-700">
                        ₹{Math.max(0, h.standard_amount - (h.concession_amount || 0)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional Campus Services & Additional Charges */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Additional Student-Specific Charges & Optional Services
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                transportOpted ? 'bg-amber-50 border-amber-300 shadow-xs' : 'bg-white border-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={transportOpted}
                  onChange={(e) => setTransportOpted(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                    <Bus className="w-3.5 h-3.5 text-amber-600" /> Bus Transport
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">+₹12,000 / year (Route 104)</span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                hostelOpted ? 'bg-purple-50 border-purple-300 shadow-xs' : 'bg-white border-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={hostelOpted}
                  onChange={(e) => setHostelOpted(e.target.checked)}
                  className="rounded text-purple-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-purple-600" /> Hostel Accommodation
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">+₹25,000 / year (Cauvery)</span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                coachingOpted ? 'bg-cyan-50 border-cyan-300 shadow-xs' : 'bg-white border-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={coachingOpted}
                  onChange={(e) => setCoachingOpted(e.target.checked)}
                  className="rounded text-cyan-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Foundation Coaching
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">+₹10,000 / year (NEET/JEE)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Real-time Summary Card & Installment Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agreement Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Agreed Fixation Settlement Summary
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Original Standard Fee:</span>
                  <span>₹{standardAnnualFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Approved Concession ({concessionCategory}):</span>
                  <span>-₹{totalConcession.toLocaleString()}</span>
                </div>
                {additionalChargesTotal > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Additional Charges:</span>
                    <span>+₹{additionalChargesTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-black text-slate-950">
                  <span>Final Annual Payable:</span>
                  <span className="text-blue-700">₹{finalTotalPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Installment Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                3-Term Flexible Installment Schedule
              </span>
              <div className="space-y-1.5">
                {termInstallments.map((t) => (
                  <div key={t.term_code} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{t.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Due: {t.due_date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-slate-900 block">₹{t.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-blue-600 font-bold">{t.share_pct}% Installment</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reason & Remarks */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Management Authorization Reason & Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reasonRemarks}
              onChange={(e) => setReasonRemarks(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-blue-600 text-xs"
              placeholder="e.g. Sibling discount approved by Chairman. Academic Director concurrence obtained."
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full audit history logged under User ID: {currentRole}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Authorize Fixation</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

