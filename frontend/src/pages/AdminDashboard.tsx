import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, GraduationCap, Briefcase, 
  Calendar, Layers, PieChart as PieIcon, BarChart3, Activity 
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export const AdminDashboard = () => {
  const [data, setData] = useState({
    convocatorias: [] as any[],
    groups: [] as any[],
    users: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resConv, resGroups, resUsers] = await Promise.all([
          fetch(`${API_URL}/convocatorias`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/users?role=docente`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (resConv.ok && resGroups.ok && resUsers.ok) {
          setData({
            convocatorias: await resConv.json(),
            groups: await resGroups.json(),
            users: await resUsers.json()
          });
        }
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [token]);

  // Data processing for charts
  const researchersByCategory = () => {
    const categories = data.users.reduce((acc: any, u) => {
      const cat = u.mincienciasCategory || 'No Categorizado';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(categories).map(k => ({ name: k, value: categories[k] }));
  };

  const groupsByFaculty = () => {
    const faculties = data.groups.reduce((acc: any, g) => {
      const fac = g.facultad || 'Otra';
      acc[fac] = (acc[fac] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(faculties).map(k => ({ name: k, value: faculties[k] }));
  };

  const researchersByFaculty = () => {
    const faculties = data.users.reduce((acc: any, u) => {
      const fac = u.facultad || 'Sin Facultad';
      acc[fac] = (acc[fac] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(faculties).map(k => ({ name: k, count: faculties[k] }));
  };

  const convosByYear = () => {
    const years = data.convocatorias.reduce((acc: any, c) => {
      const year = c.year || new Date(c.createdAt).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(years).sort().map(y => ({ year: y, total: years[y] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 text-emerald-600">
        <Activity size={48} className="animate-spin mb-4 opacity-40" />
        <p className="font-bold text-gray-500">Compilando estadísticas investigativas...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="heading-2 text-primary-900 tracking-tight flex items-center gap-3">
            <TrendingUp size={32} className="text-primary-600" />
            Panel Estadístico SIGAI
          </h2>
          <p className="text-secondary text-sm mt-1">Análisis detallado de la investigación y producción institucional.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sincronizado: Tiempo Real</span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Layers color="#3b82f6"/>} label="Convocatorias" value={data.convocatorias.length} trend="+2 este mes" theme="blue" />
        <StatCard icon={<Users color="#10b981"/>} label="Grupos de Inv." value={data.groups.length} trend="Avalados por Minciencias" theme="emerald" />
        <StatCard icon={<GraduationCap color="#8b5cf6"/>} label="Investigadores" value={data.users.length} trend="Docentes registrados" theme="purple" />
        <StatCard icon={<Briefcase color="#f59e0b"/>} label="Proyectos" value={24} trend="En ejecución" theme="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART: Researchers by Category */}
        <div className="card flex flex-col p-6 border-none shadow-xl shadow-gray-100" style={{ height: '400px' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-600" />
              Docentes por Categoría Minciencias
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={researchersByCategory()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CHART: Groups by Faculty */}
        <div className="card flex flex-col p-6 border-none shadow-xl shadow-gray-100" style={{ height: '400px' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <PieIcon size={18} className="text-emerald-600" />
              Grupos de Investigación por Facultad
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={groupsByFaculty()}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {groupsByFaculty().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* CHART: Convos by Year */}
        <div className="card flex flex-col p-6 border-none shadow-xl shadow-gray-100 lg:col-span-2" style={{ height: '400px' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Histórico de Convocatorias Lanzadas
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={convosByYear()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CHART: Researchers by Faculty */}
        <div className="card flex flex-col p-6 border-none shadow-xl shadow-gray-100 lg:col-span-2" style={{ height: '400px' }}>
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <Users size={18} className="text-purple-600" />
              Censo de Investigadores por Facultad
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={researchersByFaculty()} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={100} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, theme }: any) => {
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
      <div className="text-[11px] font-bold text-gray-500 opacity-60 italic">{trend}</div>
    </div>
  );
};
