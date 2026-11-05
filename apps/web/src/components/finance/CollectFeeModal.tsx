import React, { useState, useId } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  Search,
  DollarSign,
  Receipt,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { useDemoStore, DemoStudent, DemoFeeReceipt, PaymentMethodType } from '../../store/demoStore';

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
  const { students, invoices, collectQuickFee, tenantScope } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [amount, setAmount] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('Counter Collection - Term Fee');
  const [concession, setConcession] = useState<string>('0');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<DemoFeeReceipt | null>(null);

  if (!isOpen) return null;

  // Selected student
  const activeStudent = students.find(
    (s) => s.id === selectedStudentId || s.admission_number === selectedStudentId
  ) || (students.length > 0 && !selectedStudentId ? students[0] : null);

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

  const studentInvoice = activeStudent
    ? invoices.find((i) => i.admission_number === activeStudent.admission_number)
    : null;

  const currentDues = activeStudent ? (activeStudent.fee_balance || 0) : 0;

  const handleSelectStudent = (s: DemoStudent) => {
    setSelectedStudentId(s.id);
    const dues = s.fee_balance || 0;
    setAmount(dues > 0 ? String(dues) : '15000');
    setErrorMessage(null);
  };

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeStudent) {
      setErrorMessage('Please select a student.');
      return;
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generated = collectQuickFee({
        studentId: activeStudent.id,
        amount: payAmount,
        paymentMethod,
        transactionRef: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setReceipt(generated);
      if (onSuccess) onSuccess(generated);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process fee collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {receipt ? 'Official Fee Receipt' : 'Collect Student Fee'}
              </h2>
              <p className="text-xs text-slate-500">
                {receipt
                  ? 'Payment verified • Receipt generated successfully'
                  : 'Fast front-desk collection, receipt generation & ledger update'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {receipt ? (
          /* Receipt View */
          <div className="p-6 space-y-6">
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-6 print:border-none print:p-0">
              {/* Institution Header */}
              <div className="text-center pb-4 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Official Computer-Generated Fee Receipt
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {tenantScope === 'our-school-demo' ? 'OUR SCHOOL' : 'Akshara Global School & PU College'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  CBSE Affiliation # 830192 • Campus Enclave, Bengaluru
                </p>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Receipt No</span>
                  <span className="font-mono font-bold text-slate-900">{receipt.receipt_number}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Date & Time</span>
                  <span className="font-medium text-slate-800">{receipt.payment_date}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Student Name</span>
                  <span className="font-bold text-slate-900 truncate block">{receipt.student_name}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Admission #</span>
                  <span className="font-mono font-bold text-slate-900">{receipt.admission_number}</span>
                </div>
              </div>

              {/* Head Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fee Head</th>
                      <th className="p-3 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipt.allocations?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-slate-800">{item.title}</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          ₹{item.allocated.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50/60 font-black">
                      <td className="p-3 text-emerald-900">Total Collected</td>
                      <td className="p-3 text-right text-emerald-700 text-sm">
                        ₹{receipt.amount_paid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Balance & Verification */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 text-xs">
                <div className="space-y-1">
                  <div className="text-slate-500">
                    Payment Method: <span className="font-bold text-slate-900">{receipt.payment_method}</span>
                  </div>
                  <div className="text-slate-500">
                    Remaining Student Dues: <span className="font-bold text-amber-600">₹{receipt.current_balance.toLocaleString('en-IN')}</span>
                  </div>
                  {receipt.transaction_reference && (
                    <div className="text-slate-400 text-[11px] font-mono">
                      Ref: {receipt.transaction_reference}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-emerald-700 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Digitally Signed & Confirmed</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setReceipt(null);
                  setAmount('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                ← Collect Another Fee
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Collection Form */
          <form onSubmit={handleCollect} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Student Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Student for Fee Payment
              </label>

              {students.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  No students currently enrolled in this institution. Please use <strong>[+ Add Student]</strong> to admit students first.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search student by name, admission #, or class..."
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
                    {filteredStudents.slice(0, 5).map((s) => {
                      const isSelected = activeStudent?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectStudent(s)}
                          className={`w-full p-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                            isSelected ? 'bg-emerald-50/80 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {s.first_name[0]}
                            </div>
                            <div>
                              <div className="text-slate-900 font-semibold">{s.first_name} {s.last_name}</div>
                              <div className="text-[11px] text-slate-500">
                                {s.admission_number} • {s.class_name} ({s.institution_level})
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Dues</div>
                            <div className={`font-mono font-bold ${s.fee_balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              ₹{(s.fee_balance || 0).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Active Student Summary Pill */}
            {activeStudent && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected Enrolled Student</span>
                  <div className="font-bold text-slate-900">{activeStudent.first_name} {activeStudent.last_name}</div>
                  <div className="text-[11px] text-slate-500">
                    Guardian: {activeStudent.guardian_name} ({activeStudent.guardian_phone})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Dues</span>
                    <span className="font-mono font-bold text-amber-600">
                      ₹{currentDues.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {currentDues > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(String(currentDues))}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] hover:bg-emerald-200 transition-colors"
                    >
                      Pay Full
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 2. Amount and Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount to Collect (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['UPI', 'CASH', 'CHEQUE', 'BANK_TRANSFER'] as PaymentMethodType[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === mode
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Transaction Reference & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transaction Ref / Cheque No
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI-UTR-90812984 or CHQ-00129"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Internal Remarks / Receipt Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Counter fee deposit"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !activeStudent}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Recording Payment...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Confirm & Generate Official Receipt</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
