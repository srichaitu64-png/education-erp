import sys

path = 'apps/web/src/pages/demo/InteractiveDemoPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update sub-tabs in Fee Management
old_fee_pills = """                {/* Sub-Tab Navigation Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setFeeSubTab('collection')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'collection'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Fee Collection
                  </button>"""

new_fee_pills = """                {/* Sub-Tab Navigation Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setFeeSubTab('statement')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'statement'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Consolidated Statement (Acceptance Test)
                  </button>
                  <button
                    onClick={() => setFeeSubTab('collection')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'collection'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Fee Collection
                  </button>"""

content = content.replace(old_fee_pills, new_fee_pills)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fee pills updated.")
