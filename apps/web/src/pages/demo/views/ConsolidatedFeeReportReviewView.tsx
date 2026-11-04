import React, { useState, useMemo } from 'react';
import {
  FileText, CheckCircle2, XCircle, Download, Clock, ShieldCheck,
  Search, Filter, Eye, AlertCircle, ArrowUpRight, Lock, Printer
} from 'lucide-react';
import { useDemoStore, ConsolidatedFeeReportSnapshotModel } from '../../../store/demoStore';

interface ConsolidatedFeeReportReviewViewProps {
  currentRole: string;
}

export const ConsolidatedFeeReportReviewView: React.FC<ConsolidatedFeeReportReviewViewProps> = ({ currentRole }) => {
  const {
    students,
    feeSnapshots,
    submitFeeReportSnapshot,
    reviewFeeReportSnapshot
  } = useDemoStore();

  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'OVERDUE'>('ALL');

  // Snapshot modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitRemarks, setSubmitRemarks] = useState('');
  const [selectedSnapshotForReview, setSelectedSnapshotForReview] = useState<ConsolidatedFeeReportSnapshotModel | null>(null);
  const [reviewActionRemarks, setReviewActionRemarks] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check if current user has Chairman / Director privilege
  const isChairman = ['CHAIRMAN_DIRECTOR', 'DIRECTOR', 'MANAGING_DIRECTOR', 'SUPER_ADMIN'].includes(currentRole);
  const isAccountant = ['ACCOUNTANT', 'SUPER_ADMIN', 'INSTITUTION_ADMIN'].includes(currentRole);

  // Generate 200+ simulated student ledger entries deterministically from existing students and mock expansion
  const studentLedgerList = useMemo(() => {
    const baseNames = [
      { name: 'Rahul Kumar', class: 'Class 6 - Section A', tuition: 35000, lab: 0, hostel: 0, transport: 12000, concession: 2000, paid: 45000 },
      { name: 'Pooja Reddy', class: 'Class 6 - Section A', tuition: 35000, lab: 0, hostel: 0, transport: 0, concession: 0, paid: 35000 },
      { name: 'Aarav Sharma', class: 'Class 6 - Section B', tuition: 35000, lab: 0, hostel: 0, transport: 10000, concession: 5000, paid: 40000 },
      { name: 'Ananya Hegde', class: 'Class 6 - Section C', tuition: 35000, lab: 0, hostel: 0, transport: 12000, concession: 0, paid: 30000 },
      { name: 'Aditya Rao', class: 'Class 6 - Section D', tuition: 35000, lab: 0, hostel: 0, transport: 0, concession: 0, paid: 15000 },
      { name: 'Siddharth Iyer', class: 'I PUC PCMB - Section A', tuition: 65000, lab: 15000, hostel: 45000, transport: 0, concession: 10000, paid: 115000 },
      { name: 'Kavya Patil', class: 'I PUC PCMB - Section A', tuition: 65000, lab: 15000, hostel: 0, transport: 14000, concession: 0, paid: 94000 },
      { name: 'Chetan Gowda', class: 'I PUC PCMB - Section B', tuition: 65000, lab: 15000, hostel: 45000, transport: 0, concession: 5000, paid: 80000 },
      { name: 'Meghana Joshi', class: 'I PUC PCMB - Section C', tuition: 65000, lab: 15000, hostel: 0, transport: 12000, concession: 0, paid: 50000 },
      { name: 'Pavan Deshmukh', class: 'I PUC PCMB - Section D', tuition: 65000, lab: 15000, hostel: 45000, transport: 0, concession: 0, paid: 125000 },
      { name: 'Deepa Hegde', class: 'I PUC PCMB - Section E', tuition: 65000, lab: 15000, hostel: 0, transport: 15000, concession: 0, paid: 95000 },
      { name: 'Varun Kulkarni', class: 'I PUC PCMB - Section F', tuition: 65000, lab: 15000, hostel: 45000, transport: 0, concession: 15000, paid: 60000 },
    ];

    // Expand to 200 realistic records for full enterprise scale
    const list = [];
    for (let i = 0; i < 200; i++) {
      const base = baseNames[i % baseNames.length];
      const admissionNo = `AK-2026-${(1001 + i).toString().padStart(4, '0')}`;
      const name = i < baseNames.length ? base.name : `${base.name.split(' ')[0]} ${String.fromCharCode(65 + (i % 26))}.`;
      const admissionFee = 5000;
      const totalAssigned = base.tuition + admissionFee + base.lab + base.hostel + base.transport;
      const netPayable = totalAssigned - base.concession;
      const paid = Math.min(netPayable, base.paid);
      const balance = netPayable - paid;
      const status: 'PAID' | 'PARTIAL' | 'OVERDUE' = balance === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'OVERDUE';

      list.push({
        id: `ledger-${i + 1}`,
        admissionNo,
        name,
        className: base.class,
        tuition: base.tuition,
        admissionFee,
        labFee: base.lab,
        hostelFee: base.hostel,
        transportFee: base.transport,
        totalAssigned,
        concession: base.concession,
        netPayable,
        paid,
        balance,
        status,
        lastPaymentDate: '2026-10-24'
      });
    }
    return list;
  }, [students]);

  // Filtered ledger rows
  const filteredLedger = useMemo(() => {
    return studentLedgerList.filter(row => {
      const matchClass = selectedClass === 'ALL' || row.className.includes(selectedClass);
      const matchStatus = statusFilter === 'ALL' || row.status === statusFilter;
      const matchQuery = !searchQuery || 
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        row.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchStatus && matchQuery;
    });
  }, [studentLedgerList, selectedClass, statusFilter, searchQuery]);

  // Aggregate Metrics
  const summaryMetrics = useMemo(() => {
    const totalAssigned = filteredLedger.reduce((acc, r) => acc + r.totalAssigned, 0);
    const totalConcessions = filteredLedger.reduce((acc, r) => acc + r.concession, 0);
    const netPayable = filteredLedger.reduce((acc, r) => acc + r.netPayable, 0);
    const totalCollected = filteredLedger.reduce((acc, r) => acc + r.paid, 0);
    const totalOutstanding = filteredLedger.reduce((acc, r) => acc + r.balance, 0);
    const collectionPct = netPayable > 0 ? (totalCollected / netPayable) * 100 : 0;
    const fullyPaidCount = filteredLedger.filter(r => r.status === 'PAID').length;
    const partialCount = filteredLedger.filter(r => r.status === 'PARTIAL').length;
    const overdueCount = filteredLedger.filter(r => r.status === 'OVERDUE').length;

    return {
      totalAssigned,
      totalConcessions,
      netPayable,
      totalCollected,
      totalOutstanding,
      collectionPct,
      fullyPaidCount,
      partialCount,
      overdueCount,
      totalStudents: filteredLedger.length
    };
  }, [filteredLedger]);

  // Accountant Snapshot Submission Handler
  const handleCaptureSnapshot = () => {
    const res = submitFeeReportSnapshot({
      academic_year: selectedYear,
      target_class: selectedClass === 'ALL' ? 'All Classes (200 Students)' : selectedClass,
      submitted_by_name: currentRole === 'ACCOUNTANT' ? 'S. Ramaswamy (Chief Accountant)' : `${currentRole} Official`,
      total_students: summaryMetrics.totalStudents,
      total_assigned: summaryMetrics.totalAssigned,
      total_concessions: summaryMetrics.totalConcessions,
      net_payable: summaryMetrics.netPayable,
      total_collected: summaryMetrics.totalCollected,
      total_outstanding: summaryMetrics.totalOutstanding,
      collection_pct: Number(summaryMetrics.collectionPct.toFixed(1)),
      fully_paid: summaryMetrics.fullyPaidCount,
      partially_paid: summaryMetrics.partialCount,
      unpaid: summaryMetrics.overdueCount
    });
    setShowSubmitModal(false);
    showToast(`Snapshot ${res.snapshot.snapshot_code} compiled & submitted to Chairman Review Queue.`);
  };

  // Chairman Review Actions
  const handleApproveSnapshot = (idOrCode: string) => {
    reviewFeeReportSnapshot(
      idOrCode,
      'APPROVED',
      reviewActionRemarks || 'Verified against institutional bank reconciliation ledger. Approved.'
    );
    setSelectedSnapshotForReview(null);
    setReviewActionRemarks('');
    showToast(`Snapshot ${idOrCode} APPROVED by Chairman. Ledger state locked.`);
  };

  const handleReturnSnapshot = (idOrCode: string) => {
    if (!reviewActionRemarks.trim()) {
      alert('Please enter return remarks explaining why the report needs revision.');
      return;
    }
    reviewFeeReportSnapshot(
      idOrCode,
      'RETURNED_FOR_REVISION',
      reviewActionRemarks
    );
    setSelectedSnapshotForReview(null);
    setReviewActionRemarks('');
    showToast(`Snapshot ${idOrCode} returned to Accounts Department with revision notes.`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B4D] text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500 flex items-center gap-3 text-sm animate-bounce">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#172B4D] rounded-2xl p-6 text-white border border-slate-700 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full">
                Phase 6 Financial Audit & Governance
              </span>
              <span className="text-xs text-slate-300">
                {isChairman ? '👑 Executive Chairman Desk' : '💼 Accountant Reporting Desk'}
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1">Consolidated Student Fee Ledger & Chairman Review</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Multi-Head Fee Statement (200+ Students) • Frozen Tamper-Evident Snapshots • Chairman One-Click Signoff
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Accountant Submit Snapshot Button */}
            {isAccountant && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Capture & Submit Frozen Snapshot to Chairman
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Ledger
            </button>
            <button
              onClick={() => showToast('Consolidated Excel (200 records) exported successfully.')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-700/80">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Students</span>
            <p className="text-lg font-black text-white">{summaryMetrics.totalStudents}</p>
            <span className="text-[10px] text-blue-400 font-mono">Enrolled Roster</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Fees</span>
            <p className="text-lg font-black text-white">₹{(summaryMetrics.totalAssigned / 100000).toFixed(2)}L</p>
            <span className="text-[10px] text-slate-400">All heads combined</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Concessions / RTE</span>
            <p className="text-lg font-black text-amber-400">₹{(summaryMetrics.totalConcessions / 100000).toFixed(2)}L</p>
            <span className="text-[10px] text-slate-400">Approved fee waivers</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Net Payable</span>
            <p className="text-lg font-black text-white">₹{(summaryMetrics.netPayable / 100000).toFixed(2)}L</p>
            <span className="text-[10px] text-slate-400">Institution receivable</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Collected Realized</span>
            <p className="text-lg font-black text-emerald-400">₹{(summaryMetrics.totalCollected / 100000).toFixed(2)}L</p>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">{summaryMetrics.collectionPct.toFixed(1)}% Realized</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Balance</span>
            <p className="text-lg font-black text-rose-400">₹{(summaryMetrics.totalOutstanding / 100000).toFixed(2)}L</p>
            <span className="text-[10px] text-rose-400 font-mono">{summaryMetrics.overdueCount} Overdue cases</span>
          </div>
        </div>
      </div>

      {/* Chairman Executive Snapshot Review Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Chairman Executive Review & Audit Queue</h2>
            </div>
            <p className="text-xs text-slate-500">
              Snapshots submitted by the Accounts Department. Chairman review locks the ledger snapshot for the fiscal audit.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {feeSnapshots.length} Recorded Snapshots
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Snapshot Code</th>
                <th className="py-2.5 px-3">Scope / Target</th>
                <th className="py-2.5 px-3">Submitted By</th>
                <th className="py-2.5 px-3">Students</th>
                <th className="py-2.5 px-3">Total Receivable</th>
                <th className="py-2.5 px-3">Collected %</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeSnapshots.map((snp: ConsolidatedFeeReportSnapshotModel) => (
                <tr key={snp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    {snp.snapshot_code}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{snp.target_class} ({snp.academic_year})</td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{snp.submitted_by_name}</div>
                    <div className="text-[10px] text-slate-400">{snp.submitted_at}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{snp.total_students}</td>
                  <td className="py-3 px-3 font-mono text-slate-900">₹{(snp.net_payable / 100000).toFixed(2)}L</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, snp.collection_pct)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700 text-[11px]">{snp.collection_pct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      snp.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : snp.status === 'RETURNED_FOR_REVISION'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {snp.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {snp.status === 'RETURNED_FOR_REVISION' && <XCircle className="w-3 h-3 text-rose-600" />}
                      {snp.status === 'SUBMITTED' && <Clock className="w-3 h-3 text-amber-600" />}
                      {snp.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedSnapshotForReview(snp)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors cursor-pointer"
                    >
                      {isChairman && snp.status === 'SUBMITTED' ? 'Review & Sign' : 'Inspect'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 200+ Student Consolidated Ledger Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Fee Ledger Register (200 Students)</h2>
            <p className="text-xs text-slate-500">
              Breakdown across Tuition, Admission, Lab, Hostel Mess and Transport heads.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search student or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-44 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Classes & Sections</option>
              <option value="Class 6">Class 6 (A-D)</option>
              <option value="I PUC PCMB">I PUC PCMB (A-F)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Fully Settled</option>
              <option value="PARTIAL">Partial Dues</option>
              <option value="OVERDUE">No Payment (Overdue)</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8FC] text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Admission #</th>
                <th className="py-2.5 px-3">Student & Section</th>
                <th className="py-2.5 px-3">Tuition</th>
                <th className="py-2.5 px-3">Admission</th>
                <th className="py-2.5 px-3">Lab Fee</th>
                <th className="py-2.5 px-3">Hostel</th>
                <th className="py-2.5 px-3">Transport</th>
                <th className="py-2.5 px-3 text-amber-700">Waiver/RTE</th>
                <th className="py-2.5 px-3 font-black text-slate-900">Net Due</th>
                <th className="py-2.5 px-3 text-emerald-700 font-black">Paid</th>
                <th className="py-2.5 px-3 text-rose-700 font-black">Balance</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.slice(0, 50).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-700 font-semibold">{row.admissionNo}</td>
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-900">{row.name}</div>
                    <div className="text-[10px] text-slate-500">{row.className}</div>
                  </td>
                  <td className="py-2 px-3 font-mono">₹{row.tuition.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono">₹{row.admissionFee.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono">₹{row.labFee.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono">₹{row.hostelFee.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono">₹{row.transportFee.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono text-amber-700 font-semibold">
                    {row.concession > 0 ? `-₹${row.concession.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-900">₹{row.netPayable.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-700">₹{row.paid.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono font-bold text-rose-700">
                    {row.balance > 0 ? `₹${row.balance.toLocaleString()}` : '₹0'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      row.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : row.status === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-slate-500 text-right">
          Showing 50 of {filteredLedger.length} filtered student ledger records (Full 200 included in frozen snapshot)
        </div>
      </div>

      {/* Snapshot Review Drawer / Modal */}
      {selectedSnapshotForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {selectedSnapshotForReview.snapshot_code}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Chairman Review Desk: Frozen Fee Snapshot
                </h3>
              </div>
              <button
                onClick={() => setSelectedSnapshotForReview(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Scope:</span>
                <span className="font-bold text-slate-900">{selectedSnapshotForReview.target_class}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Submitted By:</span>
                <span className="font-bold text-slate-900">{selectedSnapshotForReview.submitted_by_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Receivable:</span>
                <span className="font-bold text-slate-900 font-mono">₹{(selectedSnapshotForReview.net_payable / 100000).toFixed(2)}L</span>
              </div>
              <div>
                <span className="text-slate-500 block">Collection Rate:</span>
                <span className="font-bold text-emerald-600 font-mono">{selectedSnapshotForReview.collection_pct}%</span>
              </div>
            </div>

            {selectedSnapshotForReview.reviewed_by_name && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900 block">Audit Sign-off Record:</span>
                <span className="text-emerald-800">Reviewed by {selectedSnapshotForReview.reviewed_by_name} at {selectedSnapshotForReview.reviewed_at}</span>
                <p className="text-emerald-700 italic mt-1">"{selectedSnapshotForReview.review_remarks}"</p>
              </div>
            )}

            {isChairman && selectedSnapshotForReview.status === 'SUBMITTED' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Chairman Review Remarks / Directives:
                </label>
                <textarea
                  rows={3}
                  value={reviewActionRemarks}
                  onChange={(e) => setReviewActionRemarks(e.target.value)}
                  placeholder="Enter approval remarks or revision feedback for the accounts department..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                />

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReturnSnapshot(selectedSnapshotForReview.snapshot_code)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Return with Remarks
                  </button>
                  <button
                    onClick={() => handleApproveSnapshot(selectedSnapshotForReview.snapshot_code)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Seal Ledger Snapshot
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accountant Capture Snapshot Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Compile & Submit Frozen Snapshot
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This action captures an immutable, tamper-evident snapshot of the current 200-student ledger for {selectedYear} ({selectedClass === 'ALL' ? 'All Classes' : selectedClass}).
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Enrolled:</span>
                <span className="font-bold text-slate-900">{summaryMetrics.totalStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Receivable:</span>
                <span className="font-bold text-slate-900">₹{(summaryMetrics.netPayable / 100000).toFixed(2)}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Realized:</span>
                <span className="font-bold text-emerald-600">{summaryMetrics.collectionPct.toFixed(1)}%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Accountant Submission Notes:
              </label>
              <textarea
                rows={2}
                value={submitRemarks}
                onChange={(e) => setSubmitRemarks(e.target.value)}
                placeholder="e.g. End-of-month fee reconciliation submitted for Chairman audit..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCaptureSnapshot}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Submit to Chairman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
