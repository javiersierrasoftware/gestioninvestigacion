import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { BookOpen, User, Home, Book, LogOut, LayoutDashboard, Settings, FileText, Users, Search, Calendar, FileSignature } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './api/axios';

const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const ConvocatoriasAdmin = React.lazy(() => import('./pages/ConvocatoriasAdmin').then(m => ({ default: m.ConvocatoriasAdmin })));
const PostulacionesConvocatoria = React.lazy(() => import('./pages/PostulacionesConvocatoria').then(m => ({ default: m.PostulacionesConvocatoria })));
const RubricasAdmin = React.lazy(() => import('./pages/RubricasAdmin').then(m => ({ default: m.RubricasAdmin })));
const MisEvaluaciones = React.lazy(() => import('./pages/MisEvaluaciones').then(m => ({ default: m.MisEvaluaciones })));
const ProduccionDocente = React.lazy(() => import('./pages/ProduccionDocente').then(m => ({ default: m.ProduccionDocente })));
const PanelCiarp = React.lazy(() => import('./pages/PanelCiarp').then(m => ({ default: m.PanelCiarp })));
const RadicacionDocente = React.lazy(() => import('./pages/RadicacionDocente').then(m => ({ default: m.RadicacionDocente })));
const GruposInvestigacion = React.lazy(() => import('./pages/GruposInvestigacion').then(m => ({ default: m.GruposInvestigacion })));
const InvestigadoresAdmin = React.lazy(() => import('./pages/InvestigadoresAdmin').then(m => ({ default: m.InvestigadoresAdmin })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to home if they don't have the right role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      {/* --- MENU PRINCIPAL (GENERAL) --- */}
      <nav className="bg-white border-b border-gray-200 z-50 sticky top-0 shadow-sm">
        <div className="container flex items-center justify-between" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
          <Link to="/" className="flex items-center gap-2 group transition-all">
            <div className="bg-primary-50 p-1 rounded-lg group-hover:bg-primary-100 transition-colors">
              <BookOpen color="var(--primary-600)" size={20} />
            </div>
            <span className="heading-3 text-primary-900 group-hover:text-primary-700 tracking-tight flex items-center">
              SIGAI
              <span className="mobile:hidden ml-2 text-sm font-semibold text-secondary opacity-60 border-l border-gray-300 pl-2"> Académica e Investigativa</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden lg:flex items-center mr-4 border-r border-gray-200 pr-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm shadow-sm mr-2 border border-emerald-200">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">{user?.role}</span>
                    <span className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</span>
                  </div>
                </div>

                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium">
                  <User size={18} className="text-gray-500" />
                  <span className="mobile:hidden">Mi Perfil</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors font-medium border border-transparent hover:border-rose-200">
                  <LogOut size={18} />
                  <span className="mobile:hidden">Salir</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn btn-ghost font-medium">Ingresar</Link>
                <Link to="/register" className="btn btn-primary shadow-sm bg-primary-600 hover:bg-primary-700 font-medium">Registrarse</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- SUBMENU SECUNDARIO (ROLES) --- */}
      {isAuthenticated && (
        <div className="bg-emerald-50/40 border-b border-emerald-100 shadow-sm z-40 sticky top-[82px] backdrop-blur-md">
          <div className="container overflow-x-auto py-3.5">
            <div className="flex items-center gap-1 min-w-max">
              <Link to="/dashboard" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                <LayoutDashboard size={18} className="text-emerald-600" />
                <span>Dashboard</span>
              </Link>

              <div className="h-6 w-[1px] bg-emerald-200 mx-2"></div>

              {user?.role === 'docente' && (
                <Link to="/radicacion" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                  <FileText size={18} className="text-emerald-600" />
                  <span>Radicar Proyecto</span>
                </Link>
              )}

              {(user?.role === 'docente' || user?.role === 'evaluador') && (
                <Link to="/docente/evaluaciones" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                  <FileSignature size={18} className="text-emerald-600" />
                  <span>Rol Evaluador Proyectos</span>
                </Link>
              )}

              {user?.role === 'docente' && (
                <Link to="/docente/produccion" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                  <BookOpen size={18} className="text-emerald-600" />
                  <span>Producción Docente</span>
                </Link>
              )}

              {(user?.role === 'admin' || user?.role === 'division_investigacion') && (
                <>
                  <Link to="/admin/convocatorias" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                    <Settings size={18} className="text-emerald-600" />
                    <span>Convocatorias</span>
                  </Link>
                  <Link to="/admin/rubricas" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                    <FileSignature size={18} className="text-emerald-600" />
                    <span>Rúbricas</span>
                  </Link>
                  <Link to="/admin/grupos" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                    <Users size={18} className="text-emerald-600" />
                    <span>Grupos</span>
                  </Link>
                  <Link to="/admin/investigadores" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                    <User size={18} className="text-emerald-600" />
                    <span>Investigadores</span>
                  </Link>
                </>
              )}

              {user?.role === 'ciarp' && (
                <Link to="/ciarp-panel" className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors font-bold text-sm">
                  <LayoutDashboard size={18} className="text-emerald-600" />
                  <span>Bandeja CIARP</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      <main className="container pt-4 pb-16" style={{ flex: 1 }}>{children}</main>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen color="var(--primary-600)" size={24} />
                <span className="font-bold text-lg text-primary-900 tracking-tight">SIGAI</span>
              </div>
              <p className="text-sm text-secondary max-w-sm leading-relaxed">
                SIGAI — Sistema Integral de Gestión Académica e Investigativa. Plataforma integral para el fomento, seguimiento y evaluación de la producción investigativa y académica de excelencia.
              </p>
            </div>

            <div className="footer-section">
              <h4>Institución</h4>
              <Link to="/" className="footer-link">Universidad de Sucre</Link>
              <Link to="/admin/grupos" className="footer-link">Vicerrectoría Académica</Link>
              <Link to="/admin/convocatorias" className="footer-link">División de Investigación</Link>
            </div>

            <div className="footer-section">
              <h4>Soporte</h4>
              <a href="#" className="footer-link">Grupo MANGLAR</a>
              <a href="#" className="footer-link">Guías de Usuario</a>
              <a href="#" className="footer-link">Contacto Técnico</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="text-xs text-muted font-medium">
              © {new Date().getFullYear()} Universidad de Sucre | Todos los derechos reservados
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold text-primary-600/60 uppercase tracking-widest">
                División de Computo y Sistemas
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPublicConvos = async () => {
      try {
        const res = await api.get('/convocatorias');
        setConvocatorias(res.data.filter((c: any) => c.isActive));
      } catch (error) {
        console.error('Error fetching public convos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicConvos();
  }, []);

  const filteredConvos = [...convocatorias]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.number && c.number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const totalPages = Math.ceil(filteredConvos.length / itemsPerPage);
  const currentConvos = filteredConvos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col items-center gap-16 md:gap-24 mt-6 animate-fade-in relative overflow-hidden pb-20">
      {/* Decorative Background Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50 z-0"></div>
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-50 z-0"></div>

      <div className="text-center w-full relative z-10" style={{ maxWidth: '48rem' }}>
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-bold uppercase tracking-widest border border-primary-100 mb-6 animate-slide-up">
          Plataforma de Investigación — Univ. de Sucre
        </div>
        <h1 className="heading-1 mb-6 text-slate-800 tracking-tight leading-tight">
          Gestión de la Producción Académica e Investigativa
        </h1>
        <p className="text-secondary mb-10 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Un ecosistema digital integrado para la administración de proyectos, grupos de investigación y escalafón docente bajo el Decreto 1279.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 transition-all">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary px-10 py-3.5 shadow-xl shadow-primary-200 hover:shadow-2xl hover:-translate-y-1">
              Mi Panel de Control
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary px-10 py-3.5 shadow-xl shadow-primary-200 hover:shadow-2xl hover:-translate-y-1">
              Registrarse ahora
            </Link>
          )}
          <a href="#convocatorias" className="btn bg-white border border-slate-200 text-slate-600 px-8 py-3.5 shadow-sm hover:bg-slate-50 transition-all">
            Explorar Convocatorias
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full relative z-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all group">
          <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <Book size={28} className="text-emerald-600 group-hover:text-white" />
          </div>
          <h3 className="text-lg font-extrabold mb-3 text-slate-800">Proyectos de Investigación</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Radicación, evaluación por pares y seguimiento técnico-financiero de proyectos I+D+i.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-primary-200 hover:shadow-xl transition-all group">
          <div className="bg-primary-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <User size={28} className="text-primary-600 group-hover:text-white" />
          </div>
          <h3 className="text-lg font-extrabold mb-3 text-slate-800">Carrera Docente</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Gestión de puntos salariales, bonificaciones y validación de productividad ante el Comité CIARP.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all group">
          <div className="bg-indigo-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <Home size={28} className="text-indigo-600 group-hover:text-white" />
          </div>
          <h3 className="text-lg font-extrabold mb-3 text-slate-800">Grupos y Semilleros</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Categorización de grupos de investigación y vinculación de jóvenes investigadores y semilleros.</p>
        </div>
      </div>

      <div id="convocatorias" className="w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex flex-col md:flex-row justify-between md:items-center items-stretch mb-8 gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="heading-3 text-primary-900 mb-1">Convocatorias Abiertas</h2>
            <p className="text-sm text-secondary">Consulta las oportunidades vigentes para radicar proyectos.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por código o título..."
              className="form-input pl-10 h-10 text-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-secondary">Cargando convocatorias...</div>
        ) : filteredConvos.length === 0 ? (
          <div className="text-center py-10 text-secondary bg-gray-50 rounded-2xl italic">
            No se encontraron convocatorias activas que coincidan con la búsqueda.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentConvos.map((convo) => (
                <div key={convo._id} className="group flex flex-col p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-primary-200 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">#{convo.number}</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-success-600 uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                      Disponible
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors uppercase text-sm tracking-tight">{convo.title}</h4>
                  <p className="text-xs text-secondary line-clamp-3 mb-4 leading-relaxed flex-1">
                    {convo.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-gray-500 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-primary-400" />
                      Cierra: {new Date(convo.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-primary-400" />
                      {convo.directedTo}
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <Link to="/login" className="mt-4 pt-3 border-t border-dashed border-gray-200 text-center text-primary-600 font-bold text-xs hover:text-primary-700">
                      Ingresar para Postularse →
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 py-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="btn btn-outline btn-sm px-4 disabled:opacity-50"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-primary-600 text-white shadow-md' : 'btn-ghost hover:bg-gray-100 text-gray-600'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="btn btn-outline btn-sm px-4 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <Suspense fallback={<div className="flex items-center justify-center w-full h-full p-20 text-primary-600 font-medium">Cargando pantallas de SIGAI...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/admin/convocatorias" element={
              <ProtectedRoute allowedRoles={['admin', 'division_investigacion']}>
                <ConvocatoriasAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/convocatorias/:id/proyectos" element={
              <ProtectedRoute allowedRoles={['admin', 'division_investigacion']}>
                <PostulacionesConvocatoria />
              </ProtectedRoute>
            } />
            <Route path="/admin/rubricas" element={
              <ProtectedRoute allowedRoles={['admin', 'division_investigacion']}>
                <RubricasAdmin />
              </ProtectedRoute>
            } />

            <Route path="/admin/grupos" element={
              <ProtectedRoute allowedRoles={['admin', 'division_investigacion']}>
                <GruposInvestigacion />
              </ProtectedRoute>
            } />

            <Route path="/admin/investigadores" element={
              <ProtectedRoute allowedRoles={['admin', 'division_investigacion']}>
                <InvestigadoresAdmin />
              </ProtectedRoute>
            } />

            <Route path="/radicacion" element={
              <ProtectedRoute allowedRoles={['docente', 'admin']}>
                <RadicacionDocente />
              </ProtectedRoute>
            } />

            <Route path="/docente/produccion" element={
              <ProtectedRoute allowedRoles={['docente']}>
                <ProduccionDocente />
              </ProtectedRoute>
            } />

            <Route path="/docente/evaluaciones" element={
              <ProtectedRoute allowedRoles={['docente', 'evaluador']}>
                <MisEvaluaciones />
              </ProtectedRoute>
            } />

            <Route path="/ciarp-panel" element={
              <ProtectedRoute allowedRoles={['ciarp', 'admin']}>
                <PanelCiarp />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </Layout>
    </AuthProvider>
  );
};

export default App;
