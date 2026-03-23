import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Search, Loader2, GraduationCap, MapPin, Download, Settings2, Trash2, Edit2, X, Save, User, BookOpen } from 'lucide-react';

interface Group {
  _id: string;
  name: string;
}

interface Researcher {
  _id: string;
  name: string;
  email: string;
  role: string;
  facultad?: string;
  programa?: string;
  mincienciasCategory?: string;
  grupos: Group[];
}

export const InvestigadoresAdmin = () => {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentResearcher, setCurrentResearcher] = useState<Researcher | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    facultad: '',
    programa: '',
    mincienciasCategory: ''
  });
  const { token, user } = useAuth();

  useEffect(() => {
    fetchResearchers();
  }, []);

  const fetchResearchers = async () => {
    try {
      const res = await fetch(`${API_URL}/users?role=docente`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setResearchers(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r: Researcher) => {
    setCurrentResearcher(r);
    setEditForm({
      name: r.name || '',
      facultad: r.facultad || '',
      programa: r.programa || '',
      mincienciasCategory: r.mincienciasCategory || ''
    });
    setShowModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResearcher) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/${currentResearcher._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setShowModal(false);
        fetchResearchers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este investigador? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchResearchers();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredResearchers = researchers.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.facultad && r.facultad.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user || (user.role !== 'admin' && user.role !== 'division_investigacion')) {
    return <div className="p-10 text-center text-rose-600 font-bold bg-rose-50 rounded-xl m-10 border border-rose-100 italic">Acceso restringido. Solo personal administrativo.</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="heading-2 flex items-center gap-3">
             <div className="bg-primary-100 p-2 rounded-xl text-primary-600">
               <GraduationCap size={28} />
             </div>
             Investigadores Registrados
          </h2>
          <p className="text-secondary text-sm mt-1">Censo oficial de docentes e investigadores de la Universidad de Sucre.</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Investigadores</span>
          <span className="text-2xl font-black text-primary-600 leading-none">{researchers.length}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            placeholder="Buscar por nombre, correo, facultad o programa..." 
            className="w-full font-medium text-slate-700 outline-none placeholder:text-slate-400"
            style={{ 
              background: 'transparent',
              border: 'none', 
              outline: 'none', 
              fontSize: '9.5px',
              height: '100%'
            }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-2">
          <button 
            className="shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tight"
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
            title="Gestionar Columnas"
          >
            <Settings2 size={13} />
            <span>Columnas</span>
          </button>

          <button 
            className="shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tight transition-colors"
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
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.color = '#047857'; e.currentTarget.style.borderColor = '#dcfce7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            title="Exportar"
          >
            <Download size={13} className="text-emerald-600" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {loading ? (
             <div className="p-32 text-center text-gray-400 bg-gray-50/50">
                <Loader2 size={48} className="animate-spin mx-auto mb-4 text-primary-200" />
                <p className="font-bold text-gray-400">Consultando base de datos de investigadores...</p>
             </div>
        ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="p-4 pl-8 font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '9.5px' }}>Docente Investigador</th>
                    <th className="p-4 font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '9.5px' }}>Categoría Minciencias</th>
                    <th className="p-4 font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '9.5px' }}>Facultad y Programa</th>
                    <th className="p-4 font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '9.5px' }}>Grupo de Investigación</th>
                    <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '9.5px' }}>Estado</th>
                    <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '9.5px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredResearchers.map(r => (
                    <tr 
                      key={r._id} 
                      className="transition-all duration-200 text-slate-700"
                      style={{ fontSize: '9.5px', cursor: 'default' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(236, 253, 245, 0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="p-4 pl-8" style={{ borderBottom: '1px solid #dcfce7' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 uppercase tracking-tight">{r.name}</div>
                            <div className="text-[10px] text-slate-400 lowercase italic leading-none">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4" style={{ borderBottom: '1px solid #dcfce7' }}>
                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-black border tracking-wider
                           ${r.mincienciasCategory ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                           style={{ fontSize: '8px' }}>
                           {r.mincienciasCategory || 'NO CATEGORIZADO'}
                         </span>
                      </td>
                      <td className="p-4" style={{ borderBottom: '1px solid #dcfce7' }}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-tighter">
                            <MapPin size={10} className="text-slate-300" />
                            {r.facultad || 'Sin Facultad'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium pl-4">
                            {r.programa || 'Sin Programa'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4" style={{ borderBottom: '1px solid #dcfce7' }}>
                        <div className="flex flex-wrap gap-1">
                          {r.grupos && r.grupos.length > 0 ? (
                            r.grupos.map((g, idx) => (
                              <div key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-bold uppercase">
                                {g.name}
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-300 italic">Sin grupo</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center" style={{ borderBottom: '1px solid #dcfce7' }}>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold" style={{ fontSize: '9.5px' }}>
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                           ACTIVO
                        </span>
                      </td>
                      <td className="p-4 text-center" style={{ borderBottom: '1px solid #dcfce7' }}>
                        <div className="flex justify-center gap-2">
                          <button 
                            className="transition-all"
                            style={{ padding: '6px', color: '#059669', border: '1px solid #dcfce7', borderRadius: '6px', backgroundColor: '#ecfdf5' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; }}
                            onClick={() => handleEdit(r)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            className="transition-all"
                            style={{ padding: '6px', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '6px', backgroundColor: '#fef2f2' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                            onClick={() => handleDelete(r._id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredResearchers.length === 0 && (
                     <tr>
                       <td colSpan={6} className="p-16 text-center">
                          <Search size={32} className="mx-auto text-slate-100 mb-4" />
                          <p className="text-slate-400 font-medium italic" style={{ fontSize: '11px' }}>
                            No se encontraron investigadores para "{searchTerm}"
                          </p>
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}
      </div>
      
      {showModal && createPortal(
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 1000 }}>
          <div className="card w-full bg-white shadow-lg overflow-hidden border-none scale-in" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 p-6 border-b bg-gray-50/50">
              <div>
                <h3 className="heading-3">Editar Investigador</h3>
                <p className="text-xs text-secondary mt-1">Complete la información oficial del docente.</p>
              </div>
              <button 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center text-slate-400"
                onClick={() => setShowModal(false)}
              >
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 pt-2 space-y-4">
              <div className="form-group mb-4">
                <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Nombre Completo</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    required 
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
                  <User size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div className="form-group mb-0">
                    <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Facultad Aval</label>
                    <select 
                      className="form-select"
                      value={editForm.facultad} 
                      onChange={e => setEditForm({...editForm, facultad: e.target.value})}
                    >
                       <option value="">Seleccione Facultad</option>
                       <option>INGENIERIA</option>
                       <option>EDUCACIÓN Y CIENCIAS</option>
                       <option>CIENCIAS DE LA SALUD</option>
                       <option>CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS</option>
                       <option>CIENCIAS AGROPECUARIAS</option>
                    </select>
                 </div>
                 <div className="form-group mb-0">
                    <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Categoría Minciencias</label>
                    <select 
                      className="form-select"
                      value={editForm.mincienciasCategory} 
                      onChange={e => setEditForm({...editForm, mincienciasCategory: e.target.value})}
                    >
                       <option value="">No Categorizado</option>
                       <option>Investigador Emérito</option>
                       <option>Investigador Senior</option>
                       <option>Investigador Asociado</option>
                       <option>Investigador Junior</option>
                       <option>Integrante Vinculado</option>
                    </select>
                 </div>
              </div>

              <div className="form-group mb-6">
                <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Programa Académico</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={editForm.programa} 
                    onChange={e => setEditForm({...editForm, programa: e.target.value})} 
                    placeholder="Ej. Ingeniería de Sistemas"
                  />
                  <BookOpen size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ minWidth: '160px' }}
                >
                  {isSaving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Actualizando...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Actualizar
                        </>
                    )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
