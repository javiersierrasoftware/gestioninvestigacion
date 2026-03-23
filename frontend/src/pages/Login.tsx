import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
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
    <div className="flex flex-col items-center justify-center w-full px-4 animate-fade-in pt-32 pb-48 mb-12 mt-10">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 w-full relative overflow-hidden" style={{ maxWidth: '480px' }}>
        {/* Accent Decor */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-primary-600"></div>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner">
              <LogIn size={32} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Bienvenido a SIGAI</h2>
          <p className="text-slate-500 text-sm font-medium">Sistema Integral de Gestión Académica e Investigativa</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-bold flex items-center gap-3 animate-shake">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" style={{ marginTop: '2rem' }}>
          <div className="space-y-2.5" style={{ marginBottom: '1.5rem' }}>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1" htmlFor="email">Correo Institucional</label>
            <input 
              id="email"
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 text-sm font-medium" 
              style={{ padding: '1.15rem 1.5rem', marginTop: '0.625rem', border: '1px solid #e2e8f0' }}
              placeholder="docente@unisucre.edu.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2.5" style={{ marginBottom: '1.5rem' }}>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1" htmlFor="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 text-sm font-medium" 
              style={{ padding: '1.15rem 1.5rem', marginTop: '0.625rem', border: '1px solid #e2e8f0' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between px-1" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <label className="flex items-center gap-2 cursor-pointer group" style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight ml-2">Recordarme</span>
            </label>
            <a href="#" className="text-[11px] font-black text-emerald-600 uppercase tracking-tight">¿Olvidó su contraseña?</a>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1 font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-70"
            style={{ 
              padding: '1.25rem', 
              backgroundColor: '#059669', 
              color: '#ffffff', 
              border: 'none', 
              cursor: 'pointer',
              marginTop: '1rem',
              display: 'block'
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="animate-spin" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%' }}></div>
                Validando...
              </span>
            ) : 'Ingresar al Portal'}
          </button>
        </form>

        <div className="text-center text-[12px] text-slate-400 border-t border-slate-100" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <p className="mb-2">¿Aún no tiene cuenta activa?</p>
          <Link to="/register" className="text-emerald-600 font-black hover:text-emerald-700 hover:underline uppercase tracking-tight text-[11px]">Crear nueva cuenta de Docente</Link>
        </div>
      </div>
    </div>
  );
};
