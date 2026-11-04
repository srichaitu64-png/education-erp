import sys

path = 'apps/web/src/pages/demo/InteractiveDemoPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# View 1: Institution Control Centre
inst_control_centre_code = """
          {/* ================================================================= */}
          {/* INSTITUTION MANAGEMENT CONTROL CENTRE (Chairman / Director) */}
          {/* ================================================================= */}
          {activeTab === 'institution-control-centre' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-purple-950/40 p-6 rounded-2xl border border-purple-800/60">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40 mb-2">
                    <Building2 className="w-3 h-3" />
                    Institution Super Admin Control Room
                  </div>
                  <h1 className="text-2xl font-black text-white">Institution Management & Governance Centre</h1>
                  <p className="text-xs text-purple-200 mt-1">
                    Chairman & Director Executive Suite • Staff Role Delegations • Central Permission Matrix • Strategic Financial Oversight
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-900/60 text-purple-200 border border-purple-700 text-xs font-bold">
                    Akshara Global Educational Trust
                  </span>
                </div>
              </div>

              {/* Executive Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Enrolled Students</span>
                  <p className="text-2xl font-black text-white mt-1">1,396</p>
                  <p className="text-xs text-slate-400 mt-0.5">School (680) • PU College (480) • Degree (236)</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Gross Fee Realisation</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">₹85.4 Lakhs</p>
                  <p className="text-xs text-slate-400 mt-0.5">77.6% of ₹1.10 Cr target collected</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Faculty & Non-Teaching Staff</span>
                  <p className="text-2xl font-black text-blue-400 mt-1">84 Staff</p>
                  <p className="text-xs text-slate-400 mt-0.5">58 Teaching • 26 Administrative & Support</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">NEET & Board Projection</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">98.4% Pass</p>
                  <p className="text-xs text-slate-400 mt-0.5">62 Students targeting NEET &gt; 580+</p>
                </div>
              </div>

              {/* Chairman Executive Direct Actions */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  Institutional Super Admin Governance Capabilities
                </h3>
                <p className="text-xs text-slate-400">
                  As Chairman / Director, you hold institutional authority. Principal handles daily academic operations and exam approvals, while you control users, custom roles, campus permissions, custom fee heads, and dashboard layouts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                      <Key className="w-4 h-4" />
                      Central Permission Matrix
                    </div>
                    <p className="text-xs text-slate-400">
                      Configure granular action permissions (view, edit, approve, collect, publish) for all 18 institutional roles.
                    </p>
                    <button
                      onClick={() => setActiveTab('permissions-centre')}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Open Permission Matrix →
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                      <Layout className="w-4 h-4" />
                      Dynamic Dashboard Designer
                    </div>
                    <p className="text-xs text-slate-400">
                      Control which sidebar menus are visible, locked, or completely hidden for Teachers, Students, and Parents.
                    </p>
                    <button
                      onClick={() => setActiveTab('dashboard-designer')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Open Dashboard Designer →
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <CreditCard className="w-4 h-4" />
                      Financial Ledger & Statements
                    </div>
                    <p className="text-xs text-slate-400">
                      Review consolidated fee statements, audit ₹50k + ₹30k partial payments, and inspect receipt histories.
                    </p>
                    <button
                      onClick={() => { setActiveTab('fees'); setFeeSubTab('statement'); }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Consolidated Ledger →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
"""

anchor_perm = "{activeTab === 'permissions-centre' && ("
content = content.replace(anchor_perm, inst_control_centre_code + "\n          " + anchor_perm)

# View 2: Statement sub-tab in Fees (Acceptance test for Rahul Kumar ₹50k + ₹30k)
statement_view_code = """              {/* ============================================================= */}
              {/* SUB-TAB 0: CONSOLIDATED STUDENT FEE STATEMENT & ACCEPTANCE TEST */}
              {/* ============================================================= */}
              {feeSubTab === 'statement' && (() => {
                const statement = getStudentConsolidatedStatement(selectedStatementStudentId);
                const testState = acceptanceTestState;

                const handleRunPayment1 = () => {
                  const receipt = runAcceptanceTestPayment1();
                  setAcceptanceTestFeedback('Step 1 Complete: Payment 1 (₹50,000) successfully processed! Receipt REC-2026-00125 generated.');
                  setActiveReceiptForModal(receipt);
                  setTimeout(() => setAcceptanceTestFeedback(null), 6000);
                };

                const handleRunPayment2 = () => {
                  const receipt = runAcceptanceTestPayment2();
                  setAcceptanceTestFeedback('Step 2 Complete: Payment 2 (₹30,000) processed! Receipt REC-2026-00126 generated. Receipt REC-2026-00125 preserved intact!');
                  setActiveReceiptForModal(receipt);
                  setTimeout(() => setAcceptanceTestFeedback(null), 6000);
                };

                const handleResetTest = () => {
                  resetAcceptanceTest();
                  setAcceptanceTestFeedback('Acceptance test state reset to initial unpaid baseline (₹1,50,000 Due).');
                  setTimeout(() => setAcceptanceTestFeedback(null), 4000);
                };

                return (
                  <div className="space-y-6">
                    {/* Feedback Toast */}
                    {acceptanceTestFeedback && (
                      <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center justify-between">
                        <span>{acceptanceTestFeedback}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[10px]">VERIFIED</span>
                      </div>
                    )}

                    {/* Acceptance Test Control Banner */}
                    <div className="bg-slate-950 p-6 rounded-2xl border-2 border-blue-500/40 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 mb-1">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                            Official Architecture Acceptance Test Runner
                          </div>
                          <h2 className="text-xl font-black text-white">
                            Two-Payment Dynamic Recalculation Acceptance Test (Rahul Kumar)
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Demonstrates individual payment receipts, persistent receipt preservation, and consolidated fee statement recalculation.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            testState.stage === 'STAGE_2_PAID_30K'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : testState.stage === 'STAGE_1_PAID_50K'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {testState.stage === 'STAGE_2_PAID_30K' ? 'Payment 1 & 2 Both Paid (Balance ₹70,000)' : testState.stage === 'STAGE_1_PAID_50K' ? 'Payment 1 Paid (Balance ₹1,00,000)' : 'Initial State (Balance ₹1,50,000)'}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Step-by-Step Test Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                          onClick={handleRunPayment1}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          ▶ Step 1: Simulate Payment 1 (₹50,000)
                        </button>
                        <button
                          onClick={handleRunPayment2}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          ▶ Step 2: Simulate Payment 2 (₹30,000)
                        </button>
                        <button
                          onClick={handleResetTest}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset to Initial State (₹0 Paid)
                        </button>
                      </div>

                      {/* 4 Accountant Operations Buttons */}
                      <div className="border-t border-slate-800/80 pt-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                          Mandatory Accountant Action Suite:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              const targetReceipt = testState.generatedReceipts[testState.generatedReceipts.length - 1] || receipts[0];
                              setActiveReceiptForModal(targetReceipt);
                              setShowReceiptModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-blue-400" />
                            1. View / Print Individual Receipt
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            2. Generate Consolidated Fee Statement
                          </button>
                          <button
                            onClick={() => {
                              alert(`Term-wise Fee History for ${statement.studentName}:\\nTerm 1 (June-Aug): ₹85,000 due, Paid ₹50,000 (REC-2026-00125)\\nTerm 2 (Sept-Nov): ₹65,000 due, Paid ₹30,000 (REC-2026-00126)\\nRemaining Total Balance: ₹70,000`);
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            3. Term-wise Fee History
                          </button>
                          <button
                            onClick={() => {
                              alert(`FEE DUE NOTICE GENERATED\\nStudent: ${statement.studentName} (${statement.admissionNumber})\\nParent: ${statement.parentName}\\nTotal Outstanding Due: ₹${statement.totalBalanceDue.toLocaleString('en-IN')}\\nNotice dispatched to registered phone: +91 98450 99887`);
                            }}
                            className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            4. Generate Fee Due Statement
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Student Selection Header & Details */}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Select Student for Consolidated Financial Statement:
                          </label>
                          <select
                            value={selectedStatementStudentId}
                            onChange={(e) => setSelectedStatementStudentId(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white font-bold text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="st-rahul">Rahul Kumar (AKG-2026-0152 • I PUC PCMB • Acceptance Test Student)</option>
                            <option value="st-2">Ananya Hegde (ADM-2026-002 • I PUC PCMB)</option>
                            <option value="st-1">Aarav Sharma (ADM-2026-001 • Class 10-A)</option>
                            <option value="st-3">Rohan Verma (ADM-2026-003 • B.Sc Computer Science)</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Parent / Guardian:</span>
                            <span className="text-white font-bold">{statement.parentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Course & Stream:</span>
                            <span className="text-white font-bold">{statement.courseClass} - {statement.sectionOrStream}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Session:</span>
                            <span className="text-white font-bold">{statement.academicYear}</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial KPI Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 uppercase font-bold">Total Annual Fee</span>
                          <p className="text-2xl font-black text-white mt-1">₹{statement.totalAnnualFee.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Approved annual institutional schedule</p>
                        </div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 uppercase font-bold">Total Amount Paid</span>
                          <p className="text-2xl font-black text-emerald-400 mt-1">₹{statement.totalPaid.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Realised across {statement.receiptHistory.length} confirmed receipts</p>
                        </div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 uppercase font-bold">Outstanding Balance Due</span>
                          <p className={`text-2xl font-black mt-1 ${statement.totalBalanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            ₹{statement.totalBalanceDue.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Status: {statement.paymentStatus}</p>
                        </div>
                      </div>

                      {/* Fee-Head Allocation Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Fee Head / Description</th>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3 text-right">Annual Fee</th>
                              <th className="px-4 py-3 text-right">Term 1 Due</th>
                              <th className="px-4 py-3 text-right">Term 2 Due</th>
                              <th className="px-4 py-3 text-right">Total Paid</th>
                              <th className="px-4 py-3 text-right">Outstanding Balance</th>
                              <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {statement.feeHeads.map((head) => (
                              <tr key={head.feeHeadId} className="hover:bg-slate-900/60">
                                <td className="px-4 py-3 font-bold text-white">{head.feeHeadName}</td>
                                <td className="px-4 py-3 text-slate-400">{head.category}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-200">₹{head.annualFee.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-400">₹{head.term1Due.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-400">₹{head.term2Due.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">₹{head.paidAmount.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-mono text-amber-400 font-bold">₹{head.balanceDue.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    head.status === 'PAID' ? 'bg-emerald-950 text-emerald-300' : head.status === 'PARTIAL' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                                  }`}>
                                    {head.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-slate-900 font-black border-t-2 border-slate-700">
                              <td colSpan={2} className="px-4 py-3.5 text-white uppercase tracking-wider text-xs">Total Consolidated Account</td>
                              <td className="px-4 py-3.5 text-right font-mono text-white text-sm">₹{statement.totalAnnualFee.toLocaleString('en-IN')}</td>
                              <td colSpan={2} className="px-4 py-3.5 text-slate-400 text-center text-[10px]">Installments Active</td>
                              <td className="px-4 py-3.5 text-right font-mono text-emerald-400 text-sm">₹{statement.totalPaid.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3.5 text-right font-mono text-amber-400 text-sm">₹{statement.totalBalanceDue.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-900 text-blue-200">
                                  {statement.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Linked Payment Receipts History Table */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Receipt className="w-3.5 h-3.5 text-blue-400" />
                          Permanent Payment Receipts Linked to this Student ({statement.receiptHistory.length})
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                              <tr>
                                <th className="px-4 py-2.5">Receipt #</th>
                                <th className="px-4 py-2.5">Payment Date</th>
                                <th className="px-4 py-2.5">Method & Reference</th>
                                <th className="px-4 py-2.5">Fee Allocations Breakdown</th>
                                <th className="px-4 py-2.5 text-right">Amount Received</th>
                                <th className="px-4 py-2.5 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                              {statement.receiptHistory.map((rcp) => (
                                <tr key={rcp.id} className="hover:bg-slate-900/60">
                                  <td className="px-4 py-3 font-mono font-bold text-blue-400">{rcp.receipt_number}</td>
                                  <td className="px-4 py-3 text-slate-300">{rcp.payment_date}</td>
                                  <td className="px-4 py-3 text-slate-300">
                                    <span className="font-semibold text-white">{rcp.payment_method}</span>
                                    <span className="block text-[10px] text-slate-500 font-mono">{rcp.transaction_reference}</span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    <div className="flex flex-wrap gap-1">
                                      {rcp.allocations.map((a, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                                          {a.title}: <strong className="text-emerald-400">₹{a.allocated.toLocaleString('en-IN')}</strong>
                                        </span>
                                      ))}
                                    </div>
                                    <span className="block text-[10px] text-slate-500 italic mt-0.5">
                                      Words: {rcp.amount_in_words || 'Confirmed in full'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">
                                    ₹{rcp.amount_paid.toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => {
                                        setActiveReceiptForModal(rcp);
                                        setShowReceiptModal(true);
                                      }}
                                      className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      View / Print
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
"""

anchor_fee_sub = "{feeSubTab === 'collection' && ("
content = content.replace(anchor_fee_sub, statement_view_code + "\n              " + anchor_fee_sub)

# View 3: Student Progress Cards View
progress_cards_view_code = """
          {/* ================================================================= */}
          {/* TAB 4B: ADVANCED STUDENT PROGRESS CARDS & ACADEMIC ANALYTICS */}
          {/* ================================================================= */}
          {activeTab === 'progress-cards' && (() => {
            const indCard = individualProgressCards[0];
            const consCard = consolidatedProgressCards[0];
            const compRep = competitiveReports[0];

            return (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <h1 className="text-2xl font-black text-white">Advanced Student Progress Cards & Academic Analytics</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Multi-Exam Report Cards • Annual Consolidated Trajectory • NEET & JEE Foundation Analytics
                    </p>
                  </div>

                  {/* Sub-tab pills */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setProgressCardSubTab('individual')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        progressCardSubTab === 'individual'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      Individual Exam Card
                    </button>
                    <button
                      onClick={() => setProgressCardSubTab('consolidated')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        progressCardSubTab === 'consolidated'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Annual Trajectory (+13%)
                    </button>
                    <button
                      onClick={() => setProgressCardSubTab('competitive')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        progressCardSubTab === 'competitive'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      NEET Foundation Analytics
                    </button>
                  </div>
                </div>

                {/* Sub-tab 1: Individual Exam Progress Card */}
                {progressCardSubTab === 'individual' && indCard && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                          Official Term Assessment Report Card
                        </span>
                        <h2 className="text-xl font-black text-white mt-0.5">{indCard.examName}</h2>
                        <p className="text-xs text-slate-400">
                          Academic Session: {indCard.academicYear} • Class: {indCard.className}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Student: <strong className="text-white">{indCard.studentName}</strong></span>
                        <span className="text-xs text-slate-400 block font-mono">Admission #: {indCard.admissionNumber}</span>
                        <span className="text-xs text-emerald-400 font-bold block">Class Attendance: {indCard.attendancePct}%</span>
                      </div>
                    </div>

                    {/* Marks Breakdown Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3 text-right">Theory (Max)</th>
                            <th className="px-4 py-3 text-right">Practical (Max)</th>
                            <th className="px-4 py-3 text-right">Total Obtained</th>
                            <th className="px-4 py-3 text-center">Grade</th>
                            <th className="px-4 py-3">Teacher Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {indCard.subjects.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="px-4 py-3 font-bold text-white">{sub.subjectName}</td>
                              <td className="px-4 py-3 text-right font-mono text-slate-300">{sub.theoryObtained} / {sub.theoryMax}</td>
                              <td className="px-4 py-3 text-right font-mono text-slate-300">{sub.practicalMax > 0 ? `${sub.practicalObtained} / ${sub.practicalMax}` : '-'}</td>
                              <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">
                                {sub.totalObtained} / {sub.totalMax}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-black text-[11px]">
                                  {sub.grade}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 text-[11px]">{sub.remarks}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-900 font-black border-t-2 border-slate-700">
                            <td className="px-4 py-3 text-white uppercase tracking-wider">Grand Total</td>
                            <td colSpan={2} className="px-4 py-3 text-center text-slate-400 text-xs">Four Core Disciplines</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-400 text-base font-black">
                              {indCard.totalObtained} / {indCard.totalMax}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2.5 py-0.5 rounded bg-blue-900 text-blue-200 font-black text-xs">
                                {indCard.overallPercentage}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-emerald-300 font-bold">{indCard.overallGrade}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Teacher Remarks & Approval Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Class Teacher Remarks:</span>
                        <p className="text-xs text-slate-200 italic">"{indCard.teacherRemarks}"</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Exam Controller Verification:</span>
                          <span className="text-xs font-bold text-white block mt-1">{indCard.controllerVerifiedBy}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Stage 2 Audit Passed</span>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Principal Approval Seal:</span>
                          <span className="text-xs font-bold text-white block mt-1">{indCard.principalApprovedBy}</span>
                          <span className="text-[10px] text-blue-400 font-mono">Stage 3 Officially Sealed</span>
                        </div>
                        <Award className="w-6 h-6 text-blue-400 shrink-0" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Annual Trajectory (+13% Gain) */}
                {progressCardSubTab === 'consolidated' && consCard && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="text-xl font-black text-white">Consolidated Annual Academic Trajectory</h2>
                        <p className="text-xs text-slate-400">
                          Student: <strong className="text-white">{consCard.studentName}</strong> • Class: {consCard.className} • Overall GPA: <strong className="text-emerald-400">{consCard.overallGpa}</strong>
                        </p>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Net Gain: +{consCard.netGainPercentagePoints}% Improvement
                      </div>
                    </div>

                    {/* Progression Timeline Chart Simulation */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {consCard.trajectoryTrend.map((t, idx) => (
                        <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.examName}</span>
                          <p className="text-2xl font-black text-white mt-1">{t.percentage}%</p>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{t.date}</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${t.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Academic Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Class Attendance</span>
                        <p className="text-xl font-black text-emerald-400 mt-1">{consCard.overallAttendancePct}%</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Regularity benchmark achieved</p>
                      </div>
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Practical Lab Proficiency</span>
                        <p className="text-xl font-black text-blue-400 mt-1">{consCard.practicalProficiencyPct}%</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Physics & Chemistry practical logbooks</p>
                      </div>
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Assignments & Homework</span>
                        <p className="text-xl font-black text-purple-400 mt-1">{consCard.assignmentsScore}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Continuous assessment record</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 3: NEET Foundation Analytics */}
                {progressCardSubTab === 'competitive' && compRep && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-1">
                          {compRep.programme}
                        </div>
                        <h2 className="text-xl font-black text-white">{compRep.testName}</h2>
                        <p className="text-xs text-slate-400">
                          Student: <strong className="text-white">{compRep.studentName}</strong> ({compRep.admissionNumber})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-400 block">{compRep.netScore} / {compRep.totalMarks}</span>
                        <span className="text-xs text-slate-400">Percentile: <strong className="text-white">{compRep.percentileEstimate}th %tile</strong></span>
                      </div>
                    </div>

                    {/* Question Attempt Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Questions</span>
                        <p className="text-2xl font-black text-white mt-1">{compRep.totalQuestions}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Physics, Chem, Botany, Zoo</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">Correct Answers (+4)</span>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{compRep.correctAnswers}</p>
                        <p className="text-[10px] text-emerald-300 mt-0.5">+{compRep.correctMarks} Marks</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-rose-400 block">Incorrect (-1)</span>
                        <p className="text-2xl font-black text-rose-400 mt-1">{compRep.incorrectAnswers}</p>
                        <p className="text-[10px] text-rose-300 mt-0.5">{compRep.negativeMarks} Negative Marks</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy Ratio</span>
                        <p className="text-2xl font-black text-amber-400 mt-1">{compRep.accuracyPct}%</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Unattempted: {compRep.unattemptedQuestions}</p>
                      </div>
                    </div>

                    {/* Subject Breakdown Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-2.5">Subject Section</th>
                            <th className="px-4 py-2.5 text-center">Questions</th>
                            <th className="px-4 py-2.5 text-center">Correct</th>
                            <th className="px-4 py-2.5 text-center">Incorrect</th>
                            <th className="px-4 py-2.5 text-right">Net Score</th>
                            <th className="px-4 py-2.5 text-right">Accuracy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {compRep.subjectBreakdown.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="px-4 py-3 font-bold text-white">{s.subject}</td>
                              <td className="px-4 py-3 text-center text-slate-300">{s.questions}</td>
                              <td className="px-4 py-3 text-center text-emerald-400 font-bold">{s.correct}</td>
                              <td className="px-4 py-3 text-center text-rose-400 font-bold">{s.incorrect}</td>
                              <td className="px-4 py-3 text-right font-mono font-black text-emerald-400">{s.netMarks} / 180</td>
                              <td className="px-4 py-3 text-right font-mono text-slate-300 font-bold">{s.accuracyPct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
"""

anchor_login = "{activeTab === 'institution-login' && ("
content = content.replace(anchor_login, progress_cards_view_code + "\n          " + anchor_login)

# View 4: Data Migration Centre View
migration_view_code = """
          {/* ================================================================= */}
          {/* TAB 7B: SMART DATA MIGRATION & BULK INGEST CENTRE */}
          {/* ================================================================= */}
          {activeTab === 'data-migration' && (() => {
            const batch = migrationBatches[0];

            const handleExecute = () => {
              const res = executeMigrationBatch(batch.id);
              setMigrationFeedback(res.message);
              setTimeout(() => setMigrationFeedback(null), 6000);
            };

            return (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <h1 className="text-2xl font-black text-white">Smart Data Migration & Bulk Ingest Centre</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Multi-Format Ingestion (XLSX, CSV, PDF OCR) • Smart Column Alias Mapping • Duplicate Resolution Engine
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-900/40 text-blue-300 border border-blue-700/60 text-xs font-bold">
                      Zero Data-Loss Migration Engine
                    </span>
                  </div>
                </div>

                {/* Sync Feedback Toast */}
                {migrationFeedback && (
                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center justify-between">
                    <span>{migrationFeedback}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[10px]">MIGRATION COMMITTED</span>
                  </div>
                )}

                {/* 5-Step Progress Bar */}
                <div className="grid grid-cols-5 gap-2 text-xs font-bold text-center">
                  {[
                    { step: 1, title: '1. Upload File' },
                    { step: 2, title: '2. Column Mapping' },
                    { step: 3, title: '3. Duplicate Resolution' },
                    { step: 4, title: '4. Preview Validation' },
                    { step: 5, title: '5. Ingest Execution' },
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => setMigrationStep(s.step)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        migrationStep === s.step
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>

                {/* Wizard Step 1: Upload Source Data */}
                {migrationStep === 1 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 1: Upload Source Master File</h3>
                    <p className="text-xs text-slate-400">
                      Supported formats: Excel (.xlsx, .xls), CSV (.csv), Word (.docx), Scanned PDF (OCR Extraction), and JSON.
                    </p>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center space-y-3 bg-slate-900/40">
                      <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                      <div>
                        <p className="text-sm font-bold text-white">Active Ingest File: {batch.fileName}</p>
                        <p className="text-xs text-slate-400">Format: {batch.fileFormat} • Total Records: {batch.totalRecords.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => setMigrationStep(2)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                      >
                        Proceed to Column Mapping →
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Step 2: Intelligent Column Mapping */}
                {migrationStep === 2 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 2: Smart Column Alias Mapping</h3>
                    <p className="text-xs text-slate-400">
                      The migration engine automatically matches non-standard legacy header names to institutional ERP fields.
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Legacy Source Header</th>
                            <th className="px-4 py-3">Mapped Target Field</th>
                            <th className="px-4 py-3">Match Confidence</th>
                            <th className="px-4 py-3">Sample Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {batch.columnMappings.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="px-4 py-3 font-mono font-bold text-amber-300">{m.sourceHeader}</td>
                              <td className="px-4 py-3 font-bold text-blue-400">{m.targetField}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">
                                  {(m.confidence * 100).toFixed(0)}% MATCH
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">{m.sampleValue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMigrationStep(3)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Proceed to Duplicate Resolution →
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Step 3: Identity Resolution & Duplicate Prevention */}
                {migrationStep === 3 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 3: Identity Resolution & Duplicate Candidates</h3>
                    <p className="text-xs text-slate-400">
                      Detected 12 exact duplicates and 8 probable matches against existing enrolled students.
                    </p>
                    <div className="space-y-3">
                      {batch.duplicateCandidates.map((c) => (
                        <div key={c.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.matchType === 'EXACT_DUPLICATE' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                            }`}>
                              {c.matchType}
                            </span>
                            <p className="font-bold text-white text-sm mt-1">Source Row #{c.sourceRow}: {c.sourceName} ({c.sourceAdmissionNo})</p>
                            <p className="text-slate-400 text-[11px]">Matches Existing: {c.existingRecordName} • Phone: {c.sourcePhone}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => resolveMigrationCandidate(batch.id, c.id, 'SKIP')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                                c.resolvedAction === 'SKIP' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              Skip
                            </button>
                            <button
                              onClick={() => resolveMigrationCandidate(batch.id, c.id, 'MERGE')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                                c.resolvedAction === 'MERGE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              Merge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMigrationStep(4)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Proceed to Validation Preview →
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Step 4: Validation Preview */}
                {migrationStep === 4 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 4: Pre-Commit Validation Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Total Ingest Records</span>
                        <p className="text-2xl font-black text-white mt-1">{batch.totalRecords}</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">Clean New Admissions</span>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{batch.cleanNewRecordsCount}</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-amber-400 uppercase font-bold">Resolved Duplicates</span>
                        <p className="text-2xl font-black text-amber-400 mt-1">{batch.exactMatchesCount + batch.probableMatchesCount}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMigrationStep(5)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Proceed to Ingest Execution →
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Step 5: Ingest Execution & Audit */}
                {migrationStep === 5 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h3 className="text-lg font-black text-white">Ready for Production Ingestion</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All validation checks passed with zero integrity errors. Clicking execute will import {batch.cleanNewRecordsCount} student records with opening balances.
                    </p>
                    <button
                      onClick={handleExecute}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-600/30"
                    >
                      Execute Migration Batch Now
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
"""

anchor_transport = "{activeTab === 'transport' && ("
content = content.replace(anchor_transport, migration_view_code + "\n          " + anchor_transport)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("All views injected successfully into InteractiveDemoPage.")

