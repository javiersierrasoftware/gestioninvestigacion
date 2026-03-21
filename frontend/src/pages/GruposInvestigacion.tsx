import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Plus, Edit2, Trash2, Search, ExternalLink, X, Save, Loader2, Users } from 'lucide-react';

interface Group {
  _id: string;
  name: string;
  categoria: string;
  leaderName: string;
  facultad: string;
  grupLAC?: string;
}

export const GruposInvestigacion = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    categoria: 'C',
    leaderName: '',
    facultad: 'INGENIERIA',
    grupLAC: ''
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setGroups(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const method = isEdit ? 'PATCH' : 'POST';
    const url = isEdit ? `${API_URL}/groups/${currentId}` : `${API_URL}/groups`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        fetchGroups();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (g: Group) => {
    setFormData({
      name: g.name,
      categoria: g.categoria,
      leaderName: g.leaderName,
      facultad: g.facultad,
      grupLAC: g.grupLAC || ''
    });
    setCurrentId(g._id);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este grupo de investigación?')) return;
    try {
      const res = await fetch(`${API_URL}/groups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchGroups();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || (user.role !== 'admin' && user.role !== 'division_investigacion')) {
    return <div className="p-10 text-center">No tiene permisos.</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="heading-2">Grupos de Investigación</h2>
          <p className="text-secondary text-sm">Registro oficial de grupos categorizados por Minciencias.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => { 
            setIsEdit(false); 
            setFormData({ name: '', categoria: 'C', leaderName: '', facultad: 'INGENIERIA', grupLAC: '' }); 
            setShowModal(true); 
          }}
        >
          <Plus size={18} /> Nuevo Grupo
        </button>
      </div>

      <div className="card mb-6 flex items-center gap-3 py-3">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o líder..." 
          className="bg-transparent border-none outline-none w-full text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {loading ? (
             <div className="p-20 text-center text-gray-400">
                <Loader2 size={40} className="animate-spin mx-auto mb-4 opacity-20" />
                Cargando grupos de investigación...
             </div>
        ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b font-bold text-gray-600">
                <tr>
                  <th className="p-4">Grupo de Investigación</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Líder</th>
                  <th className="p-4">Facultad</th>
                  <th className="p-4">GrupLAC</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredGroups.map(g => (
                  <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{g.name}</td>
                    <td className="p-4">
                       <span className="badge bg-primary-50 text-primary-700 border border-primary-100">{g.categoria}</span>
                    </td>
                    <td className="p-4 text-gray-600">{g.leaderName}</td>
                    <td className="p-4 text-gray-500 text-xs">{g.facultad}</td>
                    <td className="p-4">
                      {g.grupLAC ? (
                        <a href={g.grupLAC} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          Link <ExternalLink size={12}/>
                        </a>
                      ) : <span className="text-gray-300 italic">No asignado</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 text-primary-600 hover:bg-primary-50 rounded-md border border-primary-100 transition-colors font-medium text-xs" onClick={() => handleEdit(g)}>
                          <Edit2 size={14}/> Editar
                        </button>
                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md border border-red-50 transition-colors" title="Eliminar" onClick={() => handleDelete(g._id)}>
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredGroups.length === 0 && (
                   <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">No se encontraron grupos.</td></tr>
                )}
              </tbody>
            </table>
        )}
      </div>

      {showModal && createPortal(
        <div className="modal-backdrop animate-fade-in">
          <div className="card w-full bg-white shadow-lg overflow-hidden border-none scale-in" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 p-6 border-b bg-gray-50/50">
              <div>
                <h3 className="heading-3">{isEdit ? 'Editar Grupo' : 'Registrar Nuevo Grupo'}</h3>
                <p className="text-xs text-secondary mt-1">Complete la información oficial del grupo.</p>
              </div>
              <button 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center"
                onClick={() => setShowModal(false)}
              >
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 pt-2 space-y-4">
              <div className="form-group mb-4">
                <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Nombre del Grupo</label>
                <input 
                  required 
                  className="form-input" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ej. Grupo de Inteligencia Artificial"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div className="form-group mb-0">
                    <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Categoría Minciencias</label>
                    <select 
                      className="form-select" 
                      value={formData.categoria} 
                      onChange={e => setFormData({...formData, categoria: e.target.value})}
                    >
                       <option value="A1">A1 (Máxima)</option>
                       <option value="A">A</option>
                       <option value="B">B</option>
                       <option value="C">C</option>
                       <option value="Reconocido">Reconocido</option>
                       <option value="No Categorizado">No Categorizado</option>
                    </select>
                 </div>
                 <div className="form-group mb-0">
                    <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Facultad Aval</label>
                    <select 
                      className="form-select" 
                      value={formData.facultad} 
                      onChange={e => setFormData({...formData, facultad: e.target.value})}
                    >
                       <option>INGENIERIA</option>
                       <option>EDUCACIÓN Y CIENCIAS</option>
                       <option>CIENCIAS DE LA SALUD</option>
                       <option>CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS</option>
                       <option>CIENCIAS AGROPECUARIAS</option>
                    </select>
                 </div>
              </div>

              <div className="form-group mb-4">
                <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Docente Líder del Grupo</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    required 
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.leaderName} 
                    onChange={e => setFormData({...formData, leaderName: e.target.value})} 
                    placeholder="Nombre completo"
                  />
                  <Users size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Enlace GrupLAC</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.grupLAC} 
                    onChange={e => setFormData({...formData, grupLAC: e.target.value})} 
                    placeholder="https://..."
                  />
                  <ExternalLink size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
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
                  className="btn btn-primary" 
                   style={{ minWidth: '160px' }}
                  disabled={isSaving}
                 >
                    {isSaving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save size={18}/> 
                            {isEdit ? 'Actualizar' : 'Guardar'}
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
