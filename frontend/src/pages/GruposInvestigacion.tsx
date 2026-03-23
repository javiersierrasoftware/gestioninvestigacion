import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
  Plus, Edit2, Trash2, Search, ExternalLink, X, Save, 
  Loader2, Users, Download, ArrowUpDown, ChevronUp, ChevronDown, 
  Settings2, EyeOff, LayoutPanelLeft 
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnOrderState,
  type VisibilityState
} from '@tanstack/react-table';

interface Group {
  _id: string;
  name: string;
  categoria: string;
  leaderName: string;
  leaderEmail: string;
  facultad: string;
  grupLAC?: string;
}

const columnHelper = createColumnHelper<Group>();

export const GruposInvestigacion = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
    'name', 'categoria', 'leaderName', 'leaderEmail', 'facultad', 'grupLAC', 'actions'
  ]);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    categoria: 'C',
    leaderName: '',
    leaderEmail: '',
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
      leaderEmail: g.leaderEmail || '',
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

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Grupo de Investigación',
      cell: info => <span className="font-bold text-slate-800 uppercase tracking-tight" style={{ fontSize: '9.5px' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('categoria', {
      header: 'Categoría',
      cell: info => (
        <span className="badge font-black px-2 py-0.5" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #dcfce7', fontSize: '8px' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('leaderName', {
      header: 'Líder de Investigación',
      cell: info => <span className="text-slate-600 font-medium" style={{ fontSize: '9.5px' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('leaderEmail', {
      header: 'Email del Líder',
      cell: info => <span className="text-slate-400 lowercase italic" style={{ fontSize: '9.5px' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('facultad', {
      header: 'Facultad',
      cell: info => <span className="text-slate-500 font-bold uppercase tracking-tighter" style={{ fontSize: '9.5px' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('grupLAC', {
      header: 'GrupLAC',
      cell: info => info.getValue() ? (
        <a href={info.getValue() as string} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-xs">
          Enlace <ExternalLink size={12}/>
        </a>
      ) : <span className="text-slate-300 italic text-xs">Sin asignar</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: info => (
        <div className="flex justify-start md:justify-end gap-2">
          <button 
            className="transition-all"
            style={{ padding: '6px', color: '#059669', border: '1px solid #dcfce7', borderRadius: '6px', backgroundColor: '#ecfdf5' }}
            title="Editar grupo"
            onClick={() => handleEdit(info.row.original)}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; }}
          >
            <Edit2 size={14} />
          </button>
          <button 
            className="transition-all"
            style={{ padding: '6px', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '6px', backgroundColor: '#fef2f2' }}
            title="Eliminar grupo"
            onClick={() => handleDelete(info.row.original._id)}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: groups,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
      columnFilters,
      columnVisibility,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setSearchTerm,
  });

  const exportToCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    const header = ['Nombre', 'Categoria', 'Lider', 'Email', 'Facultad', 'Enlace'];
    const data = rows.map(r => [
      r.original.name,
      r.original.categoria,
      r.original.leaderName,
      r.original.leaderEmail || '',
      r.original.facultad,
      r.original.grupLAC || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [header, ...data].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `grupos_investigacion_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            setFormData({ name: '', categoria: 'C', leaderName: '', leaderEmail: '', facultad: 'INGENIERIA', grupLAC: '' }); 
            setShowModal(true); 
          }}
        >
          <Plus size={18} /> Nuevo Grupo
        </button>
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
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Búsqueda inteligente por nombre, líder o facultad..." 
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
          <div className="relative">
            <button 
              className={`shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tight w-full md:w-auto`}
              style={{
                backgroundColor: showColumnSettings ? '#1e293b' : '#ffffff',
                color: showColumnSettings ? '#ffffff' : '#64748b',
                border: showColumnSettings ? '1px solid #1e293b' : '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0 16px',
                fontSize: '9.5px',
                height: '36px',
                minWidth: '120px'
              }}
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              title="Gestionar Columnas"
            >
              <Settings2 size={13} />
              <span>Columnas</span>
            </button>
            
            {showColumnSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-4 animate-fade-in scale-in origin-top-right">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                  <LayoutPanelLeft size={16} className="text-emerald-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Visibilidad</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {table.getAllLeafColumns().map(column => {
                    return (
                      <label key={column.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                        />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight group-hover:text-slate-900 flex-1">
                          {column.id === 'actions' ? 'Acciones' : 
                           column.id === 'name' ? 'Nombre' : 
                           column.id === 'categoria' ? 'Categoría' : 
                           column.id === 'leaderName' ? 'Líder' : 
                           column.id === 'leaderEmail' ? 'Email Líder' : 
                           column.id === 'facultad' ? 'Facultad' : column.id}
                        </span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const index = columnOrder.indexOf(column.id);
                              if (index > 0) {
                                const newOrder = [...columnOrder];
                                const temp = newOrder[index];
                                newOrder[index] = newOrder[index - 1];
                                newOrder[index - 1] = temp;
                                setColumnOrder(newOrder);
                              }
                            }}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button 
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const index = columnOrder.indexOf(column.id);
                              if (index < columnOrder.length - 1) {
                                const newOrder = [...columnOrder];
                                const temp = newOrder[index];
                                newOrder[index] = newOrder[index + 1];
                                newOrder[index + 1] = temp;
                                setColumnOrder(newOrder);
                              }
                            }}
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        {!column.getIsVisible() && <EyeOff size={14} className="ml-2 text-slate-300" />}
                      </label>
                    )
                  })}
                </div>
                <div className="mt-4 pt-2 border-t border-slate-50 text-[10px] text-slate-400 italic font-medium">
                  Clica para ocultar/mostrar columnas
                </div>
              </div>
            )}
          </div>

          <button 
            className="shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tight transition-colors w-full md:w-auto"
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
            onClick={exportToCSV}
            title="Exportar a CSV/Excel"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.color = '#047857'; e.currentTarget.style.borderColor = '#dcfce7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <Download size={13} className="text-emerald-600" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {loading ? (
             <div className="p-20 text-center text-gray-400">
                <Loader2 size={40} className="animate-spin mx-auto mb-4 opacity-20" />
                Cargando grupos de investigación...
             </div>
        ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <React.Fragment key={headerGroup.id}>
                      {/* Row 1: Titles and Sorting */}
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="px-4 py-4 pb-2 transition-all group">
                            {header.isPlaceholder ? null : (
                              <div 
                                className={`flex items-center gap-2 cursor-pointer select-none ${header.column.getCanSort() ? 'hover:text-emerald-700' : ''}`}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <span className="font-black text-slate-500 uppercase tracking-widest whitespace-nowrap" style={{ fontSize: '9.5px' }}>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </span>
                                {header.column.getCanSort() && (
                                  <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                    {{
                                      asc: <ChevronUp size={12} />,
                                      desc: <ChevronDown size={12} />,
                                    }[header.column.getIsSorted() as string] ?? <ArrowUpDown size={10} className="opacity-30" />}
                                  </div>
                                )}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                      {/* Row 2: Specific Filters */}
                      <tr className="bg-white/50 border-b border-slate-100/50" style={{ borderBottom: '1px solid #e2e8f0' }}>
                        {headerGroup.headers.map(header => (
                          <th key={`filter-${header.id}`} className="px-3.5 py-2.5 pb-4 transition-all">
                            {header.column.id !== 'actions' && (
                              <div className="relative group/filter">
                                <input 
                                  type="text"
                                  placeholder="Filtrar..."
                                  className="w-full font-medium text-slate-500 outline-none transition-all placeholder:text-slate-200"
                                  style={{ 
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '4px',
                                    padding: '4px 8px', 
                                    fontSize: '9.5px',
                                    height: '24px'
                                  }}
                                  value={(header.column.getFilterValue() ?? '') as string}
                                  onChange={e => header.column.setFilterValue(e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                  onFocus={e => e.target.style.borderColor = '#34d399'}
                                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </thead>
                <tbody className="bg-white">
                  {table.getRowModel().rows.map(row => (
                    <tr 
                      key={row.id} 
                      className="transition-all duration-200 text-slate-700"
                      style={{ fontSize: '9.5px', cursor: 'default' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(236, 253, 245, 0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-4 align-middle" style={{ borderBottom: '1px solid #dcfce7' }}>
                          <div className="font-medium">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {table.getRowModel().rows.length === 0 && (
                <div className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs">No se encontraron resultados</p>
                    <p className="text-[11px] font-medium mt-1">Intenta con otros términos de búsqueda</p>
                  </div>
                </div>
              )}
            </div>
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
                <label className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1 block">Email del Líder</label>
                <input 
                  type="email"
                  required 
                  className="form-input" 
                  value={formData.leaderEmail} 
                  onChange={e => setFormData({...formData, leaderEmail: e.target.value})} 
                  placeholder="ejemplo@unisucre.edu.co"
                />
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
