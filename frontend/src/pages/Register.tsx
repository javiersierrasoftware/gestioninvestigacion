import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { UserPlus } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'docente',
    identificationNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el usuario');
      }

      login(data.user, data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] w-full px-4 animate-fade-in py-12">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 w-full relative overflow-hidden" style={{ maxWidth: '540px' }}>
        {/* Accent Decor */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-primary-600"></div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-50 rounded-2xl text-primary-600 shadow-inner">
              <UserPlus size={32} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Registro de Investigador</h2>
          <p className="text-slate-500 text-sm font-medium">Únase al ecosistema de investigación de la Univ. de Sucre</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-bold flex items-center gap-3 animate-shake">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" style={{ marginTop: '2rem' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="space-y-2.5" style={{ display: 'flex', flexDirection: 'column' }}>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1" htmlFor="name">Nombre Completo</label>
              <input 
                id="name"
                name="name"
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 text-sm font-medium" 
                style={{ padding: '1.15rem 1.5rem', marginTop: '0.625rem', border: '1px solid #e2e8f0' }}
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2.5" style={{ display: 'flex', flexDirection: 'column' }}>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1" htmlFor="identificationNumber">Identificación (C.C)</label>
              <input 
                id="identificationNumber"
                name="identificationNumber"
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 text-sm font-medium" 
                style={{ padding: '1.15rem 1.5rem', marginTop: '0.625rem', border: '1px solid #e2e8f0' }}
                placeholder="1.000.000.000"
                value={formData.identificationNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2.5" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1" htmlFor="email">Correo Institucional</label>
            <input 
              id="email"
              name="email"
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 text-sm font-medium" 
              style={{ padding: '1.15rem 1.5rem', marginTop: '0.625rem', border: '1px solid #e2e8f0' }}
              placeholder="docente@unisucre.edu.co"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2.5" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1" htmlFor="password">Contraseña de acceso</label>
            <input 
              id="password"
              name="password"
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 text-sm font-medium" 
              style={{ padding: '1.15rem 1.5rem', marginTop: '0.625rem', border: '1px solid #e2e8f0' }}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-[11px] text-emerald-800 leading-relaxed font-bold italic shadow-sm" style={{ backgroundColor: '#ecfdf5', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #d1fae5', marginBottom: '1.5rem', display: 'flex' }}>
            <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '4px', backgroundColor: '#34d399', borderRadius: '9999px', flexShrink: 0 }}></div>
              <p>Al registrarse, usted declara que los datos suministrados son verídicos y que su perfil quedará habilitado bajo el rol de Docente Investigador.</p>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1 mt-2 font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-70"
            style={{ 
              padding: '1.25rem', 
              backgroundColor: '#059669', 
              color: '#ffffff', 
              border: 'none', 
              cursor: 'pointer',
              display: 'block'
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="animate-spin" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%' }}></div>
                Procesando...
              </span>
            ) : 'Crear mi perfil en SIGAI'}
          </button>
        </form>

        <div className="text-center text-[12px] text-slate-400 border-t border-slate-100" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          ¿Ya tiene una cuenta activa? <br/>
          <Link to="/login" className="text-emerald-600 font-black hover:text-emerald-700 hover:underline uppercase tracking-tight text-[11px] mt-2 inline-block">Iniciar sesión ahora</Link>
        </div>
      </div>
    </div>
  );
};
