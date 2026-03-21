import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Search, Loader2, User, GraduationCap, MapPin, BookOpen, Users } from 'lucide-react';

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

      <div className="card mb-8 flex items-center gap-4 py-4 px-6 shadow-sm border-gray-100">
        <Search size={20} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, correo, facultad o programa..." 
          className="bg-transparent border-none outline-none w-full text-base font-medium placeholder:text-gray-300"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        {loading ? (
             <div className="p-32 text-center text-gray-400 bg-gray-50/50">
                <Loader2 size={48} className="animate-spin mx-auto mb-4 text-primary-200" />
                <p className="font-bold text-gray-400">Consultando base de datos de investigadores...</p>
             </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-black text-gray-500 uppercase tracking-widest">
                    <th className="p-5 pl-8">Docente Investigador</th>
                    <th className="p-5">Categoría Minciencias</th>
                    <th className="p-5">Facultad y Programa</th>
                    <th className="p-5">Grupo de Investigación</th>
                    <th className="p-5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredResearchers.map(r => (
                    <tr key={r._id} className="hover:bg-primary-50/30 transition-all group">
                      <td className="p-5 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm border border-primary-200 group-hover:scale-110 transition-transform">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 text-sm group-hover:text-primary-700 transition-colors uppercase">{r.name}</div>
                            <div className="text-xs text-secondary opacity-60 font-medium">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                         <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border tracking-wider w-fit
                              ${r.mincienciasCategory ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                              {r.mincienciasCategory || 'NO CATEGORIZADO'}
                            </span>
                         </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-gray-700 font-bold text-[11px] mb-1">
                            <MapPin size={12} className="text-gray-400" />
                            {r.facultad || <span className="text-gray-300 italic">Sin Facultad</span>}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium pl-4">
                            <BookOpen size={10} className="text-gray-300" />
                            {r.programa || <span className="text-gray-300 italic">Sin Programa</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {r.grupos && r.grupos.length > 0 ? (
                            r.grupos.map((g, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-[10px] font-bold">
                                <Users size={10} className="text-emerald-500" />
                                {g.name}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-300 italic text-[10px]">Sin grupo asignado</span>
                          )}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="inline-flex items-center gap-1.5 text-success-600 font-bold text-[10px]">
                           <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                           ACTIVO
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredResearchers.length === 0 && (
                     <tr>
                       <td colSpan={5} className="p-20 text-center">
                         <div className="bg-gray-50 rounded-2xl p-10 border border-dashed border-gray-200 max-w-md mx-auto">
                            <Search size={40} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-medium italic">No se encontraron investigadores con el criterio de búsqueda "{searchTerm}"</p>
                         </div>
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}
      </div>
      
      <div className="mt-8 bg-primary-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-primary-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <h4 className="text-xl font-black mb-2 tracking-tight">Exportación de Datos Investigativos</h4>
          <p className="text-primary-100 text-sm opacity-80 max-w-xl">
            La lista de investigadores se actualiza en tiempo real conforme a los registros en SIGAI. 
            Próximamente podrá exportar este censo en formatos PDF y Excel para informes de gestión.
          </p>
        </div>
        <button className="relative z-10 btn bg-white text-primary-900 border-none px-8 font-black hover:bg-primary-50 transition-all uppercase tracking-widest text-xs h-12">
          Solicitar Reporte
        </button>
      </div>
    </div>
  );
};
