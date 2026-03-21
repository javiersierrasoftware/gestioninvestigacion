import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FileText, CheckCircle, Clock, X, Award } from 'lucide-react';

export const MisEvaluaciones = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Evaluation View
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');

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
    setComments('');
    
    // Si ya está evaluado o en progreso, cargar datos previos para lectura
    const myEval = proj.evaluations?.find((e: any) => e.evaluator === user?.id || e.evaluator._id === user?.id);
    if (myEval && (myEval.status === 'evaluado' || myEval.status === 'evaluando')) {
       setScores(myEval.scores || {});
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mis Evaluaciones Asignadas</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Lista de proyectos en los que se le ha designado como Par Evaluador.</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16 bg-white border border-dashed border-gray-200 shadow-none">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-lg font-bold text-gray-600">No tiene proyectos asignados</p>
          <p className="text-sm text-gray-400">Cuando la División de Investigación le asigne un proyecto, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-border-color overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                <th className="p-4 font-bold">Proyecto a Evaluar</th>
                <th className="p-4 font-bold">Convocatoria Raíz</th>
                <th className="p-4 font-bold">Estado de su Evaluación</th>
                <th className="p-4 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {projects.map(proj => {
                const myEval = getMyEvalState(proj);
                const isEvaluado = myEval.status === 'evaluado';
                return (
                  <tr key={proj._id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="p-4 font-medium text-gray-800 max-w-[250px] truncate" title={proj.title}>
                      {proj.title}
                    </td>
                    <td className="p-4 text-gray-600">
                      {proj.convocatoria?.title}
                    </td>
                    <td className="p-4">
                      {isEvaluado ? (
                        <span className="badge badge-success bg-[#32965D]/10 text-[#32965D] border border-[#32965D]/20"><CheckCircle size={12} className="mr-1"/> Calificado ({myEval.totalScore} pts)</span>
                      ) : myEval.status === 'evaluando' ? (
                        <span className="badge badge-warning bg-blue-50 text-blue-600 border border-blue-200"><Clock size={12} className="mr-1"/> En progreso (Borrador)</span>
                      ) : (
                        <span className="badge badge-warning bg-orange-50 text-orange-600 border border-orange-200"><Clock size={12} className="mr-1"/> Pendiente por evaluar</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isEvaluado ? (
                        <button className="btn btn-outline py-1.5 px-3 text-xs" onClick={() => handleOpenEvaluation(proj)}>Ver mi dictamen</button>
                      ) : (
                        <button className="btn btn-primary py-1.5 px-3 text-xs shadow-sm bg-primary-600" onClick={() => handleOpenEvaluation(proj)}>
                          <Award size={14} className="mr-1" /> Entrar a Calificar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
