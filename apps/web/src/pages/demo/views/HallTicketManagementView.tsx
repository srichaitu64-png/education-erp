import React, { useState } from 'react';
import { 
  FileText, QrCode, Printer, Download, CheckCircle2, AlertCircle, 
  ShieldCheck, Search, Filter, Layers, User, Calendar
} from 'lucide-react';
import { useDemoStore, HallTicketModel } from '../../../store/demoStore';

interface HallTicketManagementViewProps {
  onOpenStudent360?: (studentOrId: any) => void;
}

export const HallTicketManagementView: React.FC<HallTicketManagementViewProps> = ({ onOpenStudent360 }) => {
  const { hallTickets, students, generateHallTicketsForClass, currentRole } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'ISSUED_TICKETS' | 'GENERATE_WIZARD' | 'PREVIEW_CARD'>('ISSUED_TICKETS');
  const [selectedTicket, setSelectedTicket] = useState<HallTicketModel>(hallTickets[0] || null);

  // Generation Wizard Form States
  const [examTitle, setExamTitle] = useState('Mid-Term Institutional Examination 2026');
  const [targetClass, setTargetClass] = useState('I PUC');
  const [targetSection, setTargetSection] = useState('A');
  const [enforceFeeClearance, setEnforceFeeClearance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = hallTickets.filter(t => 
    t.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = generateHallTicketsForClass({
      examTitle,
      className: targetClass,
      sectionCode: targetSection,
      enforceFeeClearance
    });
    alert(`Generated ${res.count} hall tickets for ${targetClass} Section ${targetSection}. All QR verification tokens active.`);
    if (res.tickets.length > 0) {
      setSelectedTicket(res.tickets[0]);
    }
    setActiveTab('ISSUED_TICKETS');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadZip = () => {
    alert(`Packaging ${filteredTickets.length} individual hall tickets with QR signatures into hall_tickets_batch.zip. Download started.`);
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans text-[#172B4D]">
      {/* Header Banner */}
      <div className="bg-[#172B4D] text-white p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Examination Credentials Engine
            </span>
            <span className="text-xs text-slate-300">Tenant-Safe QR Verification • Bulk PDF & ZIP Printing</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Examination Hall Ticket Generation & Verification</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Individual & Bulk Generation • Photo & Seat Roster • Configurable Fee & Attendance Eligibility Gate
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('GENERATE_WIZARD')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            + Generate Batch Tickets
          </button>
          <button
            onClick={handleDownloadZip}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Batch ZIP
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hall Tickets Issued</p>
          <p className="text-2xl font-black text-[#172B4D] mt-1">{hallTickets.length}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Active examination credentials</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligible Candidates</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {hallTickets.filter(t => t.eligibility_status === 'ELIGIBLE').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Attendance & enrollment verified</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Fee Clearance</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {hallTickets.filter(t => t.eligibility_status === 'PENDING_FEE_APPROVAL').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Authorised exception workflow</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">QR Tokens Active</p>
          <p className="text-2xl font-black text-purple-600 mt-1">100%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Encrypted gate scanner ready</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('ISSUED_TICKETS')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'ISSUED_TICKETS' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Issued Tickets Registry ({filteredTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('PREVIEW_CARD')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'PREVIEW_CARD' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          Printable Hall Ticket Preview
        </button>
        <button
          onClick={() => setActiveTab('GENERATE_WIZARD')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'GENERATE_WIZARD' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Batch Generation Wizard
        </button>
      </div>

      {/* TAB 1: ISSUED TICKETS TABLE */}
      {activeTab === 'ISSUED_TICKETS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Active Examination Hall Tickets Register</span>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket #, student name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Ticket #</th>
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">Class & Section</th>
                    <th className="p-3.5">Examination Title</th>
                    <th className="p-3.5">Hall & Seat</th>
                    <th className="p-3.5">Eligibility Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTickets.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-600">{t.ticket_number}</td>
                      <td className="p-3.5 font-bold text-[#172B4D]">
                        <button
                          type="button"
                          onClick={() => {
                            const found = students.find(s => s.admission_number === t.admission_number || `${s.first_name} ${s.last_name}` === t.student_name);
                            onOpenStudent360?.(found || t.student_name);
                          }}
                          className="text-left group cursor-pointer inline-flex flex-col"
                          title="Click to inspect Student 360° Profile"
                        >
                          <span className="font-bold text-[#172B4D] group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {t.student_name}
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              360°
                            </span>
                          </span>
                          <span className="block text-[10px] text-slate-400 font-normal">{t.admission_number}</span>
                        </button>
                      </td>
                      <td className="p-3.5 font-bold text-[#172B4D]">
                        {t.class_name} - Section {t.section_code}
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium max-w-xs truncate">{t.exam_title}</td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {t.room_number} • <strong className="text-blue-700">{t.seat_number}</strong>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.eligibility_status === 'ELIGIBLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {t.eligibility_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setActiveTab('PREVIEW_CARD');
                          }}
                          className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          View & Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRINTABLE HALL TICKET PREVIEW */}
      {activeTab === 'PREVIEW_CARD' && selectedTicket && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Printable Hall Ticket View (Official Examination Pass)</span>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Hall Ticket (A4)
            </button>
          </div>

          {/* Official A4 Card Layout */}
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-800 max-w-3xl mx-auto shadow-md space-y-6 text-[#172B4D]">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#172B4D] text-white flex items-center justify-center font-black text-xl">
                  A
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-wide uppercase">Akshara Global Composite Group</h2>
                  <p className="text-xs text-slate-600 font-semibold">Affiliated to Karnataka Pre-University Examination Board & CBSE</p>
                  <p className="text-[11px] text-slate-500">School & College Campus • Institutional Exam Hall Ticket</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 font-mono font-bold text-xs rounded border border-blue-300">
                  {selectedTicket.ticket_number}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">Academic Year 2026–2027</span>
              </div>
            </div>

            {/* Candidate & Seat Details */}
            <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="col-span-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Candidate Name</span>
                  <strong className="text-sm text-[#172B4D]">{selectedTicket.student_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Admission Number</span>
                  <strong className="font-mono text-[#172B4D]">{selectedTicket.admission_number}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Class & Section</span>
                  <strong className="text-[#172B4D]">{selectedTicket.class_name} - Section {selectedTicket.section_code}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Allocated Seat & Room</span>
                  <strong className="text-blue-700 font-black">{selectedTicket.room_number} • {selectedTicket.seat_number}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Examination Centre</span>
                  <span className="text-slate-700 font-semibold">{selectedTicket.exam_centre}</span>
                </div>
              </div>

              {/* Photo Box */}
              <div className="col-span-1 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-2 text-center bg-white">
                <User className="w-10 h-10 text-slate-400 mb-1" />
                <span className="text-[9px] text-slate-400 font-bold uppercase">Candidate Photograph</span>
              </div>
            </div>

            {/* Timetable Table */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Subject Examination Timetable</h3>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Subject Paper</th>
                    <th className="p-2.5">Room</th>
                    <th className="p-2.5">Candidate Signature</th>
                    <th className="p-2.5">Invigilator Initial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedTicket.timetable.map((sub, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-mono text-slate-700">{sub.date}</td>
                      <td className="p-2.5 font-mono text-slate-600">{sub.time}</td>
                      <td className="p-2.5 font-bold text-[#172B4D]">{sub.subject}</td>
                      <td className="p-2.5 text-slate-600 font-mono">{sub.room}</td>
                      <td className="p-2.5 border-b border-slate-200"></td>
                      <td className="p-2.5 border-b border-slate-200"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QR Code Verification & Signatures */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-300">
                  <QrCode className="w-14 h-14 text-slate-800" />
                </div>
                <div className="text-[11px] text-slate-500 max-w-xs">
                  <span className="font-bold text-slate-700 block">Digital Verification QR Token</span>
                  Scan at campus entry turnstiles for biometric/barcode seat clearance.
                  <span className="block font-mono text-[9px] text-slate-400 mt-0.5 truncate">{selectedTicket.qr_code_signature}</span>
                </div>
              </div>
              <div className="text-right space-y-3">
                <div className="inline-block border-b-2 border-slate-800 w-40 text-center pb-1">
                  <span className="font-serif italic text-sm font-bold text-blue-900">Dr. V. Murthy</span>
                </div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Controller of Examinations / Principal
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BATCH GENERATION WIZARD */}
      {activeTab === 'GENERATE_WIZARD' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-[#172B4D]">Batch Hall Ticket Generation Wizard</h3>
          <p className="text-xs text-slate-500">
            Generate hall tickets in bulk for an entire class or section. All tickets receive cryptographic QR signatures.
          </p>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Institutional Examination</label>
              <select
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
              >
                <option value="Mid-Term Institutional Examination 2026">Mid-Term Institutional Examination 2026</option>
                <option value="NEET Foundation Test Series #3">NEET Foundation Test Series #3</option>
                <option value="JEE Main Full Mock Exam">JEE Main Full Mock Exam</option>
                <option value="Class 10 CBSE Board Preparatory">Class 10 CBSE Board Preparatory</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Class</label>
                <select
                  value={targetClass}
                  onChange={e => setTargetClass(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                >
                  <option value="I PUC">I PUC</option>
                  <option value="II PUC">II PUC</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 10">Class 10</option>
                  <option value="B.Sc (CS)">B.Sc (CS)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Section</label>
                <select
                  value={targetSection}
                  onChange={e => setTargetSection(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                  <option value="E">Section E</option>
                  <option value="F">Section F</option>
                </select>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforceFeeClearance}
                  onChange={e => setEnforceFeeClearance(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Enforce Fee Clearance Eligibility Policy (Configurable by Institution)
              </label>
              <p className="text-[11px] text-slate-500 mt-1 italic">
                If checked, students with unpaid fee balances will be flagged as 'PENDING_FEE_APPROVAL' and will require an authorised Principal/Accountant exemption pass.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white transition-colors cursor-pointer"
              >
                Execute Batch Generation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ISSUED_TICKETS')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

