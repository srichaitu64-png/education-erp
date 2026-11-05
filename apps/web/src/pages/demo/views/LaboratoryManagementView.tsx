import React, { useState } from 'react';
import {
  FlaskConical,
  QrCode,
  Printer,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Wrench,
  FileSpreadsheet,
  PackageCheck,
  Download,
  Eye,
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  useDemoStore,
  LaboratoryModel,
  LabInventoryItem,
  LabStockMovement,
  LabExperiment,
  LabItemCategory
} from '../../../store/demoStore';

export const LaboratoryManagementView: React.FC = () => {
  const {
    laboratories,
    labInventory,
    labMovements,
    labExperiments,
    activeLabFilter,
    setActiveLabFilter,
    addLabItem,
    issueLabItem,
    returnLabItem,
    recordMaintenance,
    verifyPhysicalStock
  } = useDemoStore();

  const [subTab, setSubTab] = useState<'inventory' | 'qr_scanner' | 'movements' | 'maintenance' | 'experiments'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | LabItemCategory>('ALL');

  // Selected item for QR Inspection & Actions
  const [selectedItemForQR, setSelectedItemForQR] = useState<LabInventoryItem>(labInventory[0]);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // Issue / Return Modal / Form State
  const [issueQuantity, setIssueQuantity] = useState(1);
  const [issueRequester, setIssueRequester] = useState('Dr. V. Murthy (Physics HOD)');
  const [issuePurpose, setIssuePurpose] = useState('PU II Practical Class: Prism Dispersion & Spectrometry');
  const [actionFeedback, setActionFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemLabId, setNewItemLabId] = useState('LAB-PHY-01');
  const [newItemCategory, setNewItemCategory] = useState<LabItemCategory>('REUSABLE_EQUIPMENT');
  const [newItemLocation, setNewItemLocation] = useState('Shelf A-3');
  const [newItemUnit, setNewItemUnit] = useState('Units');
  const [newItemStock, setNewItemStock] = useState(10);
  const [newItemMinStock, setNewItemMinStock] = useState(3);
  const [newItemPrice, setNewItemPrice] = useState(1200);
  const [newItemManufacturer, setNewItemManufacturer] = useState('Sigma-Aldrich India');

  // Filtered Inventory
  const filteredItems = labInventory.filter(item => {
    const matchesLab = activeLabFilter === 'ALL' || item.labId === activeLabFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLab && matchesCategory && matchesSearch;
  });

  const totalInventoryValue = labInventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = labInventory.filter(item => item.currentStock <= item.minStockLevel);
  const maintenanceItems = labInventory.filter(item => item.condition === 'CALIBRATION_DUE' || item.condition === 'UNDER_MAINTENANCE');

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForQR) return;
    const res = issueLabItem(selectedItemForQR.id, issueQuantity, issueRequester, issuePurpose);
    setActionFeedback(res);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleReturnSubmit = (returnedQty: number, consumedQty: number) => {
    if (!selectedItemForQR) return;
    const res = returnLabItem(selectedItemForQR.id, returnedQty, consumedQty);
    setActionFeedback(res);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const newId = `ITEM-${newItemLabId.split('-')[1]}-${String(Math.floor(100 + Math.random() * 900))}`;
    const newItem: LabInventoryItem = {
      id: newId,
      name: newItemName,
      labId: newItemLabId,
      category: newItemCategory,
      storageLocation: newItemLocation,
      unit: newItemUnit,
      currentStock: newItemStock,
      minStockLevel: newItemMinStock,
      unitPrice: newItemPrice,
      totalValue: newItemStock * newItemPrice,
      manufacturer: newItemManufacturer,
      supplier: 'Registered Institutional Vendor',
      batchNumber: `BATCH-2026-${String(Math.floor(10 + Math.random() * 90))}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      condition: 'OPERATIONAL',
      qrCodeValue: `EDU-LAB-QR-${newId}`,
      safetyClassification: newItemCategory === 'HAZARDOUS_MATERIAL' ? 'Class 8 Corrosive' : 'Standard Laboratory Apparatus',
      lastVerifiedDate: new Date().toISOString().split('T')[0]
    };

    addLabItem(newItem);
    setShowAddModal(false);
    setNewItemName('');
    setActionFeedback({
      success: true,
      message: `Registered new material '${newItem.name}' with ID ${newId} in laboratory inventory.`
    });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
            Laboratory Management & Multi-Campus Stock Suite
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Laboratory & QR Inventory</h1>
          <p className="text-xs text-slate-600 mt-1">
            Conventional & QR Stock Controls • Physics, Chemistry, Biology, CS & Electronics • Issue/Return Audit Ledger
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register New Material
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Total Laboratories</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{laboratories.length}</p>
          <p className="text-[10px] text-blue-700 font-medium mt-0.5">Physics, Chem, Bio, CS, Elec</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Inventory Items</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{labInventory.length}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Tracked under master register</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Inventory Valuation</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">₹{(totalInventoryValue / 100000).toFixed(2)}L</p>
          <p className="text-[10px] text-slate-600 font-mono font-medium mt-0.5">₹{totalInventoryValue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Low-Stock Alerts</p>
          <p className={`text-2xl font-black mt-1 ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {lowStockItems.length}
          </p>
          <p className="text-[10px] text-amber-300 font-medium mt-0.5">Below reorder threshold</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Calibration Due</p>
          <p className={`text-2xl font-black mt-1 ${maintenanceItems.length > 0 ? 'text-purple-400' : 'text-slate-400'}`}>
            {maintenanceItems.length}
          </p>
          <p className="text-[10px] text-purple-300 font-medium mt-0.5">Inspection scheduled</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Stock Movements</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{labMovements.length}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Immutable audit logs</p>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-lg ${
          actionFeedback.success
            ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
            : 'bg-red-950/80 text-red-200 border-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback.message}</span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold bg-emerald-900 px-2 py-0.5 rounded">COMMITTED</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'inventory', label: 'Inventory Register & Catalog', icon: Layers },
          { id: 'qr_scanner', label: 'QR Code Generator & Scanner', icon: QrCode },
          { id: 'movements', label: 'Issue, Return & Consumption Ledger', icon: PackageCheck },
          { id: 'maintenance', label: 'Equipment Maintenance & Calibration', icon: Wrench },
          { id: 'experiments', label: 'Practical Sessions & Syllabus Linkage', icon: FlaskConical },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: INVENTORY REGISTER & CATALOG */}
      {/* ===================================================================== */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 text-xs">
            {/* Laboratory Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider shrink-0">Laboratory:</span>
              <button
                onClick={() => setActiveLabFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
                  activeLabFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-700 hover:bg-slate-700'
                }`}
              >
                All Labs ({labInventory.length})
              </button>
              {laboratories.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => setActiveLabFilter(lab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
                    activeLabFilter === lab.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {lab.name.split(' ')[0]} ({lab.type})
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search material ID, name, rack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-slate-900/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4">Material / Item</th>
                    <th className="p-4">Laboratory</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-center">Available Stock</th>
                    <th className="p-4 text-right">Unit Price</th>
                    <th className="p-4 text-right">Total Valuation</th>
                    <th className="p-4 text-center">Condition</th>
                    <th className="p-4 text-center">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredItems.map((item) => {
                    const lab = laboratories.find(l => l.id === item.labId);
                    const isLowStock = item.currentStock <= item.minStockLevel;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center font-mono font-bold text-blue-400 text-[10px]">
                              QR
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                              <p className="text-[10px] text-slate-600 font-mono font-medium mt-0.5">
                                ID: <span className="text-blue-300">{item.id}</span> • Batch: {item.batchNumber}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-700 border border-slate-700">
                            {lab?.name || item.labId}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lab?.roomNumber}</p>
                        </td>

                        <td className="p-4 text-slate-700 font-mono text-[11px]">
                          {item.storageLocation}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs inline-flex items-center gap-1 ${
                            isLowStock 
                              ? 'bg-amber-950/90 text-amber-300 border border-amber-800' 
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          }`}>
                            {item.currentStock} {item.unit}
                            {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                          </span>
                          {isLowStock && (
                            <span className="block text-[9px] text-amber-400 font-bold mt-0.5">Low Stock Alert</span>
                          )}
                        </td>

                        <td className="p-4 text-right font-mono text-slate-700">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-emerald-400">
                          ₹{item.totalValue.toLocaleString('en-IN')}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.condition === 'OPERATIONAL'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : item.condition === 'CALIBRATION_DUE'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}>
                            {item.condition}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedItemForQR(item);
                                setSubTab('qr_scanner');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-blue-700/50"
                            >
                              <QrCode className="w-3 h-3" /> QR & Issue
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: QR CODE GENERATOR & SCANNER SIMULATOR */}
      {/* ===================================================================== */}
      {subTab === 'qr_scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: QR Label & Print Card */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-200 p-6 rounded-3xl space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-400" />
                Laboratory Material QR Label Generator
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Generate authenticated cryptographic QR stickers for test tubes, microscopes, and chemical containers.
              </p>
            </div>

            {/* Select Material Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Laboratory Item for Labeling:
              </label>
              <select
                value={selectedItemForQR.id}
                onChange={(e) => {
                  const it = labInventory.find(i => i.id === e.target.value);
                  if (it) setSelectedItemForQR(it);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {labInventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.id}] {item.name} - {item.storageLocation}
                  </option>
                ))}
              </select>
            </div>

            {/* Physical Printable QR Sticker Mockup */}
            <div className="p-5 rounded-2xl bg-white text-slate-950 border-2 border-dashed border-slate-300 shadow-2xl space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-black">
                    AG
                  </div>
                  <span className="font-black text-[11px] uppercase tracking-wider text-slate-900">
                    Akshara Global ERP
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  SECURE ASSET
                </span>
              </div>

              <div className="flex items-center gap-4 py-2">
                {/* Simulated High-Res QR Matrix */}
                <div className="w-24 h-24 bg-slate-950 p-2 rounded-xl shrink-0 flex items-center justify-center text-white font-mono text-[9px] text-center shadow-md">
                  <div className="w-full h-full border-2 border-white flex flex-col items-center justify-center gap-0.5 p-1">
                    <div className="w-3 h-3 bg-white self-start" />
                    <span className="text-[7px] leading-tight font-bold">QR AUTH</span>
                    <span className="text-[6px] text-blue-300">{selectedItemForQR.id}</span>
                    <div className="w-3 h-3 bg-white self-end" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-black text-xs text-slate-900 truncate leading-tight">
                    {selectedItemForQR.name}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono">
                    ID: <strong className="text-blue-700">{selectedItemForQR.id}</strong>
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Loc: <strong>{selectedItemForQR.storageLocation}</strong>
                  </p>
                  <p className="text-[9px] font-semibold text-emerald-700">
                    Batch: {selectedItemForQR.batchNumber} • Verified
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[8px] font-mono text-slate-500">
                <span>Scan with Camera or USB Scanner</span>
                <span>Bengaluru Campus</span>
              </div>
            </div>

            {/* Print Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => alert(`🖨️ Printing A4 Sticker Sheet (24 Labels/page) for ${selectedItemForQR.name}...`)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" /> A4 Sticker Sheet
              </button>

              <button
                onClick={() => alert(`🖨️ Printing 80mm Barcode/QR Thermal Label for ${selectedItemForQR.name}...`)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" /> 80mm Thermal
              </button>
            </div>
          </div>

          {/* Right Column: Authenticated Scan Action Workbench */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-200 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Authenticated QR Item Actions
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Actions executed after physical QR camera scan. Strict tenant permissions enforced.
                </p>
              </div>

              <button
                onClick={() => {
                  setScannedFeedback(`Camera Scanner Verified [${selectedItemForQR.id}]: ${selectedItemForQR.name}`);
                  setTimeout(() => setScannedFeedback(null), 4000);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" /> Simulate Scan
              </button>
            </div>

            {scannedFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {scannedFeedback}
              </div>
            )}

            {/* Item Live Details Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="text-sm font-black text-white">{selectedItemForQR.name}</h3>
                  <p className="text-[10px] text-slate-600 font-mono font-medium mt-0.5">Asset Code: {selectedItemForQR.id}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                  selectedItemForQR.currentStock <= selectedItemForQR.minStockLevel
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  Current Stock: {selectedItemForQR.currentStock} {selectedItemForQR.unit}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                  <span className="text-slate-200 font-semibold">{selectedItemForQR.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Storage Shelf</span>
                  <span className="text-slate-200 font-semibold">{selectedItemForQR.storageLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Condition</span>
                  <span className="text-slate-200 font-semibold">{selectedItemForQR.condition}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Unit Cost</span>
                  <span className="text-slate-200 font-mono">₹{selectedItemForQR.unitPrice.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Manufacturer</span>
                  <span className="text-slate-200 font-semibold truncate">{selectedItemForQR.manufacturer}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Safety Class</span>
                  <span className="text-amber-300 font-semibold text-[11px] truncate">{selectedItemForQR.safetyClassification}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Forms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Action 1: Issue Item to Faculty/Student */}
              <form onSubmit={handleIssueSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-400">
                  <ArrowRight className="w-3.5 h-3.5" /> Issue to Practical Batch
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Quantity to Issue:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItemForQR.currentStock}
                    value={issueQuantity}
                    onChange={(e) => setIssueQuantity(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Faculty / Requester:</label>
                  <input
                    type="text"
                    value={issueRequester}
                    onChange={(e) => setIssueRequester(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Practical Purpose:</label>
                  <input
                    type="text"
                    value={issuePurpose}
                    onChange={(e) => setIssuePurpose(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={selectedItemForQR.currentStock <= 0}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Confirm Issue & Deduct Stock
                </button>
              </form>

              {/* Action 2: Return or Record Consumption */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Return Custody / Consume
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Record returned instruments back into cupboards or record consumed chemicals from practicals.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleReturnSubmit(issueQuantity, 0)}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PackageCheck className="w-3.5 h-3.5" /> Restock Return (+{issueQuantity} {selectedItemForQR.unit})
                  </button>

                  <button
                    onClick={() => handleReturnSubmit(0, 1)}
                    className="w-full py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FlaskConical className="w-3.5 h-3.5" /> Record Consumption (-1 {selectedItemForQR.unit})
                  </button>

                  <button
                    onClick={() => {
                      const counted = prompt(`Enter physical count for ${selectedItemForQR.name}:`, String(selectedItemForQR.currentStock));
                      if (counted !== null) {
                        const res = verifyPhysicalStock(selectedItemForQR.id, Number(counted));
                        alert(`Audit Status: ${res.status}. Discrepancy: ${res.discrepancy} units.`);
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Physical Stock Verification Count
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: ISSUE & RETURN MOVEMENTS LEDGER */}
      {/* ===================================================================== */}
      {subTab === 'movements' && (
        <div className="bg-slate-900/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-blue-400" />
                Immutable Laboratory Stock Movement Ledger
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Every issue, return, chemical consumption, and purchase creates a tamper-proof audit record.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5">Movement ID</th>
                  <th className="p-3.5">Item Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5 text-center">Quantity</th>
                  <th className="p-3.5">Requested By</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-center">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {labMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-blue-400 font-bold text-[11px]">{mov.id}</td>
                    <td className="p-3.5 text-white font-bold">{mov.itemName}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mov.type === 'ISSUE'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : mov.type === 'RETURN'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : mov.type === 'CONSUMPTION'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        {mov.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold font-mono text-slate-200">
                      {mov.quantity} {mov.unit}
                    </td>
                    <td className="p-3.5 text-slate-700">{mov.requestedBy}</td>
                    <td className="p-3.5 text-slate-600 text-[11px] max-w-xs truncate">{mov.purpose}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[10px]">{mov.timestamp}</td>
                    <td className="p-3.5 text-center font-bold font-mono text-emerald-400">{mov.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 4: EQUIPMENT MAINTENANCE & CALIBRATION */}
      {/* ===================================================================== */}
      {subTab === 'maintenance' && (
        <div className="bg-slate-900/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-400" />
              Equipment Calibration & Preventive Maintenance Schedule
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Track annual optical calibrations, laser checks, autoclave safety certifications, and warranty renewals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {labInventory.filter(i => i.category === 'REUSABLE_EQUIPMENT' || i.category === 'COMPUTING_HARDWARE').map((eq) => (
              <div key={eq.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{eq.name}</h3>
                    <p className="text-[10px] text-slate-600 font-mono font-medium">ID: {eq.id} • Batch: {eq.batchNumber}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    eq.condition === 'OPERATIONAL'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : eq.condition === 'CALIBRATION_DUE'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {eq.condition}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Manufacturer</span>
                    <span className="text-slate-200">{eq.manufacturer}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Last Verified Date</span>
                    <span className="text-slate-200 font-mono">{eq.lastVerifiedDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      recordMaintenance(eq.id, '2027-11-04', 'OPERATIONAL');
                      alert(`Certified Calibration completed for ${eq.name}. Marked OPERATIONAL until 2027.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-bold transition-colors cursor-pointer border border-emerald-700/50"
                  >
                    Mark Calibration Certified
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 5: PRACTICALS & EXPERIMENT LINKAGE */}
      {/* ===================================================================== */}
      {subTab === 'experiments' && (
        <div className="bg-slate-900/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              Board Syllabus Practical Sessions & Required Inventory
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Link scheduled laboratory experiments directly with required chemicals, glassware, and faculty in-charge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {labExperiments.map((exp) => (
              <div key={exp.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {exp.subject}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    exp.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {exp.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900">{exp.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Target: {exp.classGroup} • Faculty: {exp.teacherName}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Required Apparatus & Reagents:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                    {exp.requiredMaterials.map((m, idx) => (
                      <li key={idx} className="truncate">{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-mono font-medium">
                  <span>Schedule: {exp.scheduleDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Register Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-400" />
                Register New Laboratory Material / Equipment
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Material Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Digital Spectrophotometer 340-1000nm"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Laboratory:</label>
                  <select
                    value={newItemLabId}
                    onChange={(e) => setNewItemLabId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {laboratories.map(l => (
                      <option key={l.id} value={l.id}>{l.name.split(' ')[0]} ({l.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Category:</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="REUSABLE_EQUIPMENT">Reusable Equipment</option>
                    <option value="CONSUMABLE_CHEMICAL">Consumable Chemical</option>
                    <option value="HAZARDOUS_MATERIAL">Hazardous Material</option>
                    <option value="GLASSWARE">Glassware</option>
                    <option value="COMPUTING_HARDWARE">Computing Hardware</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Current Stock:</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Min Stock:</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Unit Price (₹):</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Shelf / Rack Location:</label>
                  <input
                    type="text"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Unit Measurement:</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-700 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Register Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

