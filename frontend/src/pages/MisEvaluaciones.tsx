import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  FileText, CheckCircle, Clock, X, Award, Search, Download, Settings2, 
  ChevronDown, Eye, EyeOff, LayoutDashboard
} from 'lucide-react';

export const MisEvaluaciones = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Evaluation View
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [criterionComments, setCriterionComments] = useState<Record<string, string>>({});
  const [comments, setComments] = useState('');
  
  // Table tools states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterConvocatoria, setFilterConvocatoria] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    proyecto: true,
    convocatoria: true,
    estado: true,
    accion: true
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const { data } = await api.get('/projects/evaluations/me');
      setProjects(data);
    } catch (error) {
      console.error(error);
      alert('Error cargando sus asignaciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvaluation = (proj: any) => {
    setActiveProject(proj);
    setScores({});
    setCriterionComments({});
    setComments('');
    
    // Si ya está evaluado o en progreso, cargar datos previos para lectura
    const myEval = proj.evaluations?.find((e: any) => e.evaluator === user?.id || e.evaluator._id === user?.id);
    if (myEval && (myEval.status === 'evaluado' || myEval.status === 'evaluando')) {
       setScores(myEval.scores || {});
       setCriterionComments(myEval.criterionComments || {});
       setComments(myEval.comments || '');
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();

    if (!isDraft && !window.confirm('¿Está seguro de dictaminar de manera definitiva este proyecto? Una vez cerrado, no podrá cambiar los puntajes.')) {
       return;
    }

    try {
       await api.post(`/projects/${activeProject._id}/evaluate`, { 
         scores, 
         criterionComments,
         comments, 
         status: isDraft ? 'evaluando' : 'evaluado' 
       });
       alert(isDraft ? 'Progreso guardado temporalmente.' : '¡Evaluación cerrada exitosamente!');
       setActiveProject(null);
       fetchEvaluations(); // refrescar lista
    } catch (error) {
       console.error(error);
       alert('Error al guardar la evaluación.');
    }
  };

  const renderDynamicResponse = (field: any, response: any) => {
    if (!response) return <em className="text-gray-400">Sin respuesta</em>;
    if (field.type === 'table' && Array.isArray(response)) {
      return (
        <div className="overflow-x-auto rounded border border-gray-100 mt-2">
          <table className="w-full text-left bg-white text-xs">
            <thead>
              <tr className="bg-gray-50 border-b">
                {field.columns?.map((col: string, i: number) => <th key={i} className="p-2 font-bold text-gray-600">{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {response.map((row: any, rIdx: number) => (
                <tr key={rIdx} className="border-b last:border-0 hover:bg-gray-50/50">
                  {field.columns?.map((col: string, cIdx: number) => <td key={cIdx} className="p-2 text-gray-600">{row[col] || '-'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <span className="whitespace-pre-wrap">{String(response)}</span>;
  };

  const getMyEvalState = (proj: any) => {
    return proj.evaluations?.find((e: any) => e.evaluator === user?.id || e.evaluator?._id === user?.id) || {};
  };

  if (loading) return <div className="text-center py-20 text-secondary">Cargando mis encargos...</div>;

  return (
    <div className="animate-fade-in pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <LayoutDashboard size={32} className="text-emerald-600" />
             Mis Evaluaciones Asignadas
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Lista de proyectos en los que se le ha designado como Par Evaluador.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 mb-10 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 p-6 bg-white border-b border-slate-100">
          <div 
            className="flex-1 flex items-center gap-3 shadow-sm bg-white"
            style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '6px', 
              padding: '0 12px',
              height: '36px'
            }}
          >
            <Search size={14} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por proyecto, convocatoria o estado..." 
              className="w-full font-medium text-slate-700 outline-none placeholder:text-slate-400"
              style={{ 
                background: 'transparent',
                border: 'none', 
                outline: 'none', 
                fontSize: '9.5px',
                height: '100%',
                textTransform: 'uppercase'
              }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-row gap-2">
            <div className="relative">
              <button 
                className="shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tight transition-all active:scale-95"
                style={{
                  backgroundColor: showColumnMenu ? '#f8fafc' : '#ffffff',
                  color: showColumnMenu ? '#0f172a' : '#64748b',
                  border: showColumnMenu ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0 16px',
                  fontSize: '9.5px',
                  height: '36px',
                  minWidth: '120px'
                }}
                onClick={() => setShowColumnMenu(!showColumnMenu)}
              >
                <Settings2 size={13} className={showColumnMenu ? 'text-primary-600' : ''} />
                <span>Columnas</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${showColumnMenu ? 'rotate-180' : ''}`} />
              </button>

              {showColumnMenu && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                        <Settings2 size={14} />
                      </div>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest leading-none">Configurar Vista</span>
                    </div>
                    <button onClick={() => setShowColumnMenu(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="p-2 space-y-1">
                    {[
                      { id: 'proyecto', label: 'Proyecto a Evaluar' },
                      { id: 'convocatoria', label: 'Convocatoria Raíz' },
                      { id: 'estado', label: 'Estado Evaluación' },
                      { id: 'accion', label: 'Botón de Acción' }
                    ].map(col => (
                      <label key={col.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50/50 rounded-xl cursor-pointer transition-all group relative overflow-hidden">
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${visibleColumns[col.id as keyof typeof visibleColumns] ? 'text-slate-800' : 'text-slate-400'}`}>
                          {col.label}
                        </span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={visibleColumns[col.id as keyof typeof visibleColumns]} 
                          onChange={() => setVisibleColumns(prev => ({ ...prev, [col.id]: !prev[col.id as keyof typeof prev] }))}
                        />
                        <div className={`p-1.5 rounded-lg transition-all duration-300 ${visibleColumns[col.id as keyof typeof visibleColumns] ? 'text-emerald-600 bg-emerald-100 shadow-sm shadow-emerald-200/50 scale-110' : 'text-slate-300 bg-slate-100'}`}>
                          {visibleColumns[col.id as keyof typeof visibleColumns] ? <Eye size={14} /> : <EyeOff size={14} />}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold italic leading-tight uppercase tracking-tighter text-center">
                      Seleccione los campos a visualizar en sus compromisos evaluativos.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tight transition-all active:scale-95"
              style={{
                backgroundColor: '#ffffff',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0 16px',
                fontSize: '9.5px',
                height: '36px',
                minWidth: '120px'
              }}
              onClick={() => {
                const rows = projects.map(p => [p.title, p.convocatoria?.title, p.status]);
                let csvContent = "data:text/csv;charset=utf-8,Proyecto,Convocatoria,Estado\n" 
                  + rows.map(e => e.join(",")).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Mis_Evaluaciones_${user?.name?.replace(/ /g, '_')}.csv`);
                document.body.appendChild(link);
                link.click();
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.color = '#047857'; e.currentTarget.style.borderColor = '#dcfce7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <Download size={13} className="text-emerald-600" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="card text-center py-16 bg-white border border-dashed border-gray-200 shadow-none m-6">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-bold text-gray-600">No tiene proyectos asignados</p>
            <p className="text-sm text-gray-400">Cuando la División de Investigación le asigne un proyecto, aparecerá aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {visibleColumns.proyecto && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '11px' }}>Proyecto a Evaluar</th>}
                  {visibleColumns.convocatoria && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '11px' }}>Convocatoria Raíz</th>}
                  {visibleColumns.estado && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '11px' }}>Estado de su Evaluación</th>}
                  {visibleColumns.accion && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-right" style={{ fontSize: '11px' }}>Acción</th>}
                </tr>
                {/* Filter Row */}
                <tr className="bg-white/50 border-b border-slate-100/50" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {visibleColumns.proyecto && (
                    <th className="px-4 py-2">
                      <input 
                        type="text"
                        placeholder="Filtrar proyecto..."
                        className="w-full font-medium text-slate-500 outline-none transition-all placeholder:text-slate-300 border border-slate-200 rounded px-2 py-1"
                        style={{ fontSize: '11px', height: '28px' }}
                        value={filterProject}
                        onChange={e => setFilterProject(e.target.value)}
                      />
                    </th>
                  )}
                  {visibleColumns.convocatoria && (
                    <th className="px-4 py-2">
                      <input 
                        type="text"
                        placeholder="Filtrar convocatoria..."
                        className="w-full font-medium text-slate-500 outline-none transition-all placeholder:text-slate-300 border border-slate-200 rounded px-2 py-1"
                        style={{ fontSize: '11px', height: '28px' }}
                        value={filterConvocatoria}
                        onChange={e => setFilterConvocatoria(e.target.value)}
                      />
                    </th>
                  )}
                  {visibleColumns.estado && (
                    <th className="px-4 py-2">
                      <select 
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-500 outline-none transition-all"
                        style={{ fontSize: '11px', height: '28px' }}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                        <option value="">Estado...</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="evaluando">En progreso</option>
                        <option value="evaluado">Calificado</option>
                      </select>
                    </th>
                  )}
                  {visibleColumns.accion && <th className="px-4 py-2"></th>}
                </tr>
              </thead>
              <tbody className="bg-white">
                {projects.filter(p => {
                  const searchLower = searchTerm.toLowerCase();
                  const myEval = getMyEvalState(p);
                  const matchSearch = p.title?.toLowerCase().includes(searchLower) || 
                                     p.convocatoria?.title?.toLowerCase().includes(searchLower);
                  
                  const matchProject = filterProject ? p.title?.toLowerCase().includes(filterProject.toLowerCase()) : true;
                  const matchConvocatoria = filterConvocatoria ? p.convocatoria?.title?.toLowerCase().includes(filterConvocatoria.toLowerCase()) : true;
                  const matchStatus = filterStatus ? myEval.status?.toLowerCase().includes(filterStatus.toLowerCase()) : true;
                  
                  return matchSearch && matchProject && matchConvocatoria && matchStatus;
                }).map(proj => {
                  const myEval = getMyEvalState(proj);
                  const isEvaluado = myEval.status === 'evaluado';
                  return (
                    <tr 
                      key={proj._id} 
                      className="transition-all duration-200 text-slate-700 hover:bg-emerald-50/30" 
                      style={{ fontSize: '12px' }}
                    >
                      {visibleColumns.proyecto && (
                        <td className="px-6 py-5 font-black text-slate-800 uppercase tracking-tight leading-tight" style={{ borderBottom: '1px solid #dcfce7' }}>
                          {proj.title}
                        </td>
                      )}
                      {visibleColumns.convocatoria && (
                        <td className="px-6 py-5 text-slate-500 font-bold" style={{ borderBottom: '1px solid #dcfce7' }}>
                          {proj.convocatoria?.title}
                        </td>
                      )}
                      {visibleColumns.estado && (
                        <td className="px-6 py-5" style={{ borderBottom: '1px solid #dcfce7' }}>
                          <div className="flex items-center">
                            {isEvaluado ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <CheckCircle size={12} className="mr-1"/> Calificado ({myEval.totalScore} pts)
                              </span>
                            ) : myEval.status === 'evaluando' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px] bg-blue-50 text-blue-600 border border-blue-200">
                                <Clock size={12} className="mr-1"/> En progreso (Borrador)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px] bg-orange-50 text-orange-600 border border-orange-200">
                                <Clock size={12} className="mr-1"/> Pendiente por evaluar
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.accion && (
                        <td className="px-6 py-5 text-right" style={{ borderBottom: '1px solid #dcfce7' }}>
                          {isEvaluado ? (
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-all shadow-slate-200/50 active:scale-95" onClick={() => handleOpenEvaluation(proj)}>Ver mi dictamen</button>
                          ) : (
                            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all inline-flex items-center" onClick={() => handleOpenEvaluation(proj)}>
                              <Award size={14} className="mr-2" /> Entrar a Calificar
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULLSCREEN EVALUATION SPLIT-VIEW MODAL */}
      {activeProject && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 9999, padding: '0' }}>
          <div className="w-full h-screen flex flex-col md:flex-row bg-white overflow-hidden scale-in" onClick={e => e.stopPropagation()}>
             {/* LEFT SIDE: Project Document Reading */}
             <div className="w-full md:w-1/2 lg:w-[55%] h-full flex flex-col border-r border-gray-200 bg-gray-50">
               <div className="p-4 border-b bg-white flex justify-between items-center shrink-0">
                 <h3 className="font-bold text-gray-800">Expediente del Proyecto</h3>
                 <button className="md:hidden btn-ghost p-1 rounded-full text-red-500" onClick={() => setActiveProject(null)}><X size={20}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6">
                 <h2 className="text-xl font-bold text-primary-900 mb-2">{activeProject.title}</h2>
                 <p className="text-sm text-gray-600 mb-6 bg-white p-4 rounded-lg border border-gray-200">{activeProject.summary || 'Sin resumen...'}</p>

                 {activeProject.convocatoria?.dynamicFields?.map((field: any, idx: number) => {
                    const responseValue = activeProject.dynamicResponses?.[field.name];
                    return (
                      <div key={idx} className="mb-5 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h5 className="font-bold text-gray-800 text-sm mb-3 border-b pb-2">{field.label}</h5>
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {renderDynamicResponse(field, responseValue)}
                        </div>
                      </div>
                    );
                 })}
               </div>
             </div>

             {/* RIGHT SIDE: Rubric Evaluator */}
             <div className="w-full md:w-1/2 lg:w-[45%] h-full flex flex-col bg-white">
               <div className="p-4 shadow-sm border-b bg-primary-900 text-white flex justify-between items-center shrink-0">
                 <h3 className="font-bold flex items-center"><Award className="mr-2" size={18}/> Calificación por Rúbrica</h3>
                 <button className="hidden md:block hover:bg-white/20 p-1 rounded-full transition-colors" onClick={() => setActiveProject(null)}><X size={20}/></button>
               </div>
               <form onSubmit={(e) => handleSubmitEvaluation(e, false)} className="flex-1 overflow-y-auto p-6 flex flex-col">
                  {(!activeProject.convocatoria?.rubricId) ? (
                    <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 text-center">
                       <p className="font-bold">Error Crítico</p>
                       <p className="text-sm">Esta convocatoria no tiene una matriz de evaluación configurada. Contacte a soporte.</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-800 mb-1">{activeProject.convocatoria.rubricId.name}</h4>
                        <p className="text-sm text-gray-500">{activeProject.convocatoria.rubricId.description}</p>
                      </div>

                      <div className="space-y-6 flex-1">
                        {activeProject.convocatoria.rubricId.criteria.map((crit: any, idx: number) => (
                           <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                             <div className="flex justify-between items-start mb-2">
                               <h5 className="font-bold text-sm text-gray-800">{crit.name}</h5>
                               <span className="text-xs bg-primary-100 text-primary-800 font-bold px-2 py-0.5 rounded">Max: {crit.maxScore} pts</span>
                             </div>
                             <p className="text-xs text-gray-500 mb-4">{crit.description}</p>
                             
                             <div className="flex items-center gap-3">
                               <label className="text-xs font-bold text-gray-600 uppercase">Su Puntaje Asignado:</label>
                               <input 
                                 type="number" 
                                 min="0" max={crit.maxScore} step="0.1" required
                                 className="form-input w-24 text-sm font-bold text-primary-700"
                                 value={scores[crit._id] || ''}
                                 onChange={e => setScores({...scores, [crit._id]: e.target.value})}
                                 disabled={getMyEvalState(activeProject).status === 'evaluado'}
                               />
                             </div>

                             <div className="mt-3 pt-3 border-t border-gray-100">
                               <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Anotaciones / Justificación (Opcional)</label>
                               <textarea 
                                 className="form-input text-xs h-16 bg-white border-gray-100"
                                 placeholder="Justifique el puntaje para este criterio..."
                                 value={criterionComments[crit._id] || ''}
                                 onChange={e => setCriterionComments({...criterionComments, [crit._id]: e.target.value})}
                                 disabled={getMyEvalState(activeProject).status === 'evaluado'}
                               ></textarea>
                             </div>
                           </div>
                        ))}
                      </div>

                      <div className="mt-8 border-t pt-6">
                        <label className="text-sm font-bold text-gray-800 block mb-2">Observaciones Generales o Concepto</label>
                        <textarea 
                          className="form-input text-sm h-32" 
                          placeholder="Escriba aquí los argumentos o concepto del evaluador..."
                          required={getMyEvalState(activeProject).status !== 'evaluado'} // Only required for final submit conceptually (browser will validate on submit but not on button click)
                          value={comments}
                          onChange={e => setComments(e.target.value)}
                          disabled={getMyEvalState(activeProject).status === 'evaluado'}
                        ></textarea>
                      </div>

                      <div className="mt-6 flex flex-col md:flex-row justify-between items-center border-t pt-4 gap-4">
                        <div className="text-xl font-bold text-gray-800">
                           Total: {Object.values(scores).reduce((a, b) => a + Number(b || 0), 0)} pts
                        </div>
                        {getMyEvalState(activeProject).status !== 'evaluado' && (
                           <div className="flex gap-2">
                             <button type="button" className="btn btn-outline text-xs px-4" onClick={(e) => handleSubmitEvaluation(e, true)}>
                               Guardar Progreso
                             </button>
                             <button type="submit" className="btn btn-primary shadow-lg px-6 text-sm">Dictaminar y Cierre</button>
                           </div>
                        )}
                      </div>
                    </>
                  )}
               </form>
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
