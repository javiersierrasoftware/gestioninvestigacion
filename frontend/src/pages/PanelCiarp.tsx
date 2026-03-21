import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LayoutDashboard, FileText, CheckCircle, XCircle, AlertTriangle, Eye, Download, Briefcase } from 'lucide-react';

export const PanelCiarp = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search State
  const [filterDocente, setFilterDocente] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [comentarios, setComentarios] = useState('');
  
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ciarp/all');
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching CIARP requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadEvidence = async (filename: string, originalName: string) => {
     try {
        const response = await api.get(`/ciarp/download/${filename}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', originalName || filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
     } catch (e: any) {
        alert('Error: Archivo no disponible o eliminado.');
     }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleEvaluate = async (statusArg: string) => {
    if (!selectedRequest) return;
    if ((statusArg === 'Rechazado' || statusArg === 'Requiere Ajustes') && comentarios.trim() === '') {
       return alert('Debe justificar la decisión escribiendo un comentario.');
    }

    try {
       await api.put(`/ciarp/evaluate/${selectedRequest._id}`, {
          status: statusArg,
          comentariosComite: comentarios
       });
       alert(`La solicitud ha sido marcada como: ${statusArg}`);
       setSelectedRequest(null);
       fetchRequests();
    } catch (e: any) {
       alert(e.response?.data?.message || 'Error al evaluar la solicitud.');
    }
  };

  // Logic: Filtering & Pagination
  const filteredRequests = requests.filter(req => {
    const matchDocente = filterDocente ? req.docenteId?.name?.toLowerCase().includes(filterDocente.toLowerCase()) : true;
    const matchProduct = filterProduct ? req.productId?.title?.toLowerCase().includes(filterProduct.toLowerCase()) : true;
    const matchStatus = filterStatus ? req.status === filterStatus : true;
    return matchDocente && matchProduct && matchStatus;
  });

  const paginatedRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprobado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rechazado': return 'bg-red-100 text-red-800 border-red-200';
      case 'Requiere Ajustes': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="animate-fade-in pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bandeja CIARP</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Comité de Asignación y Reconocimiento de Puntaje Salarial.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col pt-3">
        <div className="p-3 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full bg-slate-50 border border-gray-200 rounded-md flex items-center px-3 py-2">
            <input type="text" className="w-full bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400" placeholder="Filtrar por Docente..." value={filterDocente} onChange={e => setFilterDocente(e.target.value)} />
          </div>
          <div className="flex-[2] w-full bg-white border border-gray-200 rounded-md flex items-center px-3 py-2 shadow-sm">
            <span className="text-gray-400 mr-2">🔍</span>
            <input type="text" className="w-full bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400" placeholder="Buscar por título de producto..." value={filterProduct} onChange={e => setFilterProduct(e.target.value)} />
          </div>
          <div className="flex-1 w-full bg-white border border-gray-200 rounded-md flex items-center px-3 py-2 shadow-sm">
            <span className="text-gray-400 mr-2">▽</span>
            <select className="w-full bg-transparent text-sm outline-none text-slate-700 appearance-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Todos los Estados</option>
              <option value="En Estudio CIARP">En Estudio CIARP</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Requiere Ajustes">Requiere Ajustes</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 font-bold">Cargando solicitudes...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center">
            <LayoutDashboard size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-bold text-gray-600 mb-2">Sin Resultados</p>
            <p className="text-gray-400">No se encontraron solicitudes que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#fcfdfc] border-b border-gray-100 text-gray-800">
                  <tr>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Fecha / Docente</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-wider w-1/3">Producto Especial</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-wider text-center">Petitorio</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-wider text-center">Estado</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-wider text-right">Aval CIARP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                  {paginatedRequests.map(req => {
                    const reqDate = new Date(req.createdAt).toLocaleDateString('es-CO');
                    return (
                      <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 align-top">
                          <span className="text-xs text-gray-400 font-mono block mb-1">{reqDate}</span>
                          <span className="text-sm font-bold text-gray-900 block">{req.docenteId?.name || 'Desconocido'}</span>
                          <span className="text-xs text-secondary">{req.docenteId?.email}</span>
                        </td>
                        <td className="p-4 align-top">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase block w-max mb-1 border bg-gray-50 text-gray-600">
                            {req.productId?.type || 'Tipo No Definido'}
                          </span>
                          <p className="text-sm text-gray-900 font-medium leading-snug">{req.productId?.title || 'Producto Eliminado'}</p>
                        </td>
                        <td className="p-4 align-top text-center">
                          <p className="font-bold text-primary-700 text-sm whitespace-nowrap">{req.tipoReconocimiento}</p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">{req.puntosSolicitados} valor</p>
                        </td>
                        <td className="p-4 align-top text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border whitespace-nowrap inline-block ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 align-top text-right">
                          <button className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] font-medium px-4 py-1.5 shadow-sm transition-all rounded-full whitespace-nowrap inline-flex items-center" onClick={() => {
                            setSelectedRequest(req);
                            setComentarios(req.comentariosComite || '');
                          }}>
                            <Eye size={14} className="mr-1.5" /> Revisar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="bg-[#fcfdfc] border-t border-gray-100 p-3 px-4 flex justify-between items-center text-xs text-secondary rounded-b-xl">
              <span>Mostrando {paginatedRequests.length} de {filteredRequests.length} solicitudes</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30"
                >&lt;</button>
                <button className="w-6 h-6 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded font-medium">{currentPage}</button>
                <button
                  disabled={currentPage * pageSize >= filteredRequests.length}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30"
                >&gt;</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* EVALUATION MODAL */}
      {selectedRequest && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="bg-primary-900 p-5 flex justify-between items-center text-white shrink-0">
                 <div>
                   <h3 className="font-extrabold text-xl flex items-center">
                     <Briefcase className="mr-2"/> Panel de Decisión CIARP
                   </h3>
                   <span className="text-xs text-primary-200 mt-1 block">Analizando petición del docente: {selectedRequest.docenteId?.name}</span>
                 </div>
                 <button className="text-white/70 hover:text-white" onClick={() => setSelectedRequest(null)}><XCircle size={28}/></button>
               </div>
               
               <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* LEFT COL: Request Info */}
                  <div className="space-y-6">
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Producto Postulado</label>
                       <h4 className="font-bold text-lg text-gray-900 leading-snug">{selectedRequest.productId?.title}</h4>
                       <span className="inline-block mt-2 bg-gray-100 font-mono text-gray-600 text-xs px-2 py-1 rounded">{selectedRequest.productId?.uniqueId || 'Sin Identificador Cnt.'}</span>
                    </div>

                    <div className="bg-primary-50/50 border border-primary-100 p-4 rounded-xl">
                       <label className="text-xs font-bold text-primary-600 uppercase tracking-widest block mb-1">Petición Formal del Docente</label>
                       <p className="text-2xl font-black text-primary-800 mb-1">{selectedRequest.puntosSolicitados} <span className="text-lg font-bold text-primary-600">{selectedRequest.tipoReconocimiento === 'Bonificación' ? 'Pesos / Factor' : 'Puntos'}</span></p>
                       <p className="text-sm font-medium text-gray-700">Por concepto de: <strong className="text-primary-700">{selectedRequest.tipoReconocimiento}</strong></p>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Material Probatorio (Evidencias)</label>
                       {selectedRequest.evidencias?.length === 0 ? (
                          <div className="p-4 bg-orange-50 text-orange-800 text-sm border border-orange-200 rounded-lg flex items-center">
                             <AlertTriangle size={18} className="mr-2 shrink-0"/> No hay archivos adjuntos.
                          </div>
                       ) : (
                          <ul className="space-y-3">
                            {selectedRequest.evidencias.map((ev: any, i: number) => (
                               <li key={i} className="flex flex-col bg-white border border-gray-200 p-3 rounded-lg shadow-sm hover:border-primary-300 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                     <div className="flex items-center text-xs font-bold text-gray-700">
                                       <FileText size={14} className="mr-1.5 text-red-500" /> Archivo {i+1}
                                     </div>
                                     <button onClick={() => handleDownloadEvidence(ev.fileUrl, ev.originalName)} className="text-[10px] font-bold uppercase bg-primary-100 text-primary-700 hover:bg-primary-200 px-2 py-1 rounded-full flex items-center transition-colors">
                                       <Download size={10} className="mr-1"/> Ver o Descargar
                                     </button>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap leading-relaxed">{ev.description}</p>
                                  <p className="text-[10px] text-gray-400 font-mono mt-1 w-full truncate" title={ev.originalName}>{ev.originalName}</p>
                               </li>
                            ))}
                          </ul>
                       )}
                    </div>
                  </div>

                  {/* RIGHT COL: Resolution */}
                  <div className="flex flex-col border-l md:pl-8 border-gray-100">
                     <div className="mb-4">
                       <label className="text-sm font-bold text-gray-900 block mb-2 flex items-center">
                         Acta / Comentarios de Resolución CIARP
                       </label>
                       <p className="text-xs text-secondary mb-3">Redacte un veredicto técnico basado en el Decreto 1279. Este comentario será visible para el docente si la solicitud es rechazada o requiere correcciones operativas.</p>
                       <textarea 
                          className="form-input w-full h-48 text-sm resize-none"
                          placeholder="Ej: Revisada la evidencia, se constata que la revista ostenta categoría A1 según Publindex en la ventana de observación requerida. Se avalan los 15 puntos salariales conforme al artículo..."
                          value={comentarios}
                          onChange={e => setComentarios(e.target.value)}
                       ></textarea>
                     </div>

                     <div className="mt-auto space-y-3 pt-6 border-t border-gray-100">
                       <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Votación Oficial del Comité</p>
                       
                       <button onClick={() => handleEvaluate('Aprobado')} className="w-full btn bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 py-3 text-sm font-bold flex justify-center items-center">
                         <CheckCircle size={18} className="mr-2"/> Aprobar Petición y Asignar
                       </button>
                       
                       <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => handleEvaluate('Requiere Ajustes')} className="w-full btn bg-white border-2 border-orange-400 text-orange-600 hover:bg-orange-50 py-2 text-xs font-bold flex justify-center items-center">
                           <AlertTriangle size={14} className="mr-1.5"/> Pedir Ajustes
                         </button>
                         <button onClick={() => handleEvaluate('Rechazado')} className="w-full btn bg-white border-2 border-red-400 text-red-600 hover:bg-red-50 py-2 text-xs font-bold flex justify-center items-center">
                           <XCircle size={14} className="mr-1.5"/> Rechazar
                         </button>
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
