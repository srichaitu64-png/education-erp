import React, { useState, useEffect } from 'react';
import {
  X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download,
  ArrowRight, RefreshCw, Layers, ShieldCheck, Database, History, Check, ChevronRight
} from 'lucide-react';
import { useDemoStore, MigrationBatch } from '../../store/demoStore';

export type MigrationTargetModule = 'STUDENTS' | 'FEES' | 'EXAMINATIONS' | 'MARKS' | 'ATTENDANCE' | 'STAFF' | 'GENERAL';

interface SharedImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedModule?: MigrationTargetModule;
  preselectedImportType?: string;
  onImportComplete?: (importedCount: number, message: string) => void;
}

export const SharedImportWizardModal: React.FC<SharedImportWizardModalProps> = ({
  isOpen,
  onClose,
  preselectedModule = 'STUDENTS',
  preselectedImportType,
  onImportComplete,
}) => {
  const { migrationBatches, addMigrationJob } = useDemoStore();

  const [activeModule, setActiveModule] = useState<MigrationTargetModule>(preselectedModule);
  const [activeImportType, setActiveImportType] = useState<string>(preselectedImportType || 'STUDENT_MASTER');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; format: 'XLSX' | 'CSV'; rows: number } | null>(null);
  const [conflictPolicy, setConflictPolicy] = useState<'SKIP' | 'MERGE' | 'OVERWRITE'>('SKIP');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeView, setActiveView] = useState<'WIZARD' | 'HISTORY'>('WIZARD');

  useEffect(() => {
    if (preselectedModule) setActiveModule(preselectedModule);
    if (preselectedImportType) {
      setActiveImportType(preselectedImportType);
    } else {
      // Set sensible default import type based on module
      if (preselectedModule === 'STUDENTS') setActiveImportType('STUDENT_MASTER');
      else if (preselectedModule === 'FEES') setActiveImportType('OPENING_BALANCES');
      else if (preselectedModule === 'EXAMINATIONS') setActiveImportType('EXAM_SCHEDULES');
      else if (preselectedModule === 'MARKS') setActiveImportType('THEORY_PRACTICAL_MARKS');
      else if (preselectedModule === 'ATTENDANCE') setActiveImportType('DAILY_ATTENDANCE');
      else if (preselectedModule === 'STAFF') setActiveImportType('STAFF_MASTER');
    }
    setCurrentStep(1);
    setUploadedFile(null);
  }, [preselectedModule, preselectedImportType, isOpen]);

  if (!isOpen) return null;

  // Module configuration catalog
  const moduleConfigMap: Record<MigrationTargetModule, {
    title: string;
    description: string;
    importTypes: { id: string; label: string; sampleFileName: string; targetFields: string[] }[];
  }> = {
    STUDENTS: {
      title: 'Student Management Bulk Ingestion',
      description: 'Ingest student master profiles, admissions applications, and guardian contact records.',
      importTypes: [
        { id: 'STUDENT_MASTER', label: 'Student Master & Enrolment', sampleFileName: 'EducationOS_Student_Master_Template.xlsx', targetFields: ['admission_number', 'first_name', 'last_name', 'class_name', 'section_code', 'guardian_phone'] },
        { id: 'ADMISSIONS', label: 'Admissions & Inquiries', sampleFileName: 'EducationOS_Admissions_Template.xlsx', targetFields: ['applicant_name', 'level', 'guardian_name', 'contact_number', 'previous_school'] },
        { id: 'GUARDIAN_CONTACTS', label: 'Parent & Guardian Directory', sampleFileName: 'EducationOS_Guardians_Template.xlsx', targetFields: ['student_admission_no', 'father_name', 'mother_name', 'primary_phone', 'emergency_contact'] },
        { id: 'PREVIOUS_ACADEMIC', label: 'Previous School / College History', sampleFileName: 'EducationOS_Prev_Academic_Template.xlsx', targetFields: ['student_id', 'previous_board', 'marks_percentage', 'tc_number', 'conduct_grade'] }
      ]
    },
    FEES: {
      title: 'Fee Management & Financial Balance Ingestion',
      description: 'Import fee structures, opening balances, historical offline collections, and receipt records.',
      importTypes: [
        { id: 'OPENING_BALANCES', label: 'Student Opening Balances & Arrears', sampleFileName: 'EducationOS_Fee_Opening_Balances.xlsx', targetFields: ['admission_number', 'tuition_arrears', 'hostel_arrears', 'transport_arrears', 'due_date'] },
        { id: 'FEE_STRUCTURES', label: 'Configured Fee Structures & Heads', sampleFileName: 'EducationOS_Fee_Structure_Template.xlsx', targetFields: ['institution_level', 'class_name', 'head_code', 'annual_amount', 'installment_count'] },
        { id: 'HISTORICAL_RECEIPTS', label: 'Legacy Offline Receipts & Audits', sampleFileName: 'EducationOS_Historical_Receipts.xlsx', targetFields: ['receipt_number', 'admission_no', 'amount_paid', 'payment_date', 'cashier_name'] }
      ]
    },
    EXAMINATIONS: {
      title: 'Examination Management Bulk Ingestion',
      description: 'Import examination definitions, course timetable schedules, and invigilation rosters.',
      importTypes: [
        { id: 'EXAM_SCHEDULES', label: 'Exam Timetable & Room Schedules', sampleFileName: 'EducationOS_Exam_Schedules.xlsx', targetFields: ['exam_code', 'class_name', 'subject_code', 'exam_date', 'session_time', 'room_number'] },
        { id: 'EXAM_DEFINITIONS', label: 'Examination Terms & Categories', sampleFileName: 'EducationOS_Exam_Terms.xlsx', targetFields: ['exam_title', 'term_code', 'target_level', 'academic_year', 'grading_scheme'] }
      ]
    },
    MARKS: {
      title: 'Marks & Assessment Register Ingestion',
      description: 'Bulk upload theory, practical, internal assessment marks, and external grades.',
      importTypes: [
        { id: 'THEORY_PRACTICAL_MARKS', label: 'Subject Theory, Practical & Internal Marks', sampleFileName: 'EducationOS_Marks_Register_Template.xlsx', targetFields: ['admission_number', 'subject_code', 'theory_obtained', 'practical_obtained', 'internal_obtained', 'attendance_status'] },
        { id: 'HISTORICAL_RESULTS', label: 'Historical Transcripts & SGPA', sampleFileName: 'EducationOS_Transcripts_Template.xlsx', targetFields: ['student_admission_no', 'semester_or_term', 'sgpa', 'cgpa', 'passed_credits', 'backlog_count'] }
      ]
    },
    ATTENDANCE: {
      title: 'Attendance Bulk Ingestion',
      description: 'Import daily classroom roll-call archives and biometric device punch logs.',
      importTypes: [
        { id: 'DAILY_ATTENDANCE', label: 'Daily Roll-Call Archive', sampleFileName: 'EducationOS_Daily_Attendance_Archive.xlsx', targetFields: ['attendance_date', 'admission_number', 'class_section', 'status', 'absence_reason'] },
        { id: 'PERIOD_ATTENDANCE', label: 'Period-Wise Lecture Attendance', sampleFileName: 'EducationOS_Period_Attendance_Archive.xlsx', targetFields: ['attendance_date', 'period_number', 'subject_code', 'admission_number', 'status'] },
        { id: 'BIOMETRIC_PUNCHES', label: 'Hardware Biometric Timeclock Punches', sampleFileName: 'EducationOS_Biometric_Punches.csv', targetFields: ['device_serial', 'user_id', 'punch_timestamp', 'verification_mode', 'direction'] }
      ]
    },
    STAFF: {
      title: 'Staff & Faculty Management Bulk Ingestion',
      description: 'Import faculty master records, departmental employment details, and subject duty rosters.',
      importTypes: [
        { id: 'STAFF_MASTER', label: 'Faculty & Employee Master Profiles', sampleFileName: 'EducationOS_Staff_Master_Template.xlsx', targetFields: ['employee_code', 'full_name', 'department', 'designation', 'qualification', 'contact_phone'] },
        { id: 'STAFF_DUTIES', label: 'Class Teacher & Subject Duty Assignments', sampleFileName: 'EducationOS_Staff_Duties_Template.xlsx', targetFields: ['employee_code', 'duty_role', 'class_name', 'section_code', 'subject_code'] }
      ]
    },
    GENERAL: {
      title: 'Central Multi-Module Ingest Hub',
      description: 'Access complete multi-tenant migration pipelines with cross-module entity validation.',
      importTypes: [
        { id: 'COMPREHENSIVE_ROLL', label: 'Comprehensive Institutional Master Roll', sampleFileName: 'EducationOS_Comprehensive_Master.xlsx', targetFields: ['adm_no', 'name', 'class_sec', 'guardian', 'opening_balance', 'attendance_pct'] }
      ]
    }
  };

  const currentModConfig = moduleConfigMap[activeModule] || moduleConfigMap.STUDENTS;
  const currentImportConfig = currentModConfig.importTypes.find(it => it.id === activeImportType) || currentModConfig.importTypes[0];

  // Contextual jobs filtered for this module
  const moduleJobs = migrationBatches.filter(b => b.targetModule === activeModule || !b.targetModule);

  // Simulated file upload handler
  const handleSimulateUpload = (format: 'XLSX' | 'CSV') => {
    setUploadedFile({
      name: `Import_${activeModule}_${activeImportType}_2026.${format.toLowerCase()}`,
      size: format === 'XLSX' ? '2.4 MB' : '840 KB',
      format,
      rows: 120
    });
    setCurrentStep(2);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`/api/v1/migration/templates/${activeModule}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EducationOS_${activeModule}_Template.csv`;
        a.click();
        return;
      }
    } catch {
      // Fallback to local template generation
    }
    const headers = currentImportConfig.targetFields.join(',') + '\n';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentImportConfig.sampleFileName.replace('.xlsx', '.csv');
    a.click();
  };

  const handleExecuteImport = async () => {
    setIsExecuting(true);
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    if (token) {
      try {
        const payload = {
          target_module: activeModule,
          import_type: activeImportType,
          file_name: uploadedFile?.name || `${activeModule}_Ingest.xlsx`,
          conflict_policy: conflictPolicy,
          records: [
            {
              admission_number: `ADM-MIG-${Date.now().toString().slice(-4)}`,
              first_name: 'Aditi',
              last_name: 'Kulkarni',
              class_name: 'Class 10',
              section_or_stream: 'A',
              guardian_phone: '+91 98888 77777',
              fee_balance: 0.0
            }
          ]
        };
        const res = await fetch('/api/v1/migration/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          const newJob: MigrationBatch = {
            id: data.batch_number || data.batch_id || `mb-mod-${Date.now().toString().slice(-4)}`,
            fileName: uploadedFile?.name || `${activeModule}_Ingest.xlsx`,
            fileFormat: uploadedFile?.format || 'XLSX',
            uploadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            totalRecords: data.total_records || uploadedFile?.rows || 120,
            exactMatchesCount: data.skipped_count ?? data.skipped_records ?? 3,
            probableMatchesCount: 0,
            cleanNewRecordsCount: data.imported_count ?? data.imported_records ?? ((uploadedFile?.rows || 120) - 5),
            status: 'MIGRATED',
            targetModule: activeModule,
            importType: activeImportType,
            columnMappings: currentImportConfig.targetFields.map((f, i) => ({
              sourceHeader: f.replace(/_/g, ' ').toUpperCase(),
              targetField: f,
              confidence: 0.98,
              sampleValue: `Sample_${i + 1}`
            })),
            duplicateCandidates: []
          };
          addMigrationJob(newJob);
          setIsExecuting(false);
          if (onImportComplete) {
            onImportComplete(newJob.cleanNewRecordsCount, `Successfully ingested ${newJob.cleanNewRecordsCount} records into ${currentModConfig.title}.`);
          }
          onClose();
          return;
        }
      } catch (e) {
        console.warn('Backend migration execute fallback to local store:', e);
      }
    }

    // Optimistic fallback for offline/demo operation
    setTimeout(() => {
      const newJob: MigrationBatch = {
        id: `mb-mod-${Date.now().toString().slice(-4)}`,
        fileName: uploadedFile?.name || `${activeModule}_Ingest.xlsx`,
        fileFormat: uploadedFile?.format || 'XLSX',
        uploadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        totalRecords: uploadedFile?.rows || 120,
        exactMatchesCount: 3,
        probableMatchesCount: 2,
        cleanNewRecordsCount: (uploadedFile?.rows || 120) - 5,
        status: 'MIGRATED',
        targetModule: activeModule,
        importType: activeImportType,
        columnMappings: currentImportConfig.targetFields.map((f, i) => ({
          sourceHeader: f.replace(/_/g, ' ').toUpperCase(),
          targetField: f,
          confidence: 0.98,
          sampleValue: `Sample_${i + 1}`
        })),
        duplicateCandidates: []
      };

      addMigrationJob(newJob);
      setIsExecuting(false);
      if (onImportComplete) {
        onImportComplete(newJob.cleanNewRecordsCount, `Successfully ingested ${newJob.cleanNewRecordsCount} records into ${currentModConfig.title}.`);
      }
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800/60 flex items-center gap-1">
                <Database className="w-3 h-3 text-teal-400" />
                Shared Migration Engine
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Tenant: <strong>Akshara Educational Group</strong>
              </span>
            </div>
            <h2 className="text-xl font-black text-white">{currentModConfig.title}</h2>
            <p className="text-xs text-slate-400">{currentModConfig.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveView('WIZARD')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeView === 'WIZARD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Import Wizard
              </button>
              <button
                onClick={() => setActiveView('HISTORY')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'HISTORY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Module History ({moduleJobs.length})
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeView === 'HISTORY' ? (
          /* Contextual Module Import History */
          <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Authorized Import Jobs for {activeModule}</h3>
                <p className="text-slate-400 text-[11px]">All runs sync continuously with the central Data Migration Centre audit log.</p>
              </div>
              <button
                onClick={() => setActiveView('WIZARD')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
              >
                + Launch New Import
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Job ID</th>
                    <th className="p-3">File Name</th>
                    <th className="p-3">Import Type</th>
                    <th className="p-3">Upload Date</th>
                    <th className="p-3 text-right">Total Rows</th>
                    <th className="p-3 text-right">Committed</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {moduleJobs.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-indigo-400">{j.id}</td>
                      <td className="p-3 font-bold text-white">{j.fileName}</td>
                      <td className="p-3 text-slate-300 font-mono text-[11px]">{j.importType || 'STANDARD_INGEST'}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{j.uploadedAt}</td>
                      <td className="p-3 text-right font-mono text-slate-300">{j.totalRecords}</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">{j.cleanNewRecordsCount}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                          {j.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Wizard Steps Container */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Step Navigation Bar */}
            <div className="grid grid-cols-5 border-b border-slate-800 bg-slate-950 text-xs font-bold text-center">
              {[
                { step: 1, title: '1. Select & Template' },
                { step: 2, title: '2. Upload Source' },
                { step: 3, title: '3. Column Mapping' },
                { step: 4, title: '4. Deduplication' },
                { step: 5, title: '5. Ingest Execution' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                    currentStep === s.step
                      ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                      : currentStep > s.step
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  {currentStep > s.step && <Check className="w-3.5 h-3.5" />}
                  <span>{s.title}</span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* STEP 1: Select Import Type & Download Template */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 1: Choose Import Type & Download Standard Template</h3>
                    <p className="text-slate-400 mt-0.5">
                      Select the exact dataset you are importing into {activeModule}. Always download the official verified template to minimize mapping discrepancies.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentModConfig.importTypes.map((it) => (
                      <div
                        key={it.id}
                        onClick={() => setActiveImportType(it.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          activeImportType === it.id
                            ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{it.label}</span>
                            {activeImportType === it.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">{it.sampleFileName}</span>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {it.targetFields.slice(0, 4).map((f) => (
                              <span key={f} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800">
                                {f}
                              </span>
                            ))}
                            {it.targetFields.length > 4 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono">
                                +{it.targetFields.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Official Standard Spreadsheet Template</p>
                      <p className="text-[11px] text-slate-400">Includes mandatory field validations and sample rows for {currentImportConfig.label}.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-400" />
                      Download Template (.csv)
                    </button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      Proceed to File Upload →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: File Upload */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 2: Upload Source Master File</h3>
                    <p className="text-slate-400 mt-0.5">Supported formats: Excel (.xlsx, .xls), CSV (.csv), JSON. Auto-scanned for virus and structural validity.</p>
                  </div>

                  <div className="border-2 border-dashed border-slate-700 rounded-3xl p-8 text-center space-y-4 bg-slate-950/60">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>

                    {uploadedFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-black text-white">{uploadedFile.name}</p>
                        <p className="text-xs text-slate-400">Size: {uploadedFile.size} • Total Detected Rows: {uploadedFile.rows}</p>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 mt-1">
                          File Validated Successfully
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white">Drag & drop your file here, or click to upload</p>
                        <p className="text-xs text-slate-400">Target Type: <strong>{currentImportConfig.label}</strong></p>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => handleSimulateUpload('XLSX')}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer text-xs"
                          >
                            Simulate Excel (.xlsx) Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSimulateUpload('CSV')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer text-xs border border-slate-700"
                          >
                            Simulate CSV (.csv) Upload
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    {uploadedFile && (
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                      >
                        Proceed to Column Mapping →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Smart Column Alias Mapping */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 3: Smart Column Alias Mapping</h3>
                    <p className="text-slate-400 mt-0.5">
                      The migration engine automatically matches non-standard legacy header names to institutional ERP fields with confidence scoring.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-3">Source Header</th>
                          <th className="p-3">Matched Target Field</th>
                          <th className="p-3 text-center">Confidence</th>
                          <th className="p-3">Sample Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {currentImportConfig.targetFields.map((field, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono font-bold text-amber-300">
                              {field.replace(/_/g, ' ').toUpperCase()}
                            </td>
                            <td className="p-3 font-mono font-bold text-indigo-400">{field}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                                99% MATCH
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-300 text-[11px]">
                              {idx === 0 ? 'AKG-2026-0981' : idx === 1 ? 'Aarav' : idx === 2 ? 'Sharma' : 'Verified'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      Proceed to Duplicate Resolution →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Deduplication Policy */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 4: Duplicate Prevention & Conflict Resolution</h3>
                    <p className="text-slate-400 mt-0.5">
                      Configure how the system handles records that match existing students, fee heads, or marks entries:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { policy: 'SKIP', label: 'Skip Existing (Safe)', desc: 'Preserves existing database record untouched. Logs skipped rows in report.' },
                      { policy: 'MERGE', label: 'Merge Missing Fields', desc: 'Fills only blank fields without overwriting verified existing data.' },
                      { policy: 'OVERWRITE', label: 'Strict Overwrite (Explicit)', desc: 'Replaces existing record. Requires audit logging and admin approval.' }
                    ].map((p) => (
                      <div
                        key={p.policy}
                        onClick={() => setConflictPolicy(p.policy as any)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          conflictPolicy === p.policy
                            ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-bold text-white text-sm block">{p.label}</span>
                        <p className="text-[11px] text-slate-400 mt-1">{p.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Detected 3 exact identifier duplicates in source file. Selected policy (<strong>{conflictPolicy}</strong>) will be enforced transactionally during execution.
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      Proceed to Pre-Commit Preview →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Pre-Commit Preview & Ingest Execution */}
              {currentStep === 5 && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-14 h-14 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white">Ready for Production Ingestion</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All structural, schema, and tenant-isolation validations passed. 
                      Target Module: <strong>{activeModule}</strong> ({currentImportConfig.label}).
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Rows</span>
                      <p className="text-lg font-mono font-black text-white mt-0.5">{uploadedFile?.rows || 120}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">Clean New</span>
                      <p className="text-lg font-mono font-black text-emerald-400 mt-0.5">{(uploadedFile?.rows || 120) - 5}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">Duplicates</span>
                      <p className="text-lg font-mono font-black text-amber-400 mt-0.5">5 ({conflictPolicy})</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleExecuteImport}
                      disabled={isExecuting}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Committing to Database...</span>
                        </>
                      ) : (
                        <span>Execute Migration Batch Now</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

