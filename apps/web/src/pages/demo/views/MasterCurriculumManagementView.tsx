import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Layers,
  Sliders,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Search,
  Filter,
  Check,
  Award,
  FlaskConical,
  GraduationCap
} from 'lucide-react';
import { useDemoStore, MasterSubjectItem, CurriculumMappingItem } from '../../../store/demoStore';
import { CreateMasterSubjectModal } from '../../../components/academic/CreateMasterSubjectModal';
import { api } from '../../../services/api';

export const MasterCurriculumManagementView: React.FC = () => {
  const { staffMembers, tenantScope } = useDemoStore();
  const [masterSubjectCatalogue, setMasterSubjectCatalogue] = useState<MasterSubjectItem[]>([]);
  const [curriculumMappings, setCurriculumMappings] = useState<CurriculumMappingItem[]>([]);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  const refreshAcademicData = async () => {
    setBackendLoading(true);
    try {
      const [subjectsResponse, mappingsResponse] = await Promise.all([
        api.get('/academic/subjects'),
        api.get('/academic/curriculum', { params: { academic_year: '2026-2027' } }),
      ]);
      const subjects = Array.isArray(subjectsResponse.data) ? subjectsResponse.data : [];
      const mappings = Array.isArray(mappingsResponse.data) ? mappingsResponse.data : [];
      setMasterSubjectCatalogue(subjects.map((subject: any) => ({
        id: String(subject.id),
        code: subject.code,
        name: subject.name,
        category: subject.category,
        has_practical: subject.has_practical,
        default_theory_max: subject.default_theory_max,
        default_practical_max: subject.default_practical_max,
        credits: subject.credits,
        description: subject.description || '',
        is_active: subject.is_active,
      })));
      setCurriculumMappings(mappings.map((mapping: any) => ({
        id: String(mapping.id),
        institution_level: mapping.institution_level,
        class_name: mapping.class_name,
        stream: mapping.stream,
        academic_year: mapping.academic_year,
        subject_code: mapping.subject_code,
        subject_name: mapping.subject_name,
        category: mapping.category,
        is_compulsory: mapping.is_compulsory,
        theory_max: mapping.theory_max_marks,
        practical_max: mapping.practical_max_marks,
        passing_marks: mapping.total_pass_marks,
        assigned_teacher: mapping.assigned_teacher_name || 'Unassigned',
      })));
      setBackendError(null);
    } catch (err: any) {
      setBackendError(err?.response?.data?.detail || 'Academic data could not be loaded from the server.');
    } finally {
      setBackendLoading(false);
    }
  };

  React.useEffect(() => {
    void refreshAcademicData();
  }, []);

  const [activeSubTab, setActiveSubTab] = useState<'catalogue' | 'mapping' | 'assessment'>('catalogue');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  // Catalogue Filters
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [catalogueCategoryFilter, setCatalogueCategoryFilter] = useState('ALL');

  // Mapping Filters
  const [selectedLevel, setSelectedLevel] = useState<'School' | 'PU College' | 'Degree College'>('PU College');
  const [selectedClass, setSelectedClass] = useState<string>('I PUC');
  const [selectedStream, setSelectedStream] = useState<string>('PCMB');

  // Map Subject Selector Modal / Popover
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCatalogueSubjectId, setSelectedCatalogueSubjectId] = useState('');
  const [isCompulsory, setIsCompulsory] = useState(true);

  // Assessment Editing
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [editTheory, setEditTheory] = useState<number>(70);
  const [editPractical, setEditPractical] = useState<number>(30);
  const [editPass, setEditPass] = useState<number>(35);
  const [editTeacher, setEditTeacher] = useState<string>('');

  // Filtered catalogue
  const filteredCatalogue = masterSubjectCatalogue.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(catalogueSearch.toLowerCase());
    const matchesCategory =
      catalogueCategoryFilter === 'ALL' || s.category === catalogueCategoryFilter;
    return s.is_active && matchesSearch && matchesCategory;
  });

  // Filtered class mappings
  const currentClassMappings = curriculumMappings.filter((m) => {
    const matchesLevel = m.institution_level === selectedLevel;
    const matchesClass = m.class_name === selectedClass;
    const matchesStream = !m.stream || m.stream === selectedStream || m.stream === 'Secondary (CBSE)';
    return matchesLevel && matchesClass && matchesStream;
  });

  // Unmapped catalogue subjects for current class
  const mappedSubjectCodes = new Set(currentClassMappings.map((m) => m.subject_code));
  const unmappedCatalogueSubjects = masterSubjectCatalogue.filter(
    (s) => s.is_active && !mappedSubjectCodes.has(s.code)
  );

  const handleOpenMapModal = () => {
    if (unmappedCatalogueSubjects.length > 0) {
      setSelectedCatalogueSubjectId(unmappedCatalogueSubjects[0].id);
    }
    setShowMapModal(true);
  };

  const handleConfirmMapSubject = async () => {
    const targetSubject = masterSubjectCatalogue.find((s) => s.id === selectedCatalogueSubjectId);
    if (!targetSubject) return;

    try {
      const response = await api.post('/academic/curriculum/map', {
        academic_year: '2026-2027',
        institution_level: selectedLevel,
        class_name: selectedClass,
        stream: selectedStream,
        subject_code: targetSubject.code,
        is_compulsory: isCompulsory,
        has_theory: true,
        has_practical: targetSubject.has_practical,
        theory_max_marks: targetSubject.default_theory_max,
        practical_max_marks: targetSubject.default_practical_max,
        total_max_marks: targetSubject.default_theory_max + targetSubject.default_practical_max,
        theory_pass_marks: 35,
        practical_pass_marks: 0,
        total_pass_marks: 35,
        assigned_teacher_name: staffMembers.length > 0 ? staffMembers[0].name : 'Unassigned',
      });
      const saved = response.data;
      if (!saved?.id) throw new Error('Server did not return the persisted mapping ID.');

      setCurriculumMappings((current) => [...current, {
        id: String(saved.id),
        institution_level: saved.institution_level,
        class_name: saved.class_name,
        stream: saved.stream,
        academic_year: saved.academic_year,
        subject_code: saved.subject_code,
        subject_name: saved.subject_name,
        category: saved.category,
        is_compulsory: saved.is_compulsory,
        theory_max: saved.theory_max_marks,
        practical_max: saved.practical_max_marks,
        passing_marks: saved.total_pass_marks,
        assigned_teacher: saved.assigned_teacher_name || 'Unassigned',
      }]);
      setShowMapModal(false);
    } catch (err: any) {
      console.error('Curriculum mapping was not saved:', err);
      window.alert(err?.response?.data?.detail || err?.message || 'Unable to save curriculum mapping.');
    }
  };

  const handleStartEditAssessment = (mapping: CurriculumMappingItem) => {
    setEditingAssessmentId(mapping.id);
    setEditTheory(mapping.theory_max);
    setEditPractical(mapping.practical_max);
    setEditPass(mapping.passing_marks);
    setEditTeacher(mapping.assigned_teacher || '');
  };

  const handleSaveAssessment = async (mappingId: string) => {
    try {
      const response = await api.put(`/academic/curriculum/mappings/${mappingId}`, {
        theory_max_marks: Number(editTheory),
        practical_max_marks: Number(editPractical),
        total_max_marks: Number(editTheory) + Number(editPractical),
        theory_pass_marks: Number(editPass),
        practical_pass_marks: 0,
        total_pass_marks: Number(editPass),
        assigned_teacher_name: editTeacher,
      });
      setCurriculumMappings((current) => current.map((mapping) => mapping.id === mappingId ? {
        ...mapping,
        theory_max: response.data.theory_max_marks,
        practical_max: response.data.practical_max_marks,
        passing_marks: response.data.total_pass_marks,
        assigned_teacher: response.data.assigned_teacher_name || 'Unassigned',
      } : mapping));
      setEditingAssessmentId(null);
    } catch (err: any) {
      console.error('Curriculum assessment update failed:', err);
      window.alert(err?.response?.data?.detail || 'Unable to update assessment settings. No local changes were applied.');
    }
  };

  const handleArchiveSubjectAction = async (subjectId: string) => {
    try {
      await api.delete(`/academic/subjects/${subjectId}`);
      setMasterSubjectCatalogue((current) => current.filter((subject) => subject.id !== subjectId));
    } catch (err: any) {
      console.error('Subject archive failed:', err);
      window.alert(err?.response?.data?.detail || 'Unable to archive this subject.');
    }
  };

  const handleRemoveSubjectFromClassAction = async (mappingId: string) => {
    try {
      await api.delete(`/academic/curriculum/mappings/${mappingId}`);
      setCurriculumMappings((current) => current.filter((mapping) => mapping.id !== mappingId));
    } catch (err: any) {
      console.error('Curriculum unmap failed:', err);
      window.alert(err?.response?.data?.detail || 'Unable to remove this curriculum mapping.');
    }
  };

  const handleLoadStandardTemplateAction = async () => {
    try {
      const response = await api.post('/academic/subjects/templates/load-standard');
      await refreshAcademicData();
      window.alert(response.data?.message || 'Standard subjects loaded successfully.');
    } catch (err: any) {
      console.error('Standard subject template load failed:', err);
      window.alert(err?.response?.data?.detail || 'Unable to load the standard subject template.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {backendError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {backendError} This screen will not substitute demo records for missing server data.
          <button type="button" onClick={() => void refreshAcademicData()} className="ml-3 underline font-bold">Retry</button>
        </div>
      )}
      {backendLoading && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">Loading saved academic data…</div>
      )}
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Centralized Academic Architecture
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Subject Catalogue & Curriculum Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Master Subject Catalogue • Class-Wise Curriculum Mapping • Evaluation & Marks Scheme Split
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {masterSubjectCatalogue.length === 0 && (
            <button
              onClick={handleLoadStandardTemplateAction}
              className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              Load Standard Karnataka PU / CBSE Template
            </button>
          )}

          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Master Subject
          </button>
        </div>
      </div>

      {/* 3 Sub-Tabs Navigation Strip */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab('catalogue')}
          className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
            activeSubTab === 'catalogue'
              ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
              : 'hover:bg-slate-50 border border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BookOpen className={`w-4 h-4 ${activeSubTab === 'catalogue' ? 'text-blue-600' : 'text-slate-400'}`} />
              1. Master Subject Catalogue
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {masterSubjectCatalogue.filter((s) => s.is_active).length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Single master source of all institution subjects</p>
        </button>

        <button
          onClick={() => setActiveSubTab('mapping')}
          className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
            activeSubTab === 'mapping'
              ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
              : 'hover:bg-slate-50 border border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className={`w-4 h-4 ${activeSubTab === 'mapping' ? 'text-blue-600' : 'text-slate-400'}`} />
              2. Class-Wise Curriculum Mapping
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {curriculumMappings.length} Mapped
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Assign master subjects to Class & Combination</p>
        </button>

        <button
          onClick={() => setActiveSubTab('assessment')}
          className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
            activeSubTab === 'assessment'
              ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
              : 'hover:bg-slate-50 border border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sliders className={`w-4 h-4 ${activeSubTab === 'assessment' ? 'text-blue-600' : 'text-slate-400'}`} />
              3. Subject & Assessment Scheme
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
              Evaluation Rules
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Theory/Practical marks, passing & faculty assignment</p>
        </button>
      </div>

      {/* =================================================================== */}
      {/* SUB-TAB 1: MASTER SUBJECT CATALOGUE */}
      {/* =================================================================== */}
      {activeSubTab === 'catalogue' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subject by code or name..."
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">Category:</span>
              {['ALL', 'Language', 'Core Science', 'Core Commerce', 'Arts & Humanities', 'Vocational'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatalogueCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    catalogueCategoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Master Subject Cards Grid */}
          {filteredCatalogue.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalogue.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
                        {subject.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {subject.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{subject.name}</h3>
                    {subject.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{subject.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {subject.has_practical ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] flex items-center gap-1">
                          <FlaskConical className="w-3 h-3 text-emerald-600" />
                          Lab: {subject.default_theory_max}T / {subject.default_practical_max}P
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          Theory: {subject.default_theory_max} Marks
                        </span>
                      )}
                      <span className="text-slate-400 font-mono text-[11px]">{subject.credits} Credits</span>
                    </div>

                    <button
                      onClick={() => handleArchiveSubjectAction(subject.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Archive Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">No Master Subjects in Catalogue</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {tenantScope === 'akshara-trial' || tenantScope === 'pilot-clean'
                    ? 'Your pilot workspace starts completely clean. Add individual master subjects or load the recommended Karnataka PU / CBSE catalogue template.'
                    : 'No subjects matched your search filters.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Add First Subject
                </button>
                <button
                  onClick={handleLoadStandardTemplateAction}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  ✨ Load Standard Karnataka PU & CBSE Template
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 2: CLASS-WISE CURRICULUM MAPPING */}
      {/* =================================================================== */}
      {activeSubTab === 'mapping' && (
        <div className="space-y-4">
          {/* Class & Stream Selectors */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  1. Academic Unit
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => {
                    const l = e.target.value as any;
                    setSelectedLevel(l);
                    if (l === 'School') {
                      setSelectedClass('Class 10');
                      setSelectedStream('Secondary (CBSE)');
                    } else if (l === 'PU College') {
                      setSelectedClass('I PUC');
                      setSelectedStream('PCMB');
                    } else {
                      setSelectedClass('B.Sc CS');
                      setSelectedStream('General');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="School">School (K-10)</option>
                  <option value="PU College">PU College (11-12)</option>
                  <option value="Degree College">Degree College</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  2. Target Class / Grade
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {selectedLevel === 'School' ? (
                    <>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </>
                  ) : selectedLevel === 'PU College' ? (
                    <>
                      <option value="I PUC">I PUC</option>
                      <option value="II PUC">II PUC</option>
                    </>
                  ) : (
                    <>
                      <option value="B.Sc CS">B.Sc Computer Science</option>
                      <option value="B.Com">B.Com Finance</option>
                    </>
                  )}
                </select>
              </div>

              {selectedLevel === 'PU College' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    3. Stream / Combination
                  </label>
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="PCMB">PCMB (Science)</option>
                    <option value="PCMC">PCMC (Computer Science)</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleOpenMapModal}
              disabled={unmappedCatalogueSubjects.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              + Map Subject to {selectedClass}
            </button>
          </div>

          {/* Mapped Subjects Roster for Selected Class */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  {selectedClass} {selectedLevel === 'PU College' ? `(${selectedStream})` : ''} Curriculum
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentClassMappings.length} subjects currently mapped to this class syllabus
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600">
                Academic Session: 2026–2027
              </span>
            </div>

            {currentClassMappings.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {currentClassMappings.map((mapping, idx) => (
                  <div
                    key={mapping.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                            {mapping.subject_code}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{mapping.subject_name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            mapping.is_compulsory ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {mapping.is_compulsory ? 'Compulsory' : 'Elective'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          Category: <strong className="text-slate-700">{mapping.category}</strong> • Assigned Faculty: <strong className="text-slate-700">{mapping.assigned_teacher || 'Unassigned'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right font-mono text-xs">
                        <span className="text-slate-400 block text-[10px]">Evaluation Split</span>
                        <span className="font-bold text-slate-800">
                          {mapping.theory_max}T / {mapping.practical_max}P (Pass: {mapping.passing_marks})
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveSubjectFromClassAction(mapping.id)}
                        className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                        title="Unbind from class without removing master subject"
                      >
                        Remove from Class
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No subjects mapped to {selectedClass} yet.</p>
                <p>Click the green &quot;+ Map Subject to {selectedClass}&quot; button above to assign master subjects from your catalogue.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 3: SUBJECT & ASSESSMENT CONFIGURATION */}
      {/* =================================================================== */}
      {activeSubTab === 'assessment' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-black text-sm text-slate-900">Marks Evaluation Rules & Faculty Roster</h3>
              <p className="text-slate-500 text-xs">Configure theory vs practical components, minimum pass criteria, and subject in-charge teachers</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Filter Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Class 10">Class 10 (School)</option>
                <option value="I PUC">I PUC (PU College)</option>
                <option value="II PUC">II PUC (PU College)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-3.5">Subject Code & Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Theory Max</th>
                    <th className="p-3.5">Practical Max</th>
                    <th className="p-3.5">Total Marks</th>
                    <th className="p-3.5">Pass Marks</th>
                    <th className="p-3.5">Assigned Faculty</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentClassMappings.map((m) => {
                    const isEditing = editingAssessmentId === m.id;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] mr-2">
                            {m.subject_code}
                          </span>
                          <strong className="text-slate-900">{m.subject_name}</strong>
                        </td>
                        <td className="p-3.5 text-slate-600">{m.category}</td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editTheory}
                              onChange={(e) => setEditTheory(Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                            />
                          ) : (
                            <span className="font-mono font-bold text-slate-800">{m.theory_max}</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPractical}
                              onChange={(e) => setEditPractical(Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                            />
                          ) : (
                            <span className="font-mono font-bold text-slate-800">{m.practical_max}</span>
                          )}
                        </td>

                        <td className="p-3.5 font-mono font-black text-slate-900">
                          {isEditing ? editTheory + editPractical : m.theory_max + m.practical_max}
                        </td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPass}
                              onChange={(e) => setEditPass(Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                            />
                          ) : (
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {m.passing_marks}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <select
                              value={editTeacher}
                              onChange={(e) => setEditTeacher(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                            >
                              <option value="Unassigned">Unassigned</option>
                              {staffMembers.map((st) => (
                                <option key={st.id} value={st.name}>
                                  {st.name} ({st.designation})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-medium text-slate-800">
                              {m.assigned_teacher || 'Unassigned'}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveAssessment(m.id)}
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingAssessmentId(null)}
                                className="px-2.5 py-1 rounded text-slate-600 hover:bg-slate-100 text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditAssessment(m)}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition-colors"
                            >
                              Configure
                            </button>
                          )}
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

      {/* Map Subject Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-slate-900">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">Map Subject to {selectedClass}</h3>
                <p className="text-xs text-slate-500">Pick from Master Catalogue</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Master Subject</label>
                <select
                  value={selectedCatalogueSubjectId}
                  onChange={(e) => setSelectedCatalogueSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {unmappedCatalogueSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name} ({sub.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Compulsory for this Class?</span>
                  <span className="text-[11px] text-slate-500">Check if required for all students</span>
                </div>
                <input
                  type="checkbox"
                  checked={isCompulsory}
                  onChange={(e) => setIsCompulsory(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setShowMapModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmMapSubject}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                >
                  Confirm Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Master Subject Modal */}
      <CreateMasterSubjectModal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        onCreated={(subject) => setMasterSubjectCatalogue((current) => [...current, subject])}
      />
    </div>
  );
};
