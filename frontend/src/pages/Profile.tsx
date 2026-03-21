import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Book, GraduationCap, Award, FileText, Save, Loader2, ShieldCheck, UserCircle, Briefcase, X } from 'lucide-react';
import api from '../api/axios';

export const Profile = () => {
  const { user, token, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    identificationNumber: '',
    phone: '',
    facultad: 'INGENIERIA',
    programa: '',
    mincienciasCategory: 'No Categorizado',
    researchAreas: '',
    biography: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        identificationNumber: user.identificationNumber || '',
        phone: user.phone || '',
        facultad: user.facultad || 'INGENIERIA',
        programa: user.programa || '',
        mincienciasCategory: user.mincienciasCategory || 'No Categorizado',
        researchAreas: user.researchAreas || '',
        biography: user.biography || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updateData: any = { ...formData };
      delete updateData.confirmPassword;
      if (!updateData.password) delete updateData.password;

      const res = await api.patch(`/users/${user?.id}`, updateData);

      if (res.status === 200) {
        const updatedUser = res.data;
        login({ ...user!, ...updatedUser }, token || '');
        setSuccess(true);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-8">
        <div>
          <h2 className="heading-2 text-primary-900 flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-xl text-primary-600">
              <UserCircle size={32} />
            </div>
            Mi Perfil de Investigador
          </h2>
          <p className="text-secondary mt-1 ml-14">Gestione su información personal, académica y trayectoria investigativa.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="badge bg-primary-50 text-primary-700 border border-primary-100 px-4 py-1.5 uppercase font-bold text-[10px] tracking-widest">{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Personal Information Section */}
          <div className="card shadow-xl shadow-gray-200/50 overflow-hidden border-none group transition-all hover:shadow-2xl hover:shadow-primary-500/5">
            <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center gap-3">
               <User className="text-primary-600" size={20} />
               <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Información Personal Básica</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Nombre Completo <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                  <input name="name" type="text" className="form-input pl-10 bg-gray-50/50" value={formData.name} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Número Identificación <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                  <input name="identificationNumber" type="text" className="form-input pl-10 bg-gray-50/50" value={formData.identificationNumber} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Correo Electrónico <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                  <input name="email" type="email" className="form-input pl-10 bg-gray-50/50" value={formData.email} onChange={handleChange} required disabled />
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Teléfono Móvil</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                  <input name="phone" type="text" className="form-input pl-10 bg-gray-50/50" value={formData.phone} onChange={handleChange} placeholder="Ej. 310..." />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="card shadow-xl shadow-gray-200/50 overflow-hidden border-none transition-all hover:shadow-2xl hover:shadow-primary-500/5">
            <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center gap-3">
               <GraduationCap className="text-primary-600" size={20} />
               <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Información Académica e Institucional</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Facultad Aval</label>
                <select name="facultad" className="form-select bg-gray-50/50" value={formData.facultad} onChange={handleChange}>
                   <option>INGENIERIA</option>
                   <option>EDUCACIÓN Y CIENCIAS</option>
                   <option>CIENCIAS DE LA SALUD</option>
                   <option>CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS</option>
                   <option>CIENCIAS AGROPECUARIAS</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Programa Académico</label>
                <div className="relative">
                  <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                  <input name="programa" type="text" className="form-input pl-10 bg-gray-50/50" value={formData.programa} onChange={handleChange} placeholder="Ej. Ingeniería de Sistemas" />
                </div>
              </div>
            </div>
          </div>

          {/* Research Profile Section */}
          <div className="card shadow-xl shadow-gray-200/50 overflow-hidden border-none transition-all hover:shadow-2xl hover:shadow-primary-500/5">
            <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center gap-3">
               <Award className="text-primary-600" size={20} />
               <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Perfil de Investigador</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Categoría Actual MINCIENCIAS</label>
                <select name="mincienciasCategory" className="form-select bg-gray-50/50" value={formData.mincienciasCategory} onChange={handleChange}>
                   <option value="Investigador Emérito">Investigador Emérito</option>
                   <option value="Investigador Senior">Investigador Senior</option>
                   <option value="Investigador Asociado">Investigador Asociado</option>
                   <option value="Investigador Junior">Investigador Junior</option>
                   <option value="No Categorizado">No Categorizado</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Áreas de Investigación (Separadas por Coma)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-primary-400" size={16} />
                  <textarea name="researchAreas" className="form-textarea pl-10 bg-gray-50/50" rows={2} value={formData.researchAreas} onChange={handleChange} placeholder="Ej. Inteligencia Artificial, Redes de Computadores..."></textarea>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-[11px] font-bold text-gray-500">Resumen de Biografía Profesional</label>
                <textarea name="biography" className="form-textarea bg-gray-50/50" rows={4} value={formData.biography} onChange={handleChange} placeholder="Breve descripción de su trayectoria, estudios y logros principales..."></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar with Security & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            
            {/* Password Change Card */}
            <div className="card shadow-lg border-primary-100/50 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b flex items-center gap-2">
                 <Lock className="text-primary-600" size={18} />
                 <h4 className="font-bold text-gray-700 text-[11px] uppercase tracking-wider">Seguridad y Acceso</h4>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-[10px] text-secondary leading-normal mb-2 italic">Deje en blanco si no desea cambiar su contraseña actual.</p>
                <div className="form-group mb-0">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nueva Contraseña</label>
                  <input name="password" type="password" className="form-input text-sm h-9" value={formData.password} onChange={handleChange} autoComplete="new-password" />
                </div>
                <div className="form-group mb-0">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Confirmar Contraseña</label>
                  <input name="confirmPassword" type="password" className="form-input text-sm h-9" value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Actions & Status */}
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-2 animate-shake">
                  <X className="flex-shrink-0" size={16} /> {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-success-50 text-success-700 border border-success-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce-subtle">
                  <ShieldCheck className="flex-shrink-0" size={16} /> Perfil actualizado correctamente.
                </div>
              )}
              
              <button 
                className="btn btn-primary w-full py-4 shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 transition-all active:scale-95" 
                onClick={handleSubmit} 
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? 'Guardando Cambios...' : 'Guardar Toda la Información'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
