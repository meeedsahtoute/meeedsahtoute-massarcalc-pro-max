
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EDUCATION_SYSTEM, MOTIVATION_MSGS } from './constants';
import { AppState, Subject, Semester } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Plus, Trash2, Moon, Sun, ChevronLeft, Calculator, 
  Trophy, BookOpen, GraduationCap, LayoutDashboard, Settings, Download, RotateCcw,
  Target, TrendingUp, HelpCircle, Save, Share2, User, ChevronRight, Star, AlertCircle,
  Lightbulb, Zap, Info, ArrowUpRight, Sparkles, FileText
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('massar_pro_max_v4');
    if (saved) return JSON.parse(saved);
    return {
      levelId: null,
      yearId: null,
      semesters: { S1: [], S2: [] },
      currentSemester: 'S1',
      isDarkMode: false
    };
  });

  const [targetAverage, setTargetAverage] = useState<number>(15);
  const [showModal, setShowModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calc' | 'analysis' | 'goals'>('calc');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('massar_pro_max_v4', JSON.stringify(state));
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const toggleTheme = () => setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));

  const selectLevel = (levelId: string, yearId: string) => {
    const yearData = EDUCATION_SYSTEM[levelId].years.find(y => y.id === yearId);
    if (!yearData) return;

    const subjects: Subject[] = yearData.subjects.map((s, i) => ({
      id: `${Date.now()}-${i}`,
      name: s.name,
      coef: s.coef,
      grade: null
    }));

    setIsLoading(true);
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        levelId,
        yearId,
        semesters: { S1: [...subjects], S2: [...subjects] }
      }));
      setShowYearModal(null);
      setIsLoading(false);
    }, 500);
  };

  const updateSubject = (id: string, field: keyof Subject, value: any) => {
    setState(prev => {
      const currentSem = prev.currentSemester;
      const updatedSubjects = prev.semesters[currentSem].map(s => {
        if (s.id === id) {
          let newValue = value;
          if (field === 'grade') {
            newValue = value === '' ? null : Math.min(20, Math.max(0, parseFloat(value)));
          }
          if (field === 'coef') {
            newValue = isNaN(parseFloat(value)) ? 1 : Math.max(0.5, parseFloat(value));
          }
          return { ...s, [field]: newValue };
        }
        return s;
      });

      return {
        ...prev,
        semesters: { ...prev.semesters, [currentSem]: updatedSubjects }
      };
    });
  };

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: 'مادة جديدة',
      coef: 1,
      grade: null
    };
    setState(prev => ({
      ...prev,
      semesters: {
        ...prev.semesters,
        [prev.currentSemester]: [...prev.semesters[prev.currentSemester], newSubject]
      }
    }));
  };

  const deleteSubject = (id: string) => {
    setState(prev => ({
      ...prev,
      semesters: {
        ...prev.semesters,
        [prev.currentSemester]: prev.semesters[prev.currentSemester].filter(s => s.id !== id)
      }
    }));
  };

  const calculateAverage = useCallback((subjects: Subject[]) => {
    const filled = subjects.filter(s => s.grade !== null);
    if (filled.length === 0) return 0;
    const totalScore = filled.reduce((acc, s) => acc + (s.grade || 0) * s.coef, 0);
    const totalCoef = filled.reduce((acc, s) => acc + s.coef, 0);
    return totalScore / totalCoef;
  }, []);

  const s1Avg = useMemo(() => calculateAverage(state.semesters.S1), [state.semesters.S1, calculateAverage]);
  const s2Avg = useMemo(() => calculateAverage(state.semesters.S2), [state.semesters.S2, calculateAverage]);
  const currentAvg = state.currentSemester === 'S1' ? s1Avg : s2Avg;
  
  const currentSubjects = state.semesters[state.currentSemester];
  const totalCoef = useMemo(() => currentSubjects.reduce((a, b) => a + b.coef, 0), [currentSubjects]);

  const annualAvg = useMemo(() => {
    const s1Filled = state.semesters.S1.some(s => s.grade !== null);
    const s2Filled = state.semesters.S2.some(s => s.grade !== null);
    if (!s1Filled && !s2Filled) return 0;
    if (s1Filled && !s2Filled) return s1Avg;
    if (!s1Filled && s2Filled) return s2Avg;
    return (s1Avg + s2Avg) / 2;
  }, [s1Avg, s2Avg, state.semesters]);

  const getMention = (avg: number) => {
    if (avg >= 16) return { text: 'حسن جداً', color: 'text-purple-600', msgs: MOTIVATION_MSGS.pass_excellent, bg: 'bg-purple-50/50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800' };
    if (avg >= 14) return { text: 'حسن', color: 'text-indigo-600', msgs: MOTIVATION_MSGS.pass_great, bg: 'bg-indigo-50/50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800' };
    if (avg >= 12) return { text: 'مستحسن', color: 'text-emerald-600', msgs: MOTIVATION_MSGS.pass_good, bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800' };
    if (avg >= 10) return { text: 'مقبول', color: 'text-amber-600', msgs: MOTIVATION_MSGS.pass_ok, bg: 'bg-amber-50/50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800' };
    if (avg >= 9.5) return { text: 'قريب جداً', color: 'text-rose-500', msgs: MOTIVATION_MSGS.critical, bg: 'bg-rose-50/50 dark:bg-rose-900/10', border: 'border-rose-200 dark:border-rose-800' };
    return { text: 'غير مستوف', color: 'text-slate-500', msgs: MOTIVATION_MSGS.fail, bg: 'bg-slate-50/50 dark:bg-slate-900/10', border: 'border-slate-200 dark:border-slate-800' };
  };

  const mention = getMention(currentAvg);

  // --- SMART ANALYTICS ---
  const smartAnalysis = useMemo(() => {
    const subjects = state.semesters[state.currentSemester];
    const highCoefSubject = subjects.reduce((prev, curr) => (prev.coef > curr.coef) ? prev : curr, subjects[0]);
    const maxImpact = (1 / totalCoef).toFixed(3);
    
    return {
      topSubject: highCoefSubject,
      pointImpact: maxImpact
    };
  }, [state.semesters, state.currentSemester, totalCoef]);

  const radarData = useMemo(() => {
    return currentSubjects.map(s => ({
      name: s.name,
      value: s.grade || 0,
      fullMark: 20
    }));
  }, [currentSubjects]);

  const barData = useMemo(() => {
    return currentSubjects.map(s => ({
      name: s.name,
      grade: s.grade || 0
    }));
  }, [currentSubjects]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-float">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-full animate-pulse-soft"></div>
        </div>
        <div className="mt-12 text-center space-y-2 animate-slide-up">
          <h2 className="text-3xl font-black tracking-tight">تخصيص لوحتك...</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">نقوم بتحميل النظام الدراسي المغربي</p>
        </div>
      </div>
    );
  }

  if (!state.levelId) {
    return (
      <div className="min-h-screen bg-[#fcfdff] dark:bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 overflow-hidden">
           <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="w-full max-w-6xl z-10 space-y-16 animate-slide-up">
          <header className="text-center space-y-8">
            <div className="mx-auto w-32 h-32 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 rounded-[3.5rem] flex items-center justify-center shadow-3xl text-white transform rotate-3 hover:rotate-0 transition-all duration-700 group cursor-pointer active:scale-95">
              <Calculator size={64} className="group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-7xl md:text-9xl font-black text-slate-950 dark:text-white tracking-tighter leading-tight">
                حسابي برو <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500">ماكس</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-2xl md:text-3xl font-medium max-w-4xl mx-auto leading-relaxed">
                التجربة الأذكى لتتبع مسارك الدراسي المغربي بدقة، سرعة، واحترافية.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Object.values(EDUCATION_SYSTEM).map((level) => (
              <button 
                key={level.id}
                onClick={() => setShowYearModal(level.id)}
                className="group relative bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-8 hover:-translate-y-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className={`p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50`}>
                  {level.id === 'primary' && <BookOpen size={48} />}
                  {level.id === 'middle' && <GraduationCap size={48} />}
                  {level.id === 'high' && <LayoutDashboard size={48} />}
                  {level.id === 'bac1' && <Star size={48} />}
                  {level.id === 'bac2' && <Trophy size={48} />}
                </div>
                <div className="text-center relative z-10 space-y-2">
                  <h3 className="text-3xl font-black">{level.label}</h3>
                  <p className="text-slate-400 font-bold text-base leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">ابدأ رحلتك نحو التميز الدراسي اليوم</p>
                </div>
                <div className="mt-2 opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 text-indigo-600 font-black text-sm">
                  <span>فتح المسار</span>
                  <ChevronLeft size={16} className="rotate-180" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Improved Selection Modal */}
        {showYearModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl transition-all duration-500">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-500 border border-white/20 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="p-12 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                     <Settings size={32} />
                   </div>
                   <div>
                     <h3 className="text-4xl font-black">اختر السنة الدراسية</h3>
                     <p className="text-slate-400 text-base font-bold">قم بتخصيص تجربتك حسب مستواك</p>
                   </div>
                </div>
                <button onClick={() => setShowYearModal(null)} className="w-14 h-14 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white rounded-[1.5rem] transition-all flex items-center justify-center group">
                  <Plus size={24} className="rotate-45 group-hover:scale-125 transition-transform duration-500" />
                </button>
              </div>
              <div className="p-12 grid gap-6 overflow-y-auto custom-scrollbar">
                {EDUCATION_SYSTEM[showYearModal].years.map(year => (
                  <button
                    key={year.id}
                    onClick={() => selectLevel(showYearModal, year.id)}
                    className="flex items-center justify-between p-10 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-600 group rounded-[3.5rem] border border-transparent hover:border-indigo-400/30 transition-all duration-500 text-right shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 group-hover:bg-white shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:shadow-white transition-all"></div>
                      <span className="font-black text-3xl group-hover:text-white transition-colors">{year.label}</span>
                    </div>
                    <ArrowUpRight size={36} className="text-slate-300 group-hover:text-white group-hover:translate-x-[-15px] group-hover:translate-y-[-5px] transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdff] dark:bg-[#020617] text-slate-900 dark:text-slate-100 pb-20">
      
      {/* High-End Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setState(prev => ({ ...prev, levelId: null }))}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={28} className="rotate-180" />
            </button>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight leading-none">حسابي برو <span className="text-indigo-600">ماكس</span></h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">
                  {EDUCATION_SYSTEM[state.levelId].years.find(y => y.id === state.yearId)?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
             <nav className="hidden xl:flex bg-slate-100 dark:bg-slate-900 p-2 rounded-[1.8rem] gap-2">
                <button 
                  onClick={() => setActiveTab('calc')}
                  className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === 'calc' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
                >
                  <Calculator size={18} />
                  <span>الحاسبة</span>
                </button>
                <button 
                  onClick={() => setActiveTab('analysis')}
                  className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === 'analysis' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
                >
                  <TrendingUp size={18} />
                  <span>التحليل الذكي</span>
                </button>
             </nav>
             
             <button onClick={toggleTheme} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:shadow-xl transition-all group">
               {state.isDarkMode ? <Sun size={26} className="text-amber-400 group-hover:rotate-45 transition-transform" /> : <Moon size={26} className="group-hover:-rotate-12 transition-transform" />}
             </button>
             
             <button onClick={() => setShowModal(true)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all active:scale-95">
               <Trophy size={28} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-12 animate-slide-up">
        
        {/* Statistics Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Result Card */}
            <div className={`p-10 rounded-[4rem] shadow-2xl transition-all duration-1000 ${mention.bg} ${mention.border} border-2 relative overflow-hidden group`}>
               <div className="absolute top-0 left-0 p-8 text-indigo-500/5 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                  <Calculator size={180} />
               </div>
               <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-full text-xs font-black uppercase tracking-widest text-slate-500 shadow-sm border border-white/40">
                    <Star size={14} className="text-amber-500" />
                    المعدل الحالي
                  </div>
                  <div className="space-y-1">
                    <div className={`text-9xl font-black tracking-tighter ${mention.color}`}>
                      {currentAvg.toFixed(2)}
                    </div>
                    <div className="text-slate-400 font-bold text-lg uppercase tracking-tight">نقطة الدورة</div>
                  </div>
                  <div className={`text-4xl font-black ${mention.color} px-8 py-3 rounded-[1.5rem] bg-white/40 dark:bg-slate-800/20 backdrop-blur-md`}>
                    {mention.text}
                  </div>
               </div>
            </div>

            {/* Smart Insights Card */}
            <div className="p-10 bg-slate-900 rounded-[4rem] text-white shadow-3xl shadow-indigo-500/20 space-y-8 relative overflow-hidden group">
               <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Lightbulb size={240} />
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-500 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <Zap className="text-amber-300" />
                  </div>
                  <h4 className="text-3xl font-black tracking-tight">توصية ذكية</h4>
               </div>
               <p className="text-slate-300 text-lg leading-relaxed font-medium">
                 أقوى مادة تأثيراً في مسارك هي <span className="text-white font-black underline decoration-amber-400 decoration-4 underline-offset-8">{smartAnalysis.topSubject?.name}</span>. تحسين نقطة واحدة فيها يرفع معدلك بـ <span className="text-indigo-400 font-black">+{smartAnalysis.pointImpact}</span>!
               </p>
               <div className="pt-4">
                  <button onClick={() => setActiveTab('analysis')} className="w-full py-5 bg-white text-indigo-900 rounded-[1.8rem] font-black text-base hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                    استكشف فرص التطوير
                  </button>
               </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-emerald-600">
                      <Target size={26} />
                    </div>
                    <h4 className="font-black text-2xl">تتبع الهدف</h4>
                  </div>
                  <Info size={18} className="text-slate-300" />
               </div>
               
               <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">المعدل المنشود</span>
                    <span className="text-5xl font-black text-emerald-600">{targetAverage.toFixed(1)}</span>
                 </div>
                 <input 
                  type="range" 
                  min="10" 
                  max="20" 
                  step="0.1" 
                  value={targetAverage} 
                  onChange={(e) => setTargetAverage(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                 />
               </div>

               <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] space-y-4">
                  <div className="text-sm font-bold text-slate-500 text-center">المسافة نحو الهدف</div>
                  <div className="relative h-4 bg-white dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="absolute top-0 right-0 h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                      style={{ width: `${Math.min(100, (currentAvg / targetAverage) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-xs font-black text-emerald-600 uppercase tracking-widest">
                    {currentAvg >= targetAverage ? 'الهدف محقق بنجاح!' : `${Math.round((currentAvg / targetAverage) * 100)}% مكتمل`}
                  </div>
               </div>
            </div>
          </aside>
        </section>

        {/* Dynamic Calculator Section */}
        <section className="bg-white dark:bg-slate-900/50 rounded-[4.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="p-12 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-10 bg-white/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-inner border border-indigo-100/30">
                 <BookOpen size={40} />
               </div>
               <div>
                 <h3 className="text-4xl font-black tracking-tight">لائحة المواد</h3>
                 <p className="text-slate-400 text-lg font-bold">دورة {state.currentSemester === 'S1' ? 'الفصل الأول' : 'الفصل الثاني'}</p>
               </div>
            </div>

            <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-2 rounded-[2.2rem] w-full lg:w-auto shadow-inner border border-slate-200/50 dark:border-slate-700/50">
              <button 
                onClick={() => setState(prev => ({ ...prev, currentSemester: 'S1' }))}
                className={`flex-1 lg:w-48 py-4 rounded-[1.8rem] font-black text-base transition-all duration-500 ${state.currentSemester === 'S1' ? 'bg-white dark:bg-slate-700 shadow-2xl text-indigo-600 scale-100' : 'text-slate-400 hover:text-slate-600 scale-95 opacity-60'}`}
              >الدورة 1</button>
              <button 
                onClick={() => setState(prev => ({ ...prev, currentSemester: 'S2' }))}
                className={`flex-1 lg:w-48 py-4 rounded-[1.8rem] font-black text-base transition-all duration-500 ${state.currentSemester === 'S2' ? 'bg-white dark:bg-slate-700 shadow-2xl text-indigo-600 scale-100' : 'text-slate-400 hover:text-slate-600 scale-95 opacity-60'}`}
              >الدورة 2</button>
            </div>
          </div>

          <div className="p-4 lg:p-10">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right">
                <thead className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] bg-slate-50/50 dark:bg-slate-800/30">
                  <tr>
                    <th className="px-10 py-8 rounded-r-[2.5rem]">المادة الدراسية</th>
                    <th className="px-10 py-8 text-center">المعامل</th>
                    <th className="px-10 py-8 text-center">النقطة (/20)</th>
                    <th className="px-10 py-8 text-center">أعلى نقطة</th>
                    <th className="px-10 py-8 text-center rounded-l-[2.5rem]">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentSubjects.map((subject, idx) => (
                    <tr key={subject.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all duration-300">
                      <td className="px-10 py-10">
                        <div className="flex flex-col gap-1">
                          <input 
                            type="text" 
                            value={subject.name}
                            onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                            className="bg-transparent border-none focus:ring-0 w-full font-black text-2xl text-slate-800 dark:text-slate-200"
                          />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">المادة رقم {idx + 1}</span>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex items-center justify-center gap-4">
                           <button 
                            onClick={() => updateSubject(subject.id, 'coef', Math.max(0.5, subject.coef - 0.5))}
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                           >-</button>
                           <span className="font-black text-2xl w-12 text-center text-indigo-600 dark:text-indigo-400">{subject.coef}</span>
                           <button 
                            onClick={() => updateSubject(subject.id, 'coef', subject.coef + 0.5)}
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                           >+</button>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className="relative flex justify-center group/input">
                          <input 
                            type="number" 
                            step="0.25"
                            placeholder="--"
                            value={subject.grade === null ? '' : subject.grade}
                            onChange={(e) => updateSubject(subject.id, 'grade', e.target.value)}
                            className={`mx-auto w-36 bg-white dark:bg-slate-800 border-[4px] rounded-[2.2rem] text-center font-black text-4xl py-5 focus:ring-[12px] focus:ring-indigo-500/10 transition-all shadow-xl hover:scale-105 active:scale-95 ${subject.grade !== null ? (subject.grade >= 10 ? 'border-emerald-200 text-emerald-600 dark:border-emerald-900/40' : 'border-rose-200 text-rose-600 dark:border-rose-900/40') : 'border-slate-100 dark:border-slate-800'}`}
                          />
                          <div className="absolute -top-3 -right-3 opacity-0 group-hover/input:opacity-100 transition-opacity">
                             <div className="p-2 bg-indigo-600 rounded-lg text-white text-[10px] font-black">تحرير</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                           <Trophy size={28} className={subject.grade && subject.grade >= 16 ? "text-amber-500" : "text-slate-300"} />
                        </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <button onClick={() => deleteSubject(subject.id)} className="w-14 h-14 flex items-center justify-center rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-90">
                          <Trash2 size={24} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-12 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-8 items-center justify-between">
            <button 
              onClick={addSubject}
              className="px-12 py-6 bg-indigo-600 text-white rounded-[2.2rem] font-black text-lg flex items-center gap-5 hover:bg-indigo-700 hover:shadow-3xl hover:shadow-indigo-500/30 transition-all active:scale-95 shadow-xl"
            >
              <Plus size={28} />
              <span>إضافة مادة مخصصة</span>
            </button>

            <div className="flex gap-4">
              <button 
                onClick={() => { if(confirm('إعادة تعيين كافة البيانات الافتراضية؟')) selectLevel(state.levelId!, state.yearId!); }}
                className="px-8 py-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[2rem] font-black text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
              >إعادة تهيئة المسار</button>
            </div>
          </div>
        </section>
      </main>

      {/* Persistence and Quality Indicator */}
      <div className="fixed bottom-10 right-10 z-50 pointer-events-none sm:pointer-events-auto">
         <div className="glass-panel px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-3xl flex items-center gap-5 border border-white dark:border-slate-800/50">
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
           <span className="opacity-80">MassarCalc V4.0 Pro Max</span>
         </div>
      </div>

      {/* Advanced Performance Dashboard Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl transition-all duration-700">
          <div className="bg-white dark:bg-slate-900 w-full max-w-7xl rounded-[6rem] shadow-3xl overflow-hidden animate-in slide-in-from-bottom-32 duration-700 max-h-[95vh] flex flex-col border border-white/10 dark:border-slate-800">
            
            <div className="p-16 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-10">
                 <div className="w-24 h-24 bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-[2.5rem] text-white shadow-3xl flex items-center justify-center transform -rotate-3">
                   <LayoutDashboard size={48} />
                 </div>
                 <div>
                   <h3 className="text-5xl font-black tracking-tighter">لوحة التحكم الأكاديمية</h3>
                   <p className="text-slate-400 text-xl font-bold">تقرير تفصيلي شامل لأدائك في متم الدورة</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center group active:scale-90"
              >
                <Plus size={40} className="rotate-45 group-hover:scale-125 transition-transform duration-500" />
              </button>
            </div>

            <div className="p-16 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                <div className="lg:col-span-8 space-y-16">
                  {/* High Impact KPI Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                     <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-12 rounded-[4rem] text-center space-y-4 border border-indigo-100 dark:border-indigo-900/30">
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">المعدل السنوي</span>
                        <div className="text-7xl font-black text-indigo-600 tracking-tighter">{annualAvg.toFixed(2)}</div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 rounded-full text-white text-[10px] font-black uppercase">تقديري</div>
                     </div>
                     <div className="bg-amber-50/50 dark:bg-amber-900/10 p-12 rounded-[4rem] text-center space-y-4 border border-amber-100 dark:border-amber-900/30">
                        <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em]">تقدير الميزة</span>
                        <div className={`text-4xl font-black ${mention.color}`}>{mention.text}</div>
                        <div className="text-xs font-bold text-slate-500">حسب المعايير المعمول بها</div>
                     </div>
                     <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-12 rounded-[4rem] text-center space-y-4 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em]">المواد المنجزة</span>
                        <div className="text-6xl font-black text-emerald-600">
                          {currentSubjects.filter(s => s.grade !== null).length}
                          <span className="text-2xl text-slate-300 mx-2">/</span>
                          {currentSubjects.length}
                        </div>
                        <p className="text-xs font-bold text-slate-500">تغطية شاملة للمنهاج</p>
                     </div>
                  </div>

                  {/* Comprehensive Visual Charts */}
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-16 rounded-[5rem] space-y-12">
                    <div className="flex justify-between items-center">
                       <h4 className="text-3xl font-black text-slate-800 dark:text-slate-200">تحليل الأداء حسب المادة</h4>
                       <div className="flex items-center gap-3 px-6 py-2 bg-white dark:bg-slate-700 rounded-2xl text-xs font-black shadow-sm">
                          <TrendingUp size={16} className="text-indigo-500" />
                          <span>الدورة الحالية</span>
                       </div>
                    </div>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke={state.isDarkMode ? '#1e293b' : '#f1f5f9'} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: state.isDarkMode ? '#64748b' : '#94a3b8' }} />
                          <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900 }} />
                          <RechartsTooltip 
                            cursor={{ fill: 'rgba(79, 70, 229, 0.05)', radius: [25, 25, 0, 0] }}
                            contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 40px 60px -15px rgb(0 0 0 / 0.2)', background: state.isDarkMode ? '#020617' : '#fff', padding: '24px' }}
                            itemStyle={{ fontWeight: 900, color: '#4f46e5', fontSize: '1.2rem' }}
                          />
                          <Bar dataKey="grade" radius={[20, 20, 0, 0]} barSize={60}>
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.grade >= 10 ? '#10b981' : '#f43f5e'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                  <div className="p-12 bg-indigo-600 rounded-[4rem] text-white shadow-3xl shadow-indigo-500/40 space-y-10 relative overflow-hidden group">
                     <Star size={160} className="absolute -bottom-16 -left-16 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
                     <h4 className="text-3xl font-black leading-tight">الرؤية الاستراتيجية</h4>
                     <div className="space-y-8">
                        <div className="flex gap-6">
                           <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl">1</div>
                           <p className="text-base font-bold opacity-90 leading-relaxed">ركز جهودك على <span className="underline decoration-amber-400 decoration-4 underline-offset-8">{smartAnalysis.topSubject?.name}</span> لضمان رفع المعدل بأسرع طريقة ممكنة.</p>
                        </div>
                        <div className="flex gap-6">
                           <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl">2</div>
                           <p className="text-base font-bold opacity-90 leading-relaxed">أنت الآن في منطقة <span className="px-3 py-1 bg-white/30 rounded-lg">{mention.text}</span>، اطمح للميزة الموالية عبر تعزيز المواد العلمية.</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <button 
                      onClick={() => window.print()} 
                      className="w-full py-8 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[3rem] font-black text-xl flex items-center justify-center gap-5 hover:scale-[1.02] transition-all shadow-3xl active:scale-95 group"
                    >
                      <FileText size={32} className="group-hover:translate-y-1 transition-transform" />
                      <span>تصدير التقرير PDF</span>
                    </button>
                    <button 
                      onClick={() => {
                        const msg = `أنهيت الدورة بمعدل ${currentAvg.toFixed(2)} بفضل حسابي برو ماكس! 🎓🚀`;
                        if(navigator.share) navigator.share({ title: 'إنجازي الدراسي', text: msg });
                      }}
                      className="w-full py-8 bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 rounded-[3rem] font-black text-xl flex items-center justify-center gap-5 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                      <Share2 size={32} className="text-indigo-600" />
                      <span>مشاركة النتائج</span>
                    </button>
                  </div>

                  <div className="p-12 bg-slate-50 dark:bg-slate-800/50 rounded-[4rem] border border-slate-100 dark:border-slate-800 flex items-center gap-8 shadow-sm">
                     <div className="w-20 h-20 rounded-[1.8rem] bg-white dark:bg-slate-700 flex items-center justify-center shadow-xl border border-slate-100/50">
                        <User size={40} className="text-slate-400" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">ملف التلميذ</p>
                        <p className="text-2xl font-black">{EDUCATION_SYSTEM[state.levelId!].label}</p>
                     </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
