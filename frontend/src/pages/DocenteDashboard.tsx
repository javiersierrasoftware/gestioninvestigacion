import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend
} from 'recharts';
import {
  TrendingUp, BookOpen, Award, FileText, CheckCircle, Clock, Layers, Users,
  Wallet, Star, Activity, PieChart as PieIcon, BarChart3, Briefcase, GraduationCap
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

export const DocenteDashboard = () => {
  const [data, setData] = useState({
    projects: [] as any[],
    evaluations: [] as any[],
    products: [] as any[],
    ciarpRequests: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchDocenteData = async () => {
      try {
        const [resProj, resEval, resProd, resCiarp] = await Promise.all([
          fetch(`${API_URL}/projects/my-projects`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/projects/evaluations/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/products/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/ciarp/my-requests`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (resProj.ok && resEval.ok && resProd.ok) {
          setData({
            projects: await resProj.json(),
            evaluations: await resEval.json(),
            products: await resProd.json(),
            ciarpRequests: resCiarp.ok ? await resCiarp.json() : []
          });
        }
      } catch (e) {
        console.error('Error fetching docente dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocenteData();
  }, [token]);

  // --- DATA PROCESSING FOR CHARTS ---

  // 1. Projects by Status
  const projectsByStatus = useMemo(() => {
    const stats = data.projects.reduce((acc: any, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(stats).map(k => ({ name: k.replace('_', ' ').toUpperCase(), value: stats[k] }));
  }, [data.projects]);

  // 2. Evaluations Status
  const evaluationsStatus = useMemo(() => {
    const stats = data.evaluations.reduce((acc: any, p) => {
      const myEval = p.evaluations?.find((e: any) => e.evaluator === user?.id || e.evaluator?._id === user?.id);
      const status = myEval?.status || 'pendiente';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(stats).map(k => ({ name: k.toUpperCase(), value: stats[k] }));
  }, [data.evaluations, user?.id]);

  // 3. Products by Type
  const productsByType = useMemo(() => {
    const stats = data.products.reduce((acc: any, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(stats).map(k => ({ name: k, value: stats[k] }));
  }, [data.products]);

  // 4. Points Breakdown (Kardex)
  const pointsBreakdown = useMemo(() => {
    const approved = data.ciarpRequests.filter(r => r.status === 'Aprobado');
    const breakdown = approved.reduce((acc: any, r) => {
      const type = r.productId?.type || 'Otros';
      const points = Number(r.puntosSolicitados || 0);
      acc[type] = (acc[type] || 0) + points;
      return acc;
    }, {});
    return Object.keys(breakdown).map(k => ({ name: k, points: breakdown[k] }));
  }, [data.ciarpRequests]);

  // 5. Monthly Activity (Radar/Area) - Mocking months if needed, or grouping by createdAt
  const monthlyActivity = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    const stats = months.map(m => ({ month: m, Proyectos: 0, Productos: 0 }));

    data.projects.forEach(p => {
      const d = new Date(p.createdAt);
      if (d.getFullYear() === currentYear) stats[d.getMonth()].Proyectos++;
    });
    data.products.forEach(p => {
      const d = new Date(p.createdAt);
      if (d.getFullYear() === currentYear) stats[d.getMonth()].Productos++;
    });
    return stats;
  }, [data.projects, data.products]);

  // 6. CIARP Requests Status
  const ciarpStatus = useMemo(() => {
    const stats = data.ciarpRequests.reduce((acc: any, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(stats).map(k => ({ name: k, value: stats[k] }));
  }, [data.ciarpRequests]);

  // 7. Academic Category Progress (Radar)
  const profileProgress = useMemo(() => {
    return [
      { subject: 'Proyectos', A: data.projects.length, fullMark: 10 },
      { subject: 'Artículos', A: data.products.filter(p => p.type.includes('Artículo')).length, fullMark: 10 },
      { subject: 'Libros', A: data.products.filter(p => p.type.includes('Libro')).length, fullMark: 10 },
      { subject: 'Evaluaciones', A: data.evaluations.length, fullMark: 10 },
      { subject: 'Puntos/10', A: Math.min(10, (data.ciarpRequests.filter(r => r.status === 'Aprobado').reduce((s, r) => s + Number(r.puntosSolicitados), 0) / 100)), fullMark: 10 }
    ];
  }, [data]);

  // 8. Authorship Participation
  const authorshipRatio = useMemo(() => {
    const solo = data.products.filter(p => p.authors.length === 1).length;
    const group = data.products.filter(p => p.authors.length > 1).length;
    return [
      { name: 'Individual', value: solo },
      { name: 'En Coautoría', value: group }
    ];
  }, [data.products]);

  // 9. Day of Week Activity
  const dayOfWeekActivity = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const stats = days.map(d => ({ day: d, value: 0 }));
    data.products.forEach(p => {
      const d = new Date(p.createdAt).getDay();
      stats[d].value++;
    });
    return stats;
  }, [data.products]);

  // 10. Top Tipologías Summary
  const topCategories = useMemo(() => {
    const stats = data.products.reduce((acc: any, p) => {
      const cat = p.category || 'Varios';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(stats).map(k => ({ name: k.toUpperCase(), value: stats[k] }));
  }, [data.products]);

  const totalPoints = useMemo(() => {
    return data.ciarpRequests
      .filter(r => r.status === 'Aprobado')
      .reduce((sum, r) => sum + Number(r.puntosSolicitados || 0), 0);
  }, [data.ciarpRequests]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 text-primary-600">
        <Activity size={48} className="animate-spin mb-4 opacity-40" />
        <p className="font-bold text-gray-500">Generando su analítica investigativa...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="heading-2 text-primary-900 tracking-tight flex items-center gap-3">
            <TrendingUp size={32} className="text-primary-600" />
            Control de Investigador
          </h2>
          <p className="text-secondary text-sm mt-1">Visión consolidada de su producción intelectual, proyectos y puntos escalafón.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Facultad</span>
            <span className="text-xs font-bold text-gray-800">{user?.facultad || 'N/A'}</span>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-2 text-emerald-700">
            <Star size={14} className="fill-emerald-500" />
            <span className="text-xs font-bold">{user?.mincienciasCategory || 'Docente'}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Briefcase color="#3b82f6" />} label="Mis Proyectos" value={data.projects.length} detail="Como IP" theme="blue" />
        <StatCard icon={<CheckCircle color="#10b981" />} label="Mis Eval." value={data.evaluations.length} detail="Como Par Evaluador" theme="emerald" />
        <StatCard icon={<BookOpen color="#8b5cf6" />} label="Producción" value={data.products.length} detail="Total Registros" theme="purple" />
        <StatCard icon={<Wallet color="#f59e0b" />} label="Puntos Acum." value={totalPoints.toFixed(2)} detail="Aprobados CIARP" theme="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* CHART 1: Production by Type (Bar) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <BarChart3 size={18} className="text-primary-600" />
            Balance de Producción Intelectual
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsByType} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={60} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Project Status (Pie) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <PieIcon size={18} className="text-emerald-600" />
            Estado de Mis Proyectos Radicados
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectsByStatus} cx="50%" cy="45%" innerRadius={70} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  {projectsByStatus.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="rect" formatter={(value) => <span className="text-[10px] font-bold text-gray-500 uppercase">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Points Breakdown (Bar Horizontal) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100 lg:col-span-1" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <Wallet size={18} className="text-amber-600" />
            Distribución de Puntos por Tipología
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="points" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Profile Progress (Radar) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <GraduationCap size={18} className="text-blue-600" />
            Perfil de Desempeño Investigativo
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={profileProgress}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" fontSize={10} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} fontSize={8} tick={false} axisLine={false} />
                <Radar name={user?.name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: Monthly Production Activity (Line/Area) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100 lg:col-span-2" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <Activity size={18} className="text-emerald-600" />
            Actividad Mensual de Radicación ({new Date().getFullYear()})
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyActivity} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="Productos" stroke="#10b981" strokeWidth={4} fill="url(#colorProd)" fillOpacity={1} />
                <Area type="monotone" dataKey="Proyectos" stroke="#3b82f6" strokeWidth={4} fill="url(#colorProj)" fillOpacity={1} />
                <Legend verticalAlign="top" align="right" iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: Evaluator Efficiency (Pie) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <FileText size={18} className="text-indigo-600" />
            Estatus de Mis Evaluaciones
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={evaluationsStatus} cx="50%" cy="50%" outerRadius={100} dataKey="value" stroke="none">
                  {evaluationsStatus.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" formatter={(value) => <span className="text-[10px] font-bold text-gray-500 uppercase">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 7: CIARP Approval Status */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <Award size={18} className="text-amber-500" />
            Tasa de Aprobación CIARP
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ciarpStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} height={40} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 8: Authorship Ratio (Pie) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <Users size={18} className="text-rose-500" />
            Naturaleza de Colaboración
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={authorshipRatio} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                  <Cell fill="#f43f5e" />
                  <Cell fill="#fb7185" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" formatter={(value) => <span className="text-[10px] font-bold text-gray-500 uppercase">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 9: Day of Week Activity (Bar) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <Clock size={18} className="text-slate-500" />
            Frecuencia de Radicación por Día
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekActivity} margin={{ bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#64748b" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 10: Top Categories (Pie) */}
        <div className="card md:p-8 flex flex-col border-none shadow-xl shadow-gray-100" style={{ height: '420px', minHeight: '420px' }}>
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-8">
            <Layers size={18} className="text-cyan-600" />
            Producción por Naturaleza (I+D+i vs Acad.)
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topCategories} cx="50%" cy="50%" outerRadius={110} dataKey="value" stroke="none">
                  {topCategories.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" formatter={(value) => <span className="text-[10px] font-bold text-gray-500 uppercase">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EXTRA STATS - Numerical / Logic */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor Punto 2025</p>
            <p className="text-2xl font-black text-primary-900">$ 22.358</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
              <TrendingUp size={10} /> Actualización anual
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proyección Salarial</p>
            <p className="text-2xl font-black text-emerald-700">
              $ {new Intl.NumberFormat('es-CO').format(totalPoints * 22358)}
            </p>
            <p className="text-[11px] text-secondary opacity-60 font-medium mt-2">Mensual aproximado</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Índice H-Google Scholar</p>
            <p className="text-2xl font-black text-indigo-700">Lincado</p>
            <p className="text-[11px] text-primary-500 font-bold mt-2">Sincronización Perfil</p>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, detail, theme }: any) => {
  const themes: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className="card p-6 border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${themes[theme]}`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-[11px] font-bold text-gray-500 opacity-60 italic">{detail}</div>
    </div>
  );
};
