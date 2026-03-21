import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileSignature, Plus, Edit2, Trash2, X, Save, MessageSquare } from 'lucide-react';
import api from '../api/axios';

interface Criterion {
  name: string;
  description: string;
  maxScore: number;
}

interface Rubric {
  _id: string;
  name: string;
  description: string;
  criteria: Criterion[];
}

export const RubricasAdmin = () => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRubric, setCurrentRubric] = useState<Partial<Rubric>>({
    name: '',
    description: '',
    criteria: []
  });

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    try {
      const { data } = await api.get('/rubrics');
      setRubrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setCurrentRubric({ name: '', description: '', criteria: [{ name: '', description: '', maxScore: 10 }] });
    setShowModal(true);
  };

  const handleOpenEdit = (r: Rubric) => {
    setIsEditMode(true);
    setCurrentRubric(JSON.parse(JSON.stringify(r)));
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta rúbrica? No podrá deshacerse.')) return;
    try {
      await api.delete(`/rubrics/${id}`);
      setRubrics(prev => prev.filter(r => r._id !== id));
    } catch (e) {
      console.error(e);
      alert('Error eliminando rúbrica');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && currentRubric._id) {
        await api.put(`/rubrics/${currentRubric._id}`, currentRubric);
      } else {
        await api.post('/rubrics', currentRubric);
      }
      setShowModal(false);
      fetchRubrics();
    } catch (e) {
      console.error(e);
      alert('Error guardando la rúbrica');
    }
  };

  const addCriterion = () => {
    setCurrentRubric(prev => ({
      ...prev,
      criteria: [...(prev.criteria || []), { name: '', description: '', maxScore: 10 }]
    }));
  };

  const updateCriterion = (index: number, key: string, value: any) => {
    const newCriteria = [...(currentRubric.criteria || [])];
    newCriteria[index] = { ...newCriteria[index], [key]: value };
    setCurrentRubric(prev => ({ ...prev, criteria: newCriteria }));
  };

  const removeCriterion = (index: number) => {
    const newCriteria = [...(currentRubric.criteria || [])];
    newCriteria.splice(index, 1);
    setCurrentRubric(prev => ({ ...prev, criteria: newCriteria }));
  };

  const totalScore = currentRubric.criteria?.reduce((sum, c) => sum + Number(c.maxScore), 0) || 0;

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="heading-2 text-primary-700 flex items-center gap-2">
            <FileSignature size={28} /> Rúbricas de Evaluación
          </h2>
          <p className="text-secondary mt-1 text-sm font-medium">Administre las matrices de calificación para las convocatorias.</p>
        </div>
        <button className="btn btn-primary h-11 px-6 shadow-lg shadow-primary-500/20" onClick={handleOpenCreate}>
          <Plus size={18} className="mr-2" /> Nueva Rúbrica
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-secondary">Cargando...</div>
      ) : rubrics.length === 0 ? (
        <div className="card text-center py-16">
          <FileSignature size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="heading-3 mb-2">Sin rúbricas registradas</h3>
          <p className="text-secondary mb-6">Crea plantillas de evaluación para estandarizar la calificación de los pares.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rubrics.map(rubric => (
             <div key={rubric._id} className="card flex flex-col justify-between hover:border-primary-300 transition-all group">
                <div>
                  <h3 className="heading-3 mb-1">{rubric.name}</h3>
                  <p className="text-sm text-secondary line-clamp-2 mb-4">{rubric.description}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-xs mb-4">
                    <div className="flex justify-between text-gray-500 font-bold mb-2 uppercase tracking-wide">
                      <span>{rubric.criteria.length} Criterios</span>
                      <span>Total: {rubric.criteria.reduce((s, c) => s + c.maxScore, 0)} pts</span>
                    </div>
                    <ul className="space-y-1">
                      {rubric.criteria.slice(0, 3).map((crit, idx) => (
                        <li key={idx} className="flex justify-between items-center text-gray-700">
                          <span className="truncate pr-2">• {crit.name}</span>
                          <span className="font-bold shrink-0">{crit.maxScore}p</span>
                        </li>
                      ))}
                      {rubric.criteria.length > 3 && <li className="text-primary-500 font-medium pt-1 italic">... y {rubric.criteria.length - 3} más</li>}
                    </ul>
                  </div>
                </div>

                <div className="flex border-t border-gray-100 pt-4 mt-2 justify-end gap-2">
                  <button className="btn btn-outline text-sm py-1.5 px-3 h-auto" onClick={() => handleOpenEdit(rubric)}>
                    <Edit2 size={14} className="mr-1.5" /> Editar
                  </button>
                  <button className="btn btn-outline text-error border-red-100 hover:bg-red-50 text-sm py-1.5 px-3 h-auto" onClick={() => handleDelete(rubric._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
             </div>
          ))}
        </div>
      )}

      {showModal && createPortal(
        <div className="modal-backdrop" style={{ 
          zIndex: 9999, 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '20px'
        }}>
          <div className="card w-full max-w-6xl flex flex-col scale-in bg-white shadow-2xl p-0" 
               style={{ height: '90vh', maxHeight: '90vh', width: '100%', overflow: 'hidden' }}
               onClick={e => e.stopPropagation()}>
             
             <div className="p-6 border-b flex justify-between items-center bg-gray-50 flex-shrink-0" style={{ height: '80px' }}>
               <div>
                 <h3 className="heading-3 text-primary-900 mb-0.5">{isEditMode ? 'Editar Rúbrica' : 'Crear Nueva Rúbrica'}</h3>
                 <p className="text-secondary text-xs">Administre los criterios y puntajes máximos.</p>
               </div>
               <button className="btn-ghost p-1" onClick={() => setShowModal(false)}><X size={24}/></button>
             </div>

             <div className="flex-1 bg-[#fcfcfc]" style={{ overflowY: 'auto', minHeight: 0 }}>
                <form id="rubric-form" onSubmit={handleSave} className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-6" style={{ paddingBottom: '100px' }}>
                   <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Información General</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group mb-0">
                        <label className="form-label text-xs font-bold text-gray-500 uppercase tracking-tight mb-1 block">Nombre de la Rúbrica</label>
                        <input required type="text" className="form-input" value={currentRubric.name} onChange={e => setCurrentRubric({...currentRubric, name: e.target.value})} placeholder="Ej. Evaluación de Proyectos"/>
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label text-xs font-bold text-gray-500 uppercase tracking-tight mb-1 block">Descripción (Opcional)</label>
                        <input type="text" className="form-input" value={currentRubric.description} onChange={e => setCurrentRubric({...currentRubric, description: e.target.value})} placeholder="¿Para qué se usa esta matriz?"/>
                      </div>
                    </div>
                   </section>

                   <div className="mt-4">
                     <div className="flex justify-between items-end mb-6 px-2 text-primary-900">
                       <div>
                         <h4 className="font-bold text-xl uppercase tracking-tight">Criterios de Calificación</h4>
                         <p className="text-sm opacity-70">Defina cada ítem de evaluación.</p>
                       </div>
                       <div className="bg-primary-50 px-5 py-3 rounded-2xl border border-primary-100 text-center shadow-sm">
                         <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">Puntaje Total</div>
                         <div className="text-2xl font-black text-primary-700 leading-none">{totalScore} <span className="text-sm font-bold text-primary-500">pts</span></div>
                       </div>
                     </div>

                     <div className="space-y-4">
                       {currentRubric.criteria?.map((crit, idx) => (
                         <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-primary-300 transition-all">
                           <div className="absolute -top-3 -left-3 bg-primary-600 text-white font-black w-8 h-8 flex items-center justify-center rounded-xl text-sm shadow-lg shadow-primary-500/20">{idx + 1}</div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                             <div className="md:col-span-4 form-group mb-0">
                               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Criterio</label>
                               <input required type="text" className="form-input text-sm bg-gray-50/50 focus:bg-white" value={crit.name} onChange={e => updateCriterion(idx, 'name', e.target.value)} placeholder="Ej. Originalidad"/>
                             </div>
                             
                             <div className="md:col-span-6 form-group mb-0">
                               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Instrucción</label>
                               <input type="text" className="form-input text-sm text-gray-600 bg-gray-50/50 focus:bg-white" value={crit.description} onChange={e => updateCriterion(idx, 'description', e.target.value)} placeholder="Guía para el par..."/>
                             </div>
                             
                             <div className="md:col-span-1 form-group mb-0 text-center">
                               <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1.5 block">Máx</label>
                               <input required type="number" min="1" className="form-input text-sm font-black text-center text-primary-700 bg-primary-50/20 border-primary-100" value={crit.maxScore} onChange={e => updateCriterion(idx, 'maxScore', Number(e.target.value))}/>
                             </div>
                             
                             <div className="md:col-span-1 flex items-end justify-end">
                               <button type="button" onClick={() => removeCriterion(idx)} className="btn-ghost text-red-300 hover:text-red-600 p-2 rounded-xl">
                                 <Trash2 size={20} />
                               </button>
                             </div>
                           </div>

                           <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex items-center gap-2.5 text-emerald-600 opacity-60">
                             <MessageSquare size={14} strokeWidth={2.5} />
                             <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Anotación del evaluador habilitada</span>
                           </div>
                         </div>
                       ))}

                       <button type="button" onClick={addCriterion} className="btn w-full bg-white border-2 border-dashed border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50/20 py-5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest">
                         <Plus size={20} className="mr-2" /> Agregar Nuevo Criterio
                       </button>
                     </div>
                   </div>
                </form>
             </div>

             <div className="p-6 border-t bg-white flex justify-end gap-3 flex-shrink-0" style={{ height: '100px' }}>
               <button type="button" className="btn btn-outline h-12 px-8" onClick={() => setShowModal(false)}>Descartar Cambios</button>
               <button type="submit" form="rubric-form" className="btn btn-primary h-12 px-10 shadow-xl shadow-primary-500/20 font-bold uppercase tracking-tight text-xs">
                 <Save size={18} className="mr-2" /> Guardar Rúbrica
               </button>
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
