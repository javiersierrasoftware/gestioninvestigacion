import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Plus, Edit2, Trash2, Settings, Calendar, Users, DollarSign, FileText, CheckCircle, X, Search, FolderOpen } from 'lucide-react';
import api from '../api/axios';

interface DynamicField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  helpText: string;
  placeholder: string;
  options?: string[];
  columns?: string[]; // For table/grid type
}

interface Convocatoria {
  _id: string;
  number: string;
  title: string;
  year: number;
  directedTo: string;
  budgetPerProject: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  rubricId?: string;
  dynamicFields: DynamicField[];
  createdAt: string;
}

export const ConvocatoriasAdmin = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [rubrics, setRubrics] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFieldsModal, setShowFieldsModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeConvo, setActiveConvo] = useState<Convocatoria | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Search and Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  // Body scroll lock
  useEffect(() => {
    if (showCreateModal || showFieldsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showCreateModal, showFieldsModal]);

  const { token, user } = useAuth();
  
  // New Convocatoria State
  const [newConvo, setNewConvo] = useState({
    number: '', title: '', year: new Date().getFullYear(), directedTo: '', budgetPerProject: 0,
    description: '', startDate: '', endDate: '', isActive: true, rubricId: '', dynamicFields: [] as DynamicField[]
  });

  useEffect(() => {
    fetchConvocatorias();
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    try {
      const { data } = await api.get('/rubrics');
      setRubrics(data);
    } catch (e) {
      console.error('Error fetching rubrics:', e);
    }
  };

  const fetchConvocatorias = async () => {
    try {
      const res = await fetch(`${API_URL}/convocatorias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConvocatorias(data);
      }
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode && editId ? `${API_URL}/convocatorias/${editId}` : `${API_URL}/convocatorias`;
      const method = isEditMode ? 'PATCH' : 'POST';

      const payload = isEditMode ? {
        number: newConvo.number, title: newConvo.title, year: newConvo.year, directedTo: newConvo.directedTo, 
        budgetPerProject: newConvo.budgetPerProject, description: newConvo.description,
        startDate: newConvo.startDate, endDate: newConvo.endDate, rubricId: newConvo.rubricId || null
      } : {
        ...newConvo,
        rubricId: newConvo.rubricId || null,
        dynamicFields: [] 
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowCreateModal(false);
        setIsEditMode(false);
        setEditId(null);
        setNewConvo({ number: '', title: '', year: new Date().getFullYear(), directedTo: '', budgetPerProject: 0, description: '', startDate: '', endDate: '', isActive: true, rubricId: '', dynamicFields: [] });
        fetchConvocatorias();
      } else {
        alert(isEditMode ? 'Error al actualizar la convocatoria' : 'Error al crear la convocatoria');
      }
    } catch (error) {
       console.error(error);
    }
  };

  const handleEditClick = (convo: Convocatoria) => {
    setIsEditMode(true);
    setEditId(convo._id);
    
    // Format dates for inputs
    const formattedStart = convo.startDate ? new Date(convo.startDate).toISOString().split('T')[0] : '';
    const formattedEnd = convo.endDate ? new Date(convo.endDate).toISOString().split('T')[0] : '';

    setNewConvo({
      number: convo.number || '', title: convo.title, year: convo.year, directedTo: convo.directedTo,
      budgetPerProject: convo.budgetPerProject, description: convo.description,
      startDate: formattedStart, endDate: formattedEnd, isActive: convo.isActive,
      rubricId: convo.rubricId || '',
      dynamicFields: convo.dynamicFields
    });
    setShowCreateModal(true);
  };

  const deleteConvocatoria = async (id: string) => {
    if(!confirm('¿Seguro que desea eliminar esta convocatoria? Esta acción no se puede deshacer.')) return;
    
    try {
      const res = await fetch(`${API_URL}/convocatorias/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConvocatorias(convocatorias.filter(c => c._id !== id));
      } else {
        const err = await res.json();
        alert(err.message || 'Error al eliminar la convocatoria');
      }
    } catch (error) {
      console.error('Error al eliminar', error);
      alert('Error de conexión al intentar eliminar.');
    }
  };

  const handleOpenFieldsModal = (convo: Convocatoria) => {
    setActiveConvo(JSON.parse(JSON.stringify(convo))); 
    setShowFieldsModal(true);
    setShowPreview(false);
  };

  const handleSaveFields = async () => {
    if (!activeConvo) return;
    try {
      const res = await fetch(`${API_URL}/convocatorias/${activeConvo._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          dynamicFields: activeConvo.dynamicFields.map(f => 
            f.type === 'select' && f.options ? { ...f, options: f.options.map(s => s.trim()).filter(s => s !== '') } : f
          ) 
        })
      });
      
      if (res.ok) {
        setShowFieldsModal(false);
        fetchConvocatorias();
      } else {
        alert('Error al guardar los campos dinámicos');
      }
    } catch (error) {
       console.error(error);
    }
  };

  const addField = () => {
    if(activeConvo) {
      setActiveConvo({
        ...activeConvo,
        dynamicFields: [...activeConvo.dynamicFields, { 
          name: '', 
          label: '', 
          type: 'textarea', 
          required: true, 
          helpText: '', 
          placeholder: '' 
        }]
      });
    }
  }

  const removeField = (index: number) => {
    if(activeConvo) {
      const newFields = [...activeConvo.dynamicFields];
      newFields.splice(index, 1);
      setActiveConvo({ ...activeConvo, dynamicFields: newFields });
    }
  }

  const updateFieldTypeOrRequired = (index: number, key: keyof DynamicField, value: any) => {
    if(activeConvo) {
      const newFields = [...activeConvo.dynamicFields];
      newFields[index] = { ...newFields[index], [key]: value };
      setActiveConvo({ ...activeConvo, dynamicFields: newFields });
    }
  }

  const updateFieldLabelAndName = (index: number, val: string) => {
     if(activeConvo) {
       const newFields = [...activeConvo.dynamicFields];
       newFields[index].label = val;
       
       let generatedName = val.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/\s+/g, '_') 
        .replace(/[^a-z0-9_]/g, '') 
        .substring(0, 40);
        
       newFields[index].name = generatedName;
       setActiveConvo({ ...activeConvo, dynamicFields: newFields });
     }
  }

  const updateFieldOptions = (index: number, val: string) => {
    if(activeConvo) {
      const newFields = [...activeConvo.dynamicFields];
      newFields[index].options = val.split(',');
      setActiveConvo({ ...activeConvo, dynamicFields: newFields });
    }
  }

  const addTemplateField = (name: string, label: string, type: string, required: boolean, helpText = '', placeholder = '', defaultOptions?: string[]) => {
    if(activeConvo) {
      if(activeConvo.dynamicFields.find(f => f.name === name)) return;
      setActiveConvo({
        ...activeConvo,
        dynamicFields: [...activeConvo.dynamicFields, { 
          name, label, type, required, helpText, placeholder, options: defaultOptions 
        }]
      });
    }
  }

  if(!user || (user.role !== 'admin' && user.role !== 'division_investigacion')) {
    return <div className="text-center mt-10 p-6 card">Acceso denegado. No tienes permisos para ver esta sección.</div>;
  }

  const filteredConvos = [...convocatorias]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.number && c.number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const totalPages = Math.ceil(filteredConvos.length / itemsPerPage);
  const currentConvos = filteredConvos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginationButtons = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationButtons.push(
      <button 
        key={i} 
        onClick={() => { setCurrentPage(i); window.scrollTo({top: 0, behavior: 'smooth'}); }}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentPage === i ? 'bg-[#32965D] text-white shadow-md' : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'}`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="animate-fade-in pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestión de Convocatorias</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Administre las oportunidades de investigación y sus formularios de radicación.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código (N°) o título..." 
              className="form-input pl-10 h-11 shadow-sm border-gray-100"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="btn btn-primary h-11 px-6 shadow-lg shadow-primary-500/20" onClick={() => { setIsEditMode(false); setEditId(null); setNewConvo({ number: '', title: '', year: new Date().getFullYear(), directedTo: '', budgetPerProject: 0, description: '', startDate: '', endDate: '', isActive: true, rubricId: '', dynamicFields: [] }); setShowCreateModal(true); }}>
            <Plus size={18} className="mr-2" />
            Nueva Convocatoria
          </button>
        </div>
      </div>

      {showCreateModal && createPortal(
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="heading-3">{isEditMode ? 'Editar Convocatoria' : 'Crear Nueva Convocatoria'}</h3>
              <button className="btn-ghost p-1" onClick={() => setShowCreateModal(false)}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleCreateOrEdit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="form-group mb-0 md:col-span-8">
                  <label className="form-label">Título de la Convocatoria</label>
                  <input required type="text" className="form-input" value={newConvo.title} onChange={e => setNewConvo({...newConvo, title: e.target.value})} placeholder="Ej. Convocatoria Interna 2026"/>
                </div>
                <div className="form-group mb-0 md:col-span-4">
                  <label className="form-label">Número / Código</label>
                  <input required type="text" className="form-input" value={newConvo.number} onChange={e => setNewConvo({...newConvo, number: e.target.value})} placeholder="Ej. 001-2026"/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="form-group mb-0">
                  <label className="form-label">Año</label>
                  <input required type="number" className="form-input" value={newConvo.year} onChange={e => setNewConvo({...newConvo, year: Number(e.target.value)})}/>
                 </div>
                 <div className="form-group mb-0">
                  <label className="form-label">Presupuesto por Proyecto ($)</label>
                  <input required type="number" className="form-input" value={newConvo.budgetPerProject} onChange={e => setNewConvo({...newConvo, budgetPerProject: Number(e.target.value)})}/>
                 </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">A quién va dirigida</label>
                <input required type="text" className="form-input" value={newConvo.directedTo} onChange={e => setNewConvo({...newConvo, directedTo: e.target.value})} placeholder="Ej. Docentes de planta, Grupos de investigación..."/>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Descripción o Base Corta</label>
                <textarea required className="form-textarea" rows={3} value={newConvo.description} onChange={e => setNewConvo({...newConvo, description: e.target.value})}></textarea>
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-primary-700 font-bold">Rúbrica de Evaluación</label>
                <select className="form-select border-primary-100 bg-primary-50/10 focus:border-primary-400" value={newConvo.rubricId} onChange={e => setNewConvo({...newConvo, rubricId: e.target.value})}>
                  <option value="">-- Sin rúbrica asignada (Solo recolectar) --</option>
                  {rubrics.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
                <p className="text-[10px] text-secondary mt-1">Opcional. Seleccione la matriz con la que los evaluadores calificarán los proyectos en esta convocatoria.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="form-group mb-0">
                  <label className="form-label">Fecha de Apertura</label>
                  <input required type="date" className="form-input" value={newConvo.startDate} onChange={e => setNewConvo({...newConvo, startDate: e.target.value})}/>
                 </div>
                 <div className="form-group mb-0">
                  <label className="form-label">Fecha de Cierre</label>
                  <input required type="date" className="form-input" value={newConvo.endDate} onChange={e => setNewConvo({...newConvo, endDate: e.target.value})}/>
                 </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar y Continuar</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showFieldsModal && activeConvo && createPortal(
        <div className="modal-backdrop animate-fade-in" style={{ padding: '0', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card w-full max-w-6xl flex flex-col scale-in border-none rounded-none md:rounded-2xl shadow-2xl overflow-hidden" 
            style={{ height: '90vh', maxHeight: '90vh', width: '95%', margin: '0 auto', overflow: 'hidden', padding: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* CABECERA FIJA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 border-b border-border-color bg-white flex-shrink-0" style={{ minHeight: '80px', height: 'auto' }}>
              <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                <div>
                  <h3 className="text-base md:heading-3 font-bold text-primary-900 leading-tight">
                    {showPreview ? 'Vista Previa' : 'Constructor'}: <span className="text-primary-600">{activeConvo.title}</span>
                  </h3>
                  <p className="text-secondary text-[10px] md:text-sm mt-1">
                    {showPreview ? 'Así se verá el formulario.' : 'Diseñe los campos de radicación.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowPreview(!showPreview)} 
                  className={`btn ${showPreview ? 'btn-primary' : 'btn-outline'} transition-all`}
                >
                  {showPreview ? <Edit2 size={18} className="mr-2"/> : <Search size={18} className="mr-2"/>}
                  {showPreview ? 'Volver al Editor' : 'Vista Previa'}
                </button>
                <button className="btn-ghost p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors" onClick={() => setShowFieldsModal(false)}><X size={24}/></button>
              </div>
            </div>
            
            {/* AREA DE CONTENIDO CON SCROLL FORZADO */}
            <div className="flex-1 bg-gray-50/50" style={{ overflowY: 'auto', minHeight: 0, padding: '2rem' }}>
              <div className="max-w-4xl mx-auto">
                {!showPreview ? (
                  <div className="flex flex-col gap-4 mb-8">
                    <div className="bg-[#A6B07E]/10 p-6 rounded-2xl border border-[#A6B07E]/20 shadow-sm space-y-6">
                      {/* CATEGORIA BASICAS */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b border-[#A6B07E]/20 pb-2">
                           <span className="text-xs font-black text-[#32965D] uppercase tracking-widest">Campos Básicos</span>
                           <div className="h-px flex-1 bg-gradient-to-r from-[#32965D]/20 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          <button type="button" onClick={() => addTemplateField('resumen_ejecutivo', 'Resumen Ejecutivo', 'textarea', true, 'Resumir en máximo de 500 palabras...', 'Escriba aquí el resumen ejecutivo...')} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ Resumen</button>
                          <button type="button" onClick={() => addTemplateField('objetivos', 'Objetivos (General y Específicos)', 'textarea', true, 'Redactar con un verbo en infinitivo...', 'Escriba cada objetivo empezando por uno general...')} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ Objetivos</button>
                          <button type="button" onClick={() => addTemplateField('metodologia', 'Metodología Propuesta', 'textarea', true, 'La metodología define el camino a seguir...', 'Detalle la metodología...')} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ Metodología</button>
                          <button type="button" onClick={() => addTemplateField('tipo_proyecto', 'Tipo de proyecto', 'select', true, 'Seleccione el tipo de investigación.', '', ['Investigación Básica', 'Investigación Aplicada', 'Desarrollo Experimental', 'Innovación'])} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ Tipo Proyecto</button>
                        </div>
                      </div>
                      
                      {/* CATEGORIA CIENTIFICAS */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b border-[#A6B07E]/20 pb-2">
                           <span className="text-xs font-black text-[#32965D] uppercase tracking-widest">Campos Científicos</span>
                           <div className="h-px flex-1 bg-gradient-to-r from-[#32965D]/20 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          <button type="button" onClick={() => addTemplateField('planteamiento_problema', 'Planteamiento del Problema', 'textarea', true, 'Permite identificar la necesidad de realizar el estudio y debe ser formulado de manera clara y concreta.', 'Identifique el aporte del problema a la luz de políticas como Misión de Sabios, CONPES, etc.')} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ Planteamiento</button>
                          <button type="button" onClick={() => addTemplateField('magnitud_problema', 'Magnitud e Indicadores', 'textarea', true, 'Dimensión de la problemática. Registrar un indicador de línea base o referencia (cuantitativo).', 'Indique fuente de verificación oficial actualizada.')} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ Magnitud/Ind</button>
                           <button type="button" onClick={() => {
                            if(activeConvo && !activeConvo.dynamicFields.find(f => f.name === 'arbol_problemas')) {
                              setActiveConvo({
                                ...activeConvo,
                                dynamicFields: [...activeConvo.dynamicFields, { 
                                  name: 'arbol_problemas', 
                                  label: 'Árbol de Problemas', 
                                  type: 'table', 
                                  required: true, 
                                  helpText: 'Esquema que ilustra causas, problema central y consecuencias (efectos).', 
                                  placeholder: '',
                                  columns: ['Nivel / Componente', 'Descripción Detallada'],
                                  options: ['Fines', 'Efectos Directos', 'Problema Central', 'Causas Directas', 'Causas Indirectas']
                                }]
                              });
                            }
                          }} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#32965D]/40 border-dashed text-[#32965D] hover:bg-[#32965D]/5 font-bold transition-all shadow-sm w-full">+ Árbol Problemas (Tabla)</button>

                          <button type="button" onClick={() => {
                            if(activeConvo && !activeConvo.dynamicFields.find(f => f.name === 'arbol_objetivos')) {
                              setActiveConvo({
                                ...activeConvo,
                                dynamicFields: [...activeConvo.dynamicFields, { 
                                  name: 'arbol_objetivos', 
                                  label: 'Árbol de Objetivos', 
                                  type: 'table', 
                                  required: true, 
                                  helpText: 'Esquema que ilustra medios, fines y objetivo central. Sus objetivos específicos serán mapeados al cronograma.', 
                                  placeholder: '',
                                  columns: ['Nivel / Componente', 'Descripción Detallada'],
                                  options: ['Fines Indirectos', 'Fines Directos', 'Objetivo General', 'Objetivos Específicos', 'Medios Indirectos']
                                }]
                              });
                            }
                          }} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#32965D]/40 border-dashed text-[#32965D] hover:bg-[#32965D]/5 font-bold transition-all shadow-sm w-full">+ Árbol Objetivos (Tabla)</button>
                          <button type="button" onClick={() => {
                            if(activeConvo) {
                              const name = 'tabla_estructurada_' + Date.now();
                              setActiveConvo({
                                ...activeConvo,
                                dynamicFields: [...activeConvo.dynamicFields, { 
                                  name, 
                                  label: 'Nueva Tabla Estructurada', 
                                  type: 'table', 
                                  required: true, 
                                  helpText: 'Especifique la estructura de columnas y filas en la configuración del campo.', 
                                  placeholder: '',
                                  columns: ['Columna 1', 'Columna 2'],
                                  options: ['Fila 1']
                                }]
                              });
                            }
                          }} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#C97064]/40 border-dashed text-[#C97064] hover:bg-[#C97064]/5 font-bold transition-all shadow-sm w-full">+ Tabla Vacía</button>
                          <button type="button" onClick={() => addTemplateField('antecedentes', 'Antecedentes', 'textarea', true, 'Relacione información con el contexto regional y departamental.', 'Relacione con Misión de Sabios, Plan de Desarrollo, etc.')} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ Antecedentes</button>
                          <button type="button" onClick={() => addTemplateField('justificacion', 'Justificación', 'textarea', true, 'Descripción de la necesidad y viabilidad del proyecto.', 'Justifique la pertinencia para el territorio.')} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ Justificación</button>
                          <button type="button" onClick={() => addTemplateField('marco_conceptual', 'Marco Conceptual', 'textarea', true, 'Aspectos conceptuales y teóricos que enmarcan el problema.', 'Incluya Marco Normativo según aplique.')} className="btn btn-outline bg-white py-2 px-2 text-[10px] border-[#A6B07E]/40 hover:bg-[#A6B07E]/10 font-bold transition-all shadow-sm w-full">+ M. Conceptual</button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 mb-10">
                      {activeConvo.dynamicFields.map((field, idx) => (
                        <div key={idx} className="relative flex flex-col gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border-l-4 border-l-primary-500">
                            <div className="absolute -top-2 -left-2 bg-primary-600 text-white w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shadow-sm z-10">
                              {idx + 1}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                              <div className="md:col-span-5">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-1 block">Etiqueta / Pregunta</label>
                                  <input type="text" className="form-input py-1.5 text-sm font-medium border-gray-100 focus:border-primary-400" value={field.label} onChange={e => updateFieldLabelAndName(idx, e.target.value)} placeholder="Ej. Título del Proyecto"/>
                              </div>
                              <div className="md:col-span-3">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-1 block">Tipo de Dato</label>
                                  <select className="form-select py-1.5 text-sm bg-gray-50/50 border-gray-100" value={field.type} onChange={e => updateFieldTypeOrRequired(idx, 'type', e.target.value)}>
                                      <option value="textarea">Texto Largo</option>
                                      <option value="number">Número ($)</option>
                                      <option value="select">Desplegable</option>
                                      <option value="table">Estructura de Tabla</option>
                                      <option value="file">Archivo</option>
                                      <option value="date">Fecha</option>
                                  </select>
                              </div>
                              <div className="md:col-span-3 flex items-center gap-4 py-1">
                                  <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold uppercase text-gray-600 hover:text-primary-600 transition-colors">
                                    <input type="checkbox" checked={field.required} onChange={e => updateFieldTypeOrRequired(idx, 'required', e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-gray-300"/>
                                    Obligatorio
                                  </label>
                              </div>
                               <div className="md:col-span-1 flex justify-end">
                                  <button type="button" onClick={() => removeField(idx)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg transition-all" title="Eliminar Campo">
                                    <Trash2 size={16}/>
                                  </button>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                              <div className="form-group mb-0">
                                  <label className="text-[9px] font-bold text-success-700 uppercase mb-1 block">Instrucciones de Ayuda (Opcional)</label>
                                  <input type="text" className="form-input text-[11px] py-1 bg-success-50/10 border-success-50 focus:border-success-400 h-8" value={field.helpText} onChange={e => updateFieldTypeOrRequired(idx, 'helpText', e.target.value)} placeholder="Ej. Máximo 500 palabras..."/>
                              </div>
                              <div className="form-group mb-0">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Marca de Agua (Placeholder)</label>
                                  <input type="text" className="form-input text-[11px] py-1 bg-gray-50/30 border-gray-50 h-8" value={field.placeholder} onChange={e => updateFieldTypeOrRequired(idx, 'placeholder', e.target.value)} placeholder="Ej. Escriba aquí..."/>
                              </div>
                            </div>

                            {field.type === 'select' && (
                               <div className="p-3 bg-[#BCA371]/5 rounded-lg border border-[#BCA371]/20">
                                  <label className="text-[9px] font-bold text-[#BCA371] uppercase mb-1 block">Opciones del desplegable (separadas por coma)</label>
                                  <input type="text" className="form-input text-[11px] py-1 h-8" placeholder="Opcion 1, Opcion 2..." value={(field.options || []).join(',')} onChange={(e) => updateFieldOptions(idx, e.target.value)} />
                               </div>
                            )}

                            {field.type === 'table' && (
                               <div className="p-3 bg-primary-50/50 rounded-lg border border-primary-100 flex flex-col gap-3">
                                  <div>
                                    <label className="text-[9px] font-bold text-primary-700 uppercase mb-1 block">Columnas de la tabla (separadas por coma)</label>
                                    <input type="text" className="form-input text-[11px] py-1 h-8" placeholder="Columna 1, Columna 2..." value={(field.columns || []).join(',')} onChange={(e) => {
                                      if(activeConvo) {
                                        const next = [...activeConvo.dynamicFields];
                                        next[idx].columns = e.target.value.split(',');
                                        setActiveConvo({...activeConvo, dynamicFields: next});
                                      }
                                    }} />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-bold text-primary-700 uppercase mb-1 block">Filas predefinidas (Opciones, separadas por coma)</label>
                                    <input type="text" className="form-input text-[11px] py-1 h-8" placeholder="Fila 1, Fila 2..." value={(field.options || []).join(',')} onChange={(e) => updateFieldOptions(idx, e.target.value)} />
                                  </div>
                               </div>
                            )}
                        </div>
                      ))}
             
                      {activeConvo.dynamicFields.length === 0 && (
                        <div className="text-center py-20 text-secondary bg-white border border-dashed border-gray-300 rounded-3xl shadow-inner">
                          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <FileText size={40} className="text-gray-300" />
                          </div>
                          <p className="text-xl font-bold text-gray-700 mb-2">Formulario sin campos</p>
                          <p className="text-sm text-gray-500 max-w-sm mx-auto">Comienza agregando campos personalizados o utiliza nuestras plantillas rápidas para ahorrar tiempo.</p>
                        </div>
                      )}
                    </div>

                    <button type="button" onClick={addField} className="btn w-full bg-white border-2 border-dashed border-primary-200 text-primary-600 hover:bg-primary-50 py-4 rounded-xl transition-all font-bold text-sm group">
                      <Plus size={20} className="mr-2"/>
                      Crear un Nuevo Campo desde Cero
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 animate-fade-in mb-10">
                    <h4 className="heading-3 mb-6 text-center border-b pb-4">Formulario de Aplicación (Vista Previa)</h4>
                    <div className="space-y-8">
                       {activeConvo.dynamicFields.length === 0 && (
                         <div className="text-center py-10 opacity-50 italic">No hay campos configurados para mostrar.</div>
                       )}
                       {activeConvo.dynamicFields.map((field, idx) => (
                        <div key={idx} className="form-group border border-gray-50 p-6 rounded-2xl bg-gray-50/30">
                          <label className="block text-sm font-bold text-primary-900 uppercase mb-3">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {field.helpText && (
                            <div className="mb-4 p-3 bg-primary-50 border-l-4 border-primary-500 text-xs text-primary-900 leading-relaxed rounded-r italic">
                              <strong className="text-primary-700">AYUDA:</strong> {field.helpText}
                            </div>
                          )}
                          {field.type === 'textarea' ? (
                            <textarea disabled className="form-textarea bg-white" rows={4} placeholder={field.placeholder}></textarea>
                          ) : field.type === 'select' ? (
                            <select disabled className="form-select bg-white">
                              <option>{field.placeholder || '-- Seleccione una opción --'}</option>
                              {field.options?.map(o => <option key={o}>{o}</option>)}
                            </select>
                          ) : field.type === 'table' ? (
                            <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-100">
                                    {(field.columns || ['Concepto', 'Descripción']).map((col, cIdx) => (
                                      <th key={cIdx} className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-r border-gray-100 last:border-0">{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(field.options || ['Fila 1']).map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-gray-50 last:border-0">
                                      <td className="p-3 text-xs font-bold text-primary-800 bg-gray-50/20 border-r border-gray-50 w-1/3">{row}</td>
                                      {(field.columns && field.columns.length > 1) ? (
                                        [...Array(field.columns.length - 1)].map((_, i) => (
                                          <td key={i} className="p-3 border-r border-gray-50 last:border-0">
                                            <textarea disabled className="w-full text-xs p-2 border-0 bg-transparent focus:ring-0 resize-none h-12" placeholder="Escriba aquí..."></textarea>
                                          </td>
                                        ))
                                      ) : (
                                        <td className="p-3">
                                           <textarea disabled className="w-full text-xs p-2 border-0 bg-transparent focus:ring-0 resize-none h-12" placeholder="Escriba aquí..."></textarea>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <input disabled type={field.type} className="form-input bg-white" placeholder={field.placeholder}/>
                          )}
                        </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* PIE DE PAGINA FIJO */}
            <div className="flex justify-end gap-3 p-4 md:p-6 border-t border-border-color bg-white flex-shrink-0" style={{ minHeight: '80px', height: 'auto' }}>
              <button type="button" className="btn btn-outline px-4 md:px-6 text-xs" onClick={() => setShowFieldsModal(false)}>Descartar</button>
              <button type="button" className="btn btn-primary px-6 md:px-10 shadow-lg text-xs" onClick={handleSaveFields}>
                <CheckCircle size={18} className="mr-2"/>
                {showPreview ? 'Guardar Cambios' : 'Finalizar y Guardar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {!showCreateModal && !showFieldsModal && (
        <>
          {loading ? (
            <div className="text-center text-secondary py-10">Cargando...</div>
          ) : convocatorias.length === 0 ? (
            <div className="card text-center py-16">
              <div className="flex justify-center mb-4 text-primary-200">
                <FileText size={64} />
              </div>
              <h3 className="heading-3 mb-2">No hay convocatorias registradas</h3>
              <p className="text-secondary mb-6">Empieza creando la primera convocatoria para el cuerpo docente.</p>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Crear la primera convocatoria</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {currentConvos.map((convo) => (
                <div key={convo._id} className="card flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-6 hover:border-primary-300 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                       <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{convo.number}</span>
                       <h3 className="heading-3">{convo.title}</h3>
                       {convo.isActive ? (
                         <span className="badge badge-success shadow-sm shadow-success/10"><CheckCircle size={12} className="mr-1"/> Activa</span>
                       ) : (
                         <span className="badge badge-warning">Cerrada</span>
                       )}
                    </div>
                    <p className="text-secondary line-clamp-2 mb-4 text-sm">{convo.description}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <Calendar size={14} className="text-primary-500" />
                        <span className="font-medium">Año: {convo.year}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <Users size={14} className="text-primary-500" />
                        <span className="font-medium">Dirigida a: {convo.directedTo}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <DollarSign size={14} className="text-primary-500" />
                        <span className="font-medium">Financiamiento: ${convo.budgetPerProject.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full ml-auto border border-primary-100">
                        <Settings size={14} />
                        <span>{convo.dynamicFields.length} campos</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-l border-border-color pl-6 h-full min-w-max">
                     <button className="btn btn-outline text-primary-600 bg-primary-50 border-primary-200 hover:bg-primary-100 transition-colors" title="Ver Proyectos Radicados" onClick={() => navigate(`/admin/convocatorias/${convo._id}/proyectos`)}>
                       <FolderOpen size={18} className="mr-2" /> Postulaciones
                     </button>
                     <button className="btn btn-primary hover:bg-primary-700 shadow-md transition-shadow" onClick={() => handleOpenFieldsModal(convo)} title="Configurar Formulario (Campos Dinámicos)">
                       <Settings size={18} className="mr-2" /> Constructor
                     </button>
                     <button className="btn btn-outline" title="Editar datos base" onClick={() => handleEditClick(convo)}>
                       <Edit2 size={18} />
                     </button>
                     <button className="btn btn-outline text-error border-red-100 hover:bg-red-50" onClick={() => deleteConvocatoria(convo._id)} title="Eliminar">
                       <Trash2 size={18} />
                     </button>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-10 py-6 border-t border-gray-100">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                    className="btn btn-outline h-9 px-4 text-xs font-bold disabled:opacity-30 border-gray-200 transition-all hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center gap-2">
                    {paginationButtons}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                    className="btn btn-outline h-9 px-4 text-xs font-bold disabled:opacity-30 border-gray-200 transition-all hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
