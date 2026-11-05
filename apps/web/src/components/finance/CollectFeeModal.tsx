import React, { useState, useId } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  Search,
  Receipt,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  ArrowRight,
  Bus,
  Building,
  Check,
  Percent,
  Banknote,
  FileCheck
} from 'lucide-react';
import {
  useDemoStore,
  DemoStudent,
  DemoFeeReceipt,
  PaymentMethodType,
  MultiHeadFeeItem
} from '../../store/demoStore';

interface CollectFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: string;
  onSuccess?: (receipt: DemoFeeReceipt) => void;
}

export const CollectFeeModal: React.FC<CollectFeeModalProps> = ({
  isOpen,
  onClose,
  preselectedStudentId,
  onSuccess,
}) => {
  const { students, collectMultiHeadFee, tenantScope } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('Counter Collection - Term 1 Dues');
  const [concessionAmount, setConcessionAmount] = useState<number>(0);
  const [concessionReason, setConcessionReason] = useState<string>('Merit Scholarship');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<DemoFeeReceipt | null>(null);

  // Active student selection
  const activeStudent = students.find(
    (s) => s.id === selectedStudentId || s.admission_number === selectedStudentId
  ) || (students.length > 0 && !selectedStudentId ? students[0] : null);

  // Filter students by search
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.admission_number.toLowerCase().includes(q) ||
      s.class_name.toLowerCase().includes(q)
    );
  });

  // Calculate default heads based on active student
  const getInitialHeadAllocations = (st: DemoStudent | null): Record<string, number> => {
    if (!st) return {};
    const isPu = st.institution_level === 'PU College';
    const isDegree = st.institution_level === 'Degree College';

    return {
      TUITION: isPu ? 25000 : isDegree ? 28000 : 20000,
      LABORATORY: isPu ? 8000 : isDegree ? 10000 : 4000,
      HOSTEL: st.is_hostel_opted ? 25000 : 0,
      TRANSPORT: st.is_transport_opted ? 12000 : 0,
      LIBRARY_DEV: 3000,
    };
  };

  const [headAllocations, setHeadAllocations] = useState<Record<string, number>>(() =>
    getInitialHeadAllocations(activeStudent)
  );

  // When student selection changes, reset allocations
  const handleSelectStudent = (s: DemoStudent) => {
    setSelectedStudentId(s.id);
    setHeadAllocations(getInitialHeadAllocations(s));
    setConcessionAmount(0);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  // Head configuration specifications
  const isHostelOpted = !!activeStudent?.is_hostel_opted;
  const isTransportOpted = !!activeStudent?.is_transport_opted;

  const feeHeadSpecs = [
    {
      code: 'TUITION',
      title: 'Tuition & Academic Classroom Instruction',
      category: 'Tuition',
      isApplicable: true,
      maxDues: activeStudent?.institution_level === 'PU College' ? 45000 : 35000,
      defaultPaid: headAllocations.TUITION ?? (activeStudent?.institution_level === 'PU College' ? 25000 : 20000),
    },
    {
      code: 'LABORATORY',
      title: 'Science & Computer Practical Laboratory',
      category: 'Laboratory',
      isApplicable: true,
      maxDues: activeStudent?.institution_level === 'PU College' ? 15000 : 5000,
      defaultPaid: headAllocations.LABORATORY ?? (activeStudent?.institution_level === 'PU College' ? 8000 : 4000),
    },
    {
      code: 'HOSTEL',
      title: 'Hostel Accommodation & Dining Mess Fee',
      category: 'Hostel',
      isApplicable: isHostelOpted,
      tag: isHostelOpted ? 'Opted: Cauvery Wing' : 'Not Enrolled (Day Scholar)',
      maxDues: isHostelOpted ? 35000 : 0,
      defaultPaid: isHostelOpted ? (headAllocations.HOSTEL ?? 25000) : 0,
    },
    {
      code: 'TRANSPORT',
      title: 'Campus Bus Transport Fleet Service',
      category: 'Transport',
      isApplicable: isTransportOpted,
      tag: isTransportOpted ? 'Opted: Route 104' : 'Not Enrolled (Day Scholar)',
      maxDues: isTransportOpted ? 16000 : 0,
      defaultPaid: isTransportOpted ? (headAllocations.TRANSPORT ?? 12000) : 0,
    },
    {
      code: 'LIBRARY_DEV',
      title: 'Digital Library, Sports & Campus Amenities',
      category: 'Amenities',
      isApplicable: true,
      maxDues: 5000,
      defaultPaid: headAllocations.LIBRARY_DEV ?? 3000,
    },
  ];

  // Head adjustment handler
  const handleHeadChange = (code: string, valueStr: string) => {
    const val = Math.max(0, parseFloat(valueStr) || 0);
    setHeadAllocations((prev) => ({ ...prev, [code]: val }));
  };

  // Calculations
  const grossPayableNow = feeHeadSpecs.reduce((sum, h) => {
    if (!h.isApplicable) return sum;
    return sum + (headAllocations[h.code] ?? h.defaultPaid);
  }, 0);

  const netPayableNow = Math.max(0, grossPayableNow - (concessionAmount || 0));

  const totalScheduledDues = feeHeadSpecs.reduce((sum, h) => {
    return sum + (h.isApplicable ? h.maxDues : 0);
  }, 0);

  const remainingBalanceAfterPay = Math.max(0, totalScheduledDues - netPayableNow);

  // Quick Preset Actions
  const handleFillAllDues = () => {
    const full: Record<string, number> = {};
    feeHeadSpecs.forEach((h) => {
      full[h.code] = h.isApplicable ? h.maxDues : 0;
    });
    setHeadAllocations(full);
  };

  const handleFillTermOne = () => {
    setHeadAllocations(getInitialHeadAllocations(activeStudent));
  };

  const handleClearAll = () => {
    const zero: Record<string, number> = {};
    feeHeadSpecs.forEach((h) => {
      zero[h.code] = 0;
    });
    setHeadAllocations(zero);
  };

  // Submission
  const handleCollectAndEmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeStudent) {
      setErrorMessage('Please select a student.');
      return;
    }

    if (netPayableNow <= 0) {
      setErrorMessage('Total fee collection amount must be greater than ₹0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload: MultiHeadFeeItem[] = feeHeadSpecs
        .filter((h) => h.isApplicable)
        .map((h) => {
          const col = headAllocations[h.code] ?? h.defaultPaid;
          return {
            head_code: h.code,
            head_title: h.title,
            category: h.category,
            configured_amount: h.maxDues,
            previously_paid: 0,
            concession_amount: h.code === 'TUITION' ? concessionAmount : 0,
            collected_amount: col,
          };
        });

      const generatedReceipt = collectMultiHeadFee({
        student_id: activeStudent.id,
        student_name: `${activeStudent.first_name} ${activeStudent.last_name}`,
        admission_number: activeStudent.admission_number,
        class_name: `${activeStudent.institution_level} - ${activeStudent.class_name}`,
        academic_year: activeStudent.academic_year || '2026-2027',
        term_code: 'TERM_1',
        term_name: 'Term 1 / Consolidated Payment',
        fee_items: itemsPayload,
        payment_method: paymentMethod,
        reference_number: transactionRef.trim() || `TXN-${paymentMethod}-${Date.now().toString().slice(-6)}`,
        notes: `${notes} • ${concessionAmount > 0 ? `Concession applied: ₹${concessionAmount} (${concessionReason})` : 'Standard Payment'}`,
      });

      setReceipt(generatedReceipt);
      if (onSuccess) onSuccess(generatedReceipt);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate official fee receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert numbers to words (Indian Rupees)
  const numberToWords = (num: number): string => {
    if (num <= 0) return 'Zero Rupees';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
    };

    return `Rupees ${inWords(Math.round(num)).trim()} Only`;
  };

  const institutionName = tenantScope === 'our-school-demo'
    ? 'OUR SCHOOL Demonstration Campus'
    : 'Akshara Global School & PU College';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-slate-900 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {receipt ? 'Official Computer-Generated Fee Receipt' : 'Student-Wise Flexible Fee Collection'}
              </h2>
              <p className="text-xs text-slate-600">
                {receipt
                  ? 'Payment Verified & Digitally Signed • Emits One Consolidated Receipt'
                  : 'Head-wise adjustments • Conditional hostel/transport charges • Concession support'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {receipt ? (
          /* =================================================================== */
          /* 1. CONSOLIDATED OFFICIAL RECEIPT VIEW */
          /* =================================================================== */
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50/50 space-y-6 print:border-none print:p-0">
              
              {/* Institution Header */}
              <div className="text-center pb-4 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Consolidated Official Fee Receipt
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {receipt.institution_branding.institution_name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {receipt.institution_branding.affiliation} • Bengaluru
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Helpline: {receipt.institution_branding.phone} • Email: {receipt.institution_branding.email}
                </p>
              </div>

              {/* Receipt Key Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Receipt Number</span>
                  <span className="font-mono font-black text-emerald-700">{receipt.receipt_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Date & Time</span>
                  <span className="font-semibold text-slate-800">{receipt.payment_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Mode</span>
                  <span className="font-bold text-slate-900">{receipt.payment_method}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Txn Reference</span>
                  <span className="font-mono text-slate-700 text-[11px]">{receipt.transaction_reference}</span>
                </div>
              </div>

              {/* Student Master Particulars */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Student Full Name</span>
                  <span className="font-black text-slate-900">{receipt.student_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Admission Number</span>
                  <span className="font-mono font-bold text-slate-800">{receipt.admission_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Class & Stream</span>
                  <span className="font-semibold text-slate-800">{receipt.class_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Academic Session</span>
                  <span className="font-semibold text-slate-800">{receipt.academic_year}</span>
                </div>
              </div>

              {/* Itemized Fee Head Allocations Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Fee Head Particulars</th>
                      <th className="p-3 text-right">Amount Collected (₹)</th>
                      <th className="p-3 text-right">Remaining Due (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipt.allocations.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">
                          {item.title}
                          <span className="text-[10px] text-slate-500 font-mono block">[{item.head}]</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          ₹{item.allocated.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600">
                          ₹{item.remaining.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                    <tr>
                      <td className="p-3 text-slate-900 font-black">Total Paid in this Receipt:</td>
                      <td className="p-3 text-right font-mono font-black text-base text-emerald-800">
                        ₹{receipt.amount_paid.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700">
                        ₹{receipt.current_balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Amount in Words */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Amount In Words</span>
                <span className="font-bold text-slate-900 italic">
                  {numberToWords(receipt.amount_paid)}
                </span>
              </div>

              {/* Footer: Digital QR & Authorized Signatory */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white border border-slate-300 p-1 rounded-xl flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-slate-500 block">QR Security Hash</span>
                    <span className="font-mono text-emerald-700 font-bold text-[11px] block">{receipt.qr_verification_code.slice(0, 24)}...</span>
                    <span className="text-[10px] text-slate-500">Scan to verify against institutional ledger</span>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="font-bold text-slate-900 block">{receipt.collected_by}</span>
                  <div className="w-32 border-b border-slate-400 my-1 mx-auto sm:ml-auto"></div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Authorized Accounts Officer</span>
                </div>
              </div>
            </div>

            {/* Receipt Modal Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Collect Another Fee
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  Print Receipt (A4)
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Done / Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* 2. FLEXIBLE COLLECTION FORM */
          /* =================================================================== */
          <form onSubmit={handleCollectAndEmitReceipt} className="p-6 overflow-y-auto space-y-5 flex-1">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Student Search & Quick Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Select Student (Search by Admission #, Roll # or Name)
                </label>
                <span className="text-[10px] text-slate-500">Auto-populates admission master profile</span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Aarav, Ananya, Rahul, admission #, roll #..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Select Student Chips */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {filteredStudents.map((st) => {
                  const isSelected = activeStudent?.id === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectStudent(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{st.first_name} {st.last_name}</span>
                      <span className="font-mono text-[10px] opacity-80">({st.admission_number})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Selected Student Master Profile Card */}
            {activeStudent && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                      {activeStudent.first_name[0]}{activeStudent.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">
                        {activeStudent.first_name} {activeStudent.last_name}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {activeStudent.institution_level} • {activeStudent.class_name} • {activeStudent.section_or_stream} • Roll #{activeStudent.roll_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Guardian Phone</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{activeStudent.guardian_phone}</span>
                  </div>
                </div>

                {/* Conditional Facility Enrolment Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Enrolled Services:</span>
                  
                  {/* Transport Badge */}
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                    activeStudent.is_transport_opted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <Bus className="w-3.5 h-3.5" />
                    {activeStudent.is_transport_opted ? 'Transport: Enrolled (Route 104)' : 'Transport: Day Scholar (₹0 Due)'}
                  </span>

                  {/* Hostel Badge */}
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                    activeStudent.is_hostel_opted
                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <Building className="w-3.5 h-3.5" />
                    {activeStudent.is_hostel_opted ? 'Hostel: Enrolled (Cauvery Wing Room 204)' : 'Hostel: Day Scholar (₹0 Due)'}
                  </span>
                </div>
              </div>
            )}

            {/* 3. Fast Adjustment Preset Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Head-Wise Fee Settlement Matrix
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={handleFillAllDues}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Pay All Dues
                </button>
                <button
                  type="button"
                  onClick={handleFillTermOne}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Term 1 Preset
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* 4. Head-Wise Amount Input Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Fee Head Title</th>
                    <th className="p-3 text-center">Status / Tag</th>
                    <th className="p-3 text-right">Scheduled Due (₹)</th>
                    <th className="p-3 text-right">Paying Now (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {feeHeadSpecs.map((h) => {
                    const isAllowed = h.isApplicable;
                    const curVal = headAllocations[h.code] ?? h.defaultPaid;

                    return (
                      <tr key={h.code} className={isAllowed ? 'hover:bg-slate-50/70' : 'bg-slate-50/50 opacity-60'}>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{h.title}</span>
                          <span className="text-[10px] font-mono text-slate-500">Category: {h.category}</span>
                        </td>
                        <td className="p-3 text-center">
                          {isAllowed ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active Head
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                              Not Enrolled (N/A)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                          ₹{h.maxDues.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <span className="text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              disabled={!isAllowed}
                              value={isAllowed ? curVal : 0}
                              onChange={(e) => handleHeadChange(h.code, e.target.value)}
                              className={`w-28 px-2.5 py-1.5 rounded-xl border font-mono font-bold text-right text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                isAllowed
                                  ? 'bg-white border-slate-300 text-slate-900'
                                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 5. Concession / Scholarship Adjustment & Payment Modes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Concession Support */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-600" />
                    Special Concession / Scholarship
                  </span>
                  <span className="text-[10px] text-slate-500">Deducts from gross total</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Concession (₹)</label>
                    <input
                      type="number"
                      value={concessionAmount}
                      onChange={(e) => setConcessionAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Reason / Scheme</label>
                    <select
                      value={concessionReason}
                      onChange={(e) => setConcessionReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Merit Scholarship">Merit Scholarship</option>
                      <option value="Staff Ward Discount">Staff Ward Discount</option>
                      <option value="Sibling Concession">Sibling Concession</option>
                      <option value="Management Discretion">Management Approval</option>
                      <option value="RTE Concession">RTE Exemption</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method & Transaction Reference */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Payment Channel
                  </span>
                  <span className="text-[10px] text-slate-500">Digital verification</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Mode *</label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="CASH">Cash Counter</option>
                      <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                      <option value="ONLINE_NETBANKING">Card Swipe (POS)</option>
                      <option value="CHEQUE">Cheque / Demand Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Txn / UTR / Cheque #</label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. UPI/2026/8912"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Summary Card */}
            <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Consolidated Collection Summary
                </span>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Scheduled Dues: ₹{totalScheduledDues.toLocaleString('en-IN')}
                  {concessionAmount > 0 && ` • Concession: -₹${concessionAmount.toLocaleString('en-IN')}`}
                  {` • Remaining Due: ₹${remainingBalanceAfterPay.toLocaleString('en-IN')}`}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Net Amount to Collect</span>
                <p className="text-2xl font-black text-emerald-800 font-mono">
                  ₹{netPayableNow.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || netPayableNow <= 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4" />
                {isSubmitting ? 'Generating Official Receipt...' : `Collect ₹${netPayableNow.toLocaleString('en-IN')} & Issue Receipt`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
