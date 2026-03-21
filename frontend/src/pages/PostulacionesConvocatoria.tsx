import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Search, FileText, UserPlus, CheckCircle, Users, X, Clock, Calendar, Bookmark, Award, AlertTriangle } from 'lucide-react';

export const PostulacionesConvocatoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [convocatoria, setConvocatoria] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Step 3 States
  const [evaluators, setEvaluators] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [selectedEvaluatorIds, setSelectedEvaluatorIds] = useState<string[]>([]);
  const [showCreateEvaluator, setShowCreateEvaluator] = useState(false);
  const [newEvaluator, setNewEvaluator] = useState({ name: '', email: '', password: '', role: 'evaluador', facultad: '' });

  // Read Modal & Resolution States
  const [showReadModal, setShowReadModal] = useState(false);
  const [projectToRead, setProjectToRead] = useState<any | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<string>('');
  const [resolutionComments, setResolutionComments] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: convo }, { data: projs }, { data: allUsers }] = await Promise.all([
          api.get(`/convocatorias/${id}`),
          api.get(`/projects/convocatoria/${id}`),
          api.get('/users')
        ]);
        setConvocatoria(convo);
        setProjects(projs);
        setEvaluators(allUsers.filter((u: any) => u.role === 'evaluador' || u.role === 'docente'));
      } catch (e) {
        console.error(e);
        alert('Error cargando los datos de la convocatoria');
        navigate('/admin/convocatorias');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="text-center py-20 text-secondary">Cargando postulaciones...</div>;

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.investigadorPrincipal?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAssignModal = (proj: any) => {
    setActiveProject(proj);
    const currEvals = proj.evaluations?.map((e: any) => e.evaluator?._id) || [];
    setSelectedEvaluatorIds(currEvals);
    setShowAssignModal(true);
  };

  const handleSaveEvaluators = async () => {
    if (!activeProject) return;
    try {
      const res = await api.post(`/projects/${activeProject._id}/evaluators`, { evaluatorIds: selectedEvaluatorIds });
      setProjects(projects.map(p => p._id === res.data._id ? res.data : p));
      setShowAssignModal(false);
    } catch (e) {
      console.error(e);
      alert('Error asignando evaluadores. Inténtalo de nuevo.');
    }
  };

  const handleCreateEvaluator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', newEvaluator);
      setEvaluators([...evaluators, res.data]);
      setSelectedEvaluatorIds([...selectedEvaluatorIds, res.data._id]);
      setShowCreateEvaluator(false);
      setNewEvaluator({ name: '', email: '', password: '', role: 'evaluador', facultad: '' });
    } catch (error) {
       console.error(error);
       alert('Error registrando al evaluador. Es probable que el correo ya exista.');
    }
  };

  const handleOpenReadModal = (proj: any) => {
    setProjectToRead(proj);
    setResolutionStatus(proj.status === 'aprobado' || proj.status === 'rechazado' ? proj.status : '');
    setResolutionComments(proj.resolutionComments || '');
    setShowReadModal(true);
  };

  const handleResolveProject = async () => {
    if (!resolutionStatus) return alert('Debes seleccionar un estado final (Aprobado o Rechazado).');
    try {
      const res = await api.patch(`/projects/${projectToRead._id}/resolve`, { status: resolutionStatus, resolutionComments });
      setProjects(projects.map(p => p._id === res.data._id ? res.data : p));
      setProjectToRead(res.data);
      alert('Veredicto y Resolución oficial guardada con éxito.');
    } catch (e) {
      console.error(e);
      alert('Error guardando la resolución.');
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
                {field.columns?.map((col: string, i: number) => (
                  <th key={i} className="p-2 font-bold text-gray-600">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {response.map((row: any, rIdx: number) => (
                <tr key={rIdx} className="border-b last:border-0 hover:bg-gray-50/50">
                  {field.columns?.map((col: string, cIdx: number) => (
                    <td key={cIdx} className="p-2 text-gray-600">{row[col] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    return <span className="whitespace-pre-wrap">{String(response)}</span>;
  };

  return (
    <div className="animate-fade-in pb-10">
      <button onClick={() => navigate('/admin/convocatorias')} className="flex items-center text-secondary hover:text-primary-600 mb-6 transition-colors font-medium text-sm">
        <ArrowLeft size={16} className="mr-2" /> Volver a Convocatorias
      </button>

      <div className="card mb-8 border-l-4 border-l-primary-500">
        <h2 className="heading-2 text-primary-900 mb-1">{convocatoria?.title}</h2>
        <div className="flex items-center gap-4 text-sm text-secondary">
           <span className="font-bold">Código: {convocatoria?.number}</span>
           <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">Total postulaciones: {projects.length}</span>
           {convocatoria?.rubricId && (
              <span className="badge badge-success shadow-none bg-primary-50 text-primary-700">Rúbrica Vinculada</span>
           )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="heading-3">Proyectos Recibidos</h3>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título o autor..." 
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="card text-center py-16 bg-white border border-dashed border-gray-200 shadow-none">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-lg font-bold text-gray-600">No hay proyectos radicados</p>
          <p className="text-sm text-gray-400">Aún nadie ha postulado a esta convocatoria, o la búsqueda no arrojó resultados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-border-color overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-border-color text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Título del Proyecto</th>
                  <th className="p-4 font-bold">Resumen / Tema</th>
                  <th className="p-4 font-bold">Investigador (Responsable)</th>
                  <th className="p-4 font-bold">Pares Asignados</th>
                  <th className="p-4 font-bold text-right">Acciones (Paso 3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProjects.map(proj => (
                  <tr key={proj._id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="p-4 font-medium text-gray-800 max-w-[200px] truncate" title={proj.title}>
                      {proj.title}
                    </td>
                    <td className="p-4 max-w-[250px] text-gray-500 text-xs">
                      <p className="line-clamp-2" title={proj.summary || proj.dynamicResponses?.resumen_ejecutivo || proj.description || 'Sin resumen'}>
                        {proj.summary || proj.dynamicResponses?.resumen_ejecutivo || proj.description || <span className="italic text-gray-300">Sin resumen documentado</span>}
                      </p>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div>{proj.investigadorPrincipal?.name || 'Desconocido'}</div>
                      <div className="text-xs text-gray-400">{proj.investigadorPrincipal?.email}</div>
                    </td>
                    <td className="p-4">
                      {proj.status === 'aprobado' ? <span className="badge badge-success bg-[#32965D]/10 text-[#32965D] border border-[#32965D]/20"><Award size={12} className="mr-1"/> Aprobado Oficial</span> :
                       proj.status === 'rechazado' ? <span className="badge badge-warning bg-red-50 text-red-600 border border-red-200"><X size={12} className="mr-1"/> Rechazado Oficial</span> :
                       (!proj.evaluations || proj.evaluations.length === 0) ? (
                        <span className="badge badge-warning bg-orange-50 text-orange-600 border border-orange-200">Sin asignar</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {proj.evaluations.map((ev: any, i: number) => (
                            <span key={i} className="badge badge-success bg-[#32965D]/10 text-[#32965D] border border-[#32965D]/20 max-w-max truncate">
                              <Users size={10} className="mr-1"/> {ev.evaluator?.name?.split(' ')[0] || 'Evaluador'} ({ev.status})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="btn btn-outline py-1.5 px-3 text-xs md:text-xs mr-2" onClick={() => handleOpenReadModal(proj)}>
                        <FileText size={14} className="mr-1" /> Leer
                      </button>
                      <button className="btn btn-primary py-1.5 px-3 text-xs md:text-xs shadow-sm bg-primary-600 border-none hover:bg-primary-700" onClick={() => handleOpenAssignModal(proj)}>
                        <UserPlus size={14} className="mr-1" /> Asignar Pares
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showReadModal && projectToRead && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 9999, padding: '0' }}>
          <div className="card w-full max-w-5xl h-screen md:h-[95vh] flex flex-col bg-white overflow-hidden p-0 rounded-none md:rounded-2xl scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 flex-shrink-0">
               <div>
                 <h3 className="heading-3 text-primary-900 mb-1">{projectToRead.title}</h3>
                 <p className="text-secondary text-sm">Responsable: <strong className="text-primary-700">{projectToRead.investigadorPrincipal?.name}</strong> • {projectToRead.investigadorPrincipal?.email}</p>
               </div>
               <button className="btn-ghost p-1 bg-gray-200 hover:bg-gray-300 rounded-full" onClick={() => setShowReadModal(false)}><X size={20}/></button>
             </div>

             <div className="p-6 overflow-y-auto flex-1 bg-white">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Ficha Básica */}
                  <section>
                    <h4 className="flex items-center text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                      <Bookmark size={20} className="mr-2 text-primary-500"/> Información General
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Resumen Ejecutivo / Descripción</div>
                        <p className="text-sm text-gray-700 mt-1">{projectToRead.summary || projectToRead.description || 'No aplicó'}</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Duración Estimada</div>
                          <p className="text-sm text-gray-700 mt-1 flex items-center"><Clock size={16} className="mr-1 text-gray-400"/> {projectToRead.executionMonths || 0} Meses</p>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Fecha de Radicación</div>
                          <p className="text-sm text-gray-700 mt-1 flex items-center"><Calendar size={16} className="mr-1 text-gray-400"/> {new Date(projectToRead.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Equipo Investigador */}
                  {projectToRead.teamMembers && projectToRead.teamMembers.length > 0 && (
                    <section>
                      <h4 className="flex items-center text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                        <Users size={20} className="mr-2 text-primary-500"/> Equipo Investigador
                      </h4>
                      <div className="overflow-hidden border border-gray-100 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-500 text-xs">
                            <tr>
                              <th className="p-3">Nombre</th>
                              <th className="p-3">Id / Cédula</th>
                              <th className="p-3">Rol</th>
                              <th className="p-3">Dedicación (Hs/Mes)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {projectToRead.teamMembers.map((member: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50/50">
                                <td className="p-3 font-medium text-gray-800">{member.name || (member.user && member.user.name) || 'N/A'}</td>
                                <td className="p-3 text-gray-600">{member.identificationNumber || 'N/A'}</td>
                                <td className="p-3 text-gray-600 uppercase text-xs">{member.role}</td>
                                <td className="p-3 text-gray-600">{member.hoursPerMonth || 0} hrs</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Campos Dinámicos (Formulario de la Convocatoria) */}
                  <section>
                    <h4 className="flex items-center text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                      <FileText size={20} className="mr-2 text-primary-500"/> Documento Técnico (Formulario)
                    </h4>
                    
                    {(!convocatoria?.dynamicFields || convocatoria.dynamicFields.length === 0) ? (
                      <div className="p-6 text-center text-gray-400 border border-dashed rounded-xl bg-gray-50">
                        Esta convocatoria no requirió campos dinámicos específicos.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {convocatoria.dynamicFields.map((field: any, idx: number) => {
                          const responseValue = projectToRead.dynamicResponses?.[field.name];
                          return (
                            <div key={idx} className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                              <h5 className="font-bold text-primary-900 text-sm mb-2 flex items-start gap-2">
                                <span className="bg-primary-100 text-primary-700 w-5 h-5 flex items-center justify-center rounded-full text-xs shrink-0">{idx + 1}</span>
                                {field.label}
                              </h5>
                              <div className="pl-7 text-sm text-gray-700 leading-relaxed">
                                {renderDynamicResponse(field, responseValue)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* FASE 4: CONSOLIDADO DE PARES Y VEREDICTO */}
                  <section className="mt-12 border-t-2 pt-8">
                    <h4 className="flex items-center text-xl font-bold text-primary-900 border-b pb-2 mb-6">
                      <Award size={24} className="mr-2 text-primary-500"/> Calificaciones y Veredicto Final Institucional
                    </h4>
                    
                    {/* Tarjetas de Puntuación */}
                    {(!projectToRead.evaluations || projectToRead.evaluations.length === 0) ? (
                      <div className="p-4 bg-orange-50 text-orange-700 rounded-xl mb-6 flex items-start gap-3 border border-orange-200">
                         <AlertTriangle size={20} className="shrink-0"/>
                         <div>
                           <p className="font-bold text-sm">Sin calificaciones</p>
                           <p className="text-xs">Usted no ha asignado evaluadores a este proyecto o aún nadie lo ha calificado.</p>
                         </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                         {projectToRead.evaluations.map((ev: any, i: number) => (
                           <div key={i} className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
                             <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-sm text-gray-800">{ev.evaluator?.name || 'Evaluador'}</span>
                               <span className={`text-xs px-2 py-0.5 rounded font-bold ${ev.status === 'evaluado' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                 {ev.status === 'evaluado' ? `${ev.totalScore} Puntos` : 'Pendiente / En proceso'}
                               </span>
                             </div>
                             <div className="text-xs text-gray-500 italic border-l-2 pl-3 mt-3">
                               "{ev.comments || 'Aún no ha dejado comentarios conceptuales finales para este proyecto.'}"
                             </div>
                           </div>
                         ))}
                      </div>
                    )}

                    {/* Formulario de Resolución */}
                    <div className="bg-white border-2 border-primary-100 p-6 rounded-2xl shadow-sm">
                       <h5 className="font-bold text-gray-800 mb-4 border-b pb-2">Resolución Académica</h5>
                       
                       <div className="flex flex-col gap-5">
                          <div>
                            <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Dictamen Oficial a registrar</label>
                            <div className="flex gap-4">
                               <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${resolutionStatus === 'aprobado' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                 <input type="radio" name="resStatus" value="aprobado" checked={resolutionStatus === 'aprobado'} onChange={() => setResolutionStatus('aprobado')} className="text-green-600 focus:ring-green-500"/>
                                 <span className="font-bold text-sm text-green-700">✔️ Aprobar Proyecto</span>
                               </label>
                               <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${resolutionStatus === 'rechazado' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                 <input type="radio" name="resStatus" value="rechazado" checked={resolutionStatus === 'rechazado'} onChange={() => setResolutionStatus('rechazado')} className="text-red-600 focus:ring-red-500"/>
                                 <span className="font-bold text-sm text-red-700">❌ Rechazar / No cumple</span>
                               </label>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Justificación o Respuesta al Autor (Docente)</label>
                            <textarea 
                              className="form-input text-sm h-28" 
                              placeholder="Escriba la retroalimentación institucional para el docente sobre los motivos de aprobación o rechazo..."
                              value={resolutionComments}
                              onChange={e => setResolutionComments(e.target.value)}
                            ></textarea>
                          </div>
                          <div className="pt-2 text-right">
                            <button className="btn btn-primary px-8 shadow-md" onClick={handleResolveProject}>Sellar y Guardar Resolución</button>
                          </div>
                       </div>
                    </div>
                  </section>
                </div>
             </div>

             <div className="p-6 border-t bg-gray-50/80 flex justify-end gap-3 flex-shrink-0">
               <button className="btn btn-primary px-8 shadow-lg" onClick={() => setShowReadModal(false)}>Cerrar Lectura</button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {showAssignModal && activeProject && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="card w-full max-w-lg bg-white p-6 shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
            {showCreateEvaluator ? (
               <div className="animate-fade-in">
                 <h3 className="heading-3 mb-2 text-primary-900 border-b pb-4">Registrar Evaluador</h3>
                 <p className="text-secondary text-sm my-4">Agregue rápidamente un par externo al sistema.</p>
                 <form onSubmit={handleCreateEvaluator} className="flex flex-col gap-4">
                   <div className="form-group mb-0">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Nombre Completo *</label>
                     <input required type="text" className="form-input text-sm" value={newEvaluator.name} onChange={e => setNewEvaluator({...newEvaluator, name: e.target.value})} placeholder="Ej. Dr. Carlos Rodríguez"/>
                   </div>
                   <div className="form-group mb-0">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Correo Electrónico *</label>
                     <input required type="email" className="form-input text-sm" value={newEvaluator.email} onChange={e => setNewEvaluator({...newEvaluator, email: e.target.value})} placeholder="carlos.rod@universidad.edu"/>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="form-group mb-0">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Institución / Fac.</label>
                       <input type="text" className="form-input text-sm" value={newEvaluator.facultad} onChange={e => setNewEvaluator({...newEvaluator, facultad: e.target.value})} placeholder="Ej. U. de Antioquia"/>
                     </div>
                     <div className="form-group mb-0">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Contraseña temporal *</label>
                       <input required type="text" className="form-input text-sm" value={newEvaluator.password} onChange={e => setNewEvaluator({...newEvaluator, password: e.target.value})} placeholder="Ej. Par1234"/>
                     </div>
                   </div>
                   <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                     <button type="button" className="btn btn-outline px-6" onClick={() => setShowCreateEvaluator(false)}>Volver a la Lista</button>
                     <button type="submit" className="btn btn-primary shadow-lg"><UserPlus size={18} className="mr-2"/> Guardar y Asignar</button>
                   </div>
                 </form>
               </div>
            ) : (
               <div className="animate-fade-in">
                 <div className="flex justify-between items-center border-b pb-4 mb-2">
                    <h3 className="heading-3 text-primary-900">Asignar Evaluadores</h3>
                    <button className="btn btn-outline border-dashed border-primary-300 text-primary-600 bg-primary-50 hover:bg-primary-100 text-xs py-1" onClick={() => setShowCreateEvaluator(true)}>
                      <UserPlus size={14} className="mr-1"/> Registrar P. Externo
                    </button>
                 </div>
                 <p className="text-secondary text-sm my-4">
                   Seleccione de los docentes/pares del sistema para el proyecto: <strong className="text-gray-800">{activeProject.title}</strong>
                 </p>
                 
                 {evaluators.length === 0 ? (
                    <div className="p-4 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-200">
                       <span className="font-bold">No hay docentes ni evaluadores.</span>
                    </div>
                 ) : (
                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-6 px-1">
                      {evaluators.map(ev => (
                         <label key={ev._id} className={`flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors ${selectedEvaluatorIds.includes(ev._id) ? 'border-primary-400 bg-primary-50/20' : 'border-gray-100'}`}>
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" 
                             checked={selectedEvaluatorIds.includes(ev._id)} 
                             onChange={(e) => {
                               if (e.target.checked) setSelectedEvaluatorIds([...selectedEvaluatorIds, ev._id]);
                               else setSelectedEvaluatorIds(selectedEvaluatorIds.filter(id => id !== ev._id));
                             }}
                           />
                           <div>
                             <div className="font-bold text-gray-800 text-sm">{ev.name} <span className="text-[10px] bg-gray-100 text-gray-500 uppercase px-1.5 py-0.5 rounded ml-1">{ev.role}</span></div>
                             <div className="text-xs text-gray-500">{ev.email} • {ev.facultad || 'Externa/Otro'}</div>
                           </div>
                         </label>
                      ))}
                    </div>
                 )}
                 
                 <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button className="btn btn-outline px-6" onClick={() => setShowAssignModal(false)}>Cancelar</button>
                    <button className="btn btn-primary shadow-lg" onClick={handleSaveEvaluators} disabled={evaluators.length === 0}>
                      <CheckCircle size={18} className="mr-2"/> Asignar {selectedEvaluatorIds.length} Pares
                    </button>
                 </div>
               </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
