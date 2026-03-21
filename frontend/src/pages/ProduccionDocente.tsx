import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BookOpen, UserPlus, X, AlertTriangle, Plus, ArrowLeft, Calendar, FileText, Calculator, Wallet, TrendingUp, Users, Search, Clock, Award } from 'lucide-react';

export const ProduccionDocente = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'lista' | 'nuevo'>('lista');
  const [products, setProducts] = useState<any[]>([]);
  const [ciarpRequests, setCiarpRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'académico' | 'investigación'>('investigación');
  const [type, setType] = useState('Artículo Científico');
  const [uniqueId, setUniqueId] = useState(''); // DOI, ISBN, ISSN
  const [metadata, setMetadata] = useState<any>({});

  // Coauthors State
  const [authors, setAuthors] = useState<any[]>([{ user: user?.id, name: user?.name, isExternal: false }]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [searchDocente, setSearchDocente] = useState('');

  const [showCiarpModal, setShowCiarpModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [puntosSolicitados, setPuntosSolicitados] = useState<number>(0);
  const [tipoReconocimiento, setTipoReconocimiento] = useState<'Puntos Salariales' | 'Bonificación'>('Puntos Salariales');
  const [evidencias, setEvidencias] = useState<{ file: File, description: string }[]>([]);

  // Table Filters
  const [filterType, setFilterType] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ----------------- MOTOR DE CÁLCULO UNIFICADO (DEC. 1279) -----------------
  const getProductPoints = (product: any, meta: any) => {
    let base = 0;
    const type = product.type || '';
    const authorsCount = product.authors?.length || 1;

    if (type.includes('Artículo')) {
      if (meta.categoria?.includes('A1')) base = 15;
      else if (meta.categoria?.includes('A2')) base = 12;
      else if (meta.categoria?.includes('B')) base = 8;
      else if (meta.categoria?.includes('C')) base = 3;
    } else if (type.includes('Libro')) {
      base = 20;
    } else if (type.includes('Software') || type.includes('Patente')) {
      base = 15;
    } else if (type.includes('Título')) {
      if (meta.nivel?.includes('Doctorado')) base = 120;
      else if (meta.nivel?.includes('Maestría')) base = 40;
      else if (meta.nivel?.includes('Especialización')) base = 20;
      else if (meta.nivel?.includes('Pregrado')) base = 178;
    } else if (type.includes('Experiencia')) {
      base = (parseFloat(meta.tiempo_anios) || 0) * 4;
    } else if (type.includes('Premio')) {
      base = 15;
    } else if (type.includes('Producción técnica')) {
      base = 0; // Según tabla enviada
    } else if (type.includes('Categoría Docente')) {
      if (meta.categoria?.includes('Asistente')) base = 58;
      else if (meta.categoria?.includes('Auxiliar')) base = 37;
      else if (meta.categoria?.includes('Asociado')) base = 74;
      else if (meta.categoria?.includes('Titular')) base = 96;
    }
    return base > 0 ? Number((base / authorsCount).toFixed(2)) : 0;
  };

  // ----------------- CÁLCULO DE PUNTOS (KARDEX) -----------------
  const results = React.useMemo(() => {
    const aprobados = ciarpRequests.filter(r => r.status === 'Aprobado' && r.tipoReconocimiento === 'Puntos Salariales');
    const transito = ciarpRequests.filter(r => r.status === 'En Estudio CIARP');
    
    const calculateSum = (list: any[]) => list.reduce((sum, r) => {
      // Usar puntos de la solicitud o recalcular si está en 0 pero es aprobado
      const pts = Number(r.puntosSolicitados) > 0 ? Number(r.puntosSolicitados) : getProductPoints(r.productId || {}, r.productId?.metadata || {});
      return sum + pts;
    }, 0);

    const ptsCat = calculateSum(aprobados.filter(r => r.productId?.type?.includes('Categoría')));
    const ptsTitulos = calculateSum(aprobados.filter(r => r.productId?.type?.includes('Título')));
    const ptsExp = calculateSum(aprobados.filter(r => r.productId?.type?.includes('Experiencia')));
    const ptsProd = calculateSum(aprobados.filter(r => {
      const t = r.productId?.type || '';
      return t.includes('Artículo') || t.includes('Libro') || t.includes('Software') || t.includes('Patente') || t.includes('Premio') || t.includes('Producción técnica');
    }));
    
    const totalAprobados = ptsCat + ptsTitulos + ptsExp + ptsProd;
    const totalTransito = calculateSum(transito);

    return { totalAprobados, totalTransito, ptsCat, ptsExp, ptsTitulos, ptsProd };
  }, [ciarpRequests]);

  // Form Meta Templates (Decreto 1279 de 2002)
  const productTypes = [
    {
      name: 'Premio', idType: 'Acta / Certificación',
      meta: [
        { key: 'otorgado_por', label: 'Entidad que otorga', type: 'text' },
        { key: 'ambito', label: 'Ámbito', type: 'select', options: ['Nacional', 'Internacional'] },
        { key: 'anio', label: 'Año', type: 'number' }
      ]
    },
    {
      name: 'Producción técnica', idType: 'Registro / Patente',
      meta: [
        { key: 'entidad', label: 'Entidad de registro', type: 'text' },
        { key: 'link', label: 'Link Ejecutable / Evidencia', type: 'text' },
        { key: 'anio', label: 'Año', type: 'number' }
      ]
    },
    {
      name: 'Categoría Docente', idType: 'Resolución o Acta',
      meta: [
        { key: 'categoria', label: 'Categoría Asignada', type: 'select', options: ['Auxiliar', 'Asistente', 'Asociado', 'Titular'] }
      ]
    },
    {
      name: 'Experiencia Calificada', idType: 'Certificación Laboral',
      meta: [
        { key: 'tipo_contrato', label: 'Tipo de Vinculación', type: 'select', options: ['Contrato Laboral', 'Prestación de Servicios (No puntuable)'] },
        { key: 'tipo_exp', label: 'Tipo de Experiencia', type: 'select', options: ['Docencia Universitaria', 'Experiencia Profesional Dirigida', 'Investigación pura'] },
        { key: 'fecha_inicio', label: 'Fecha Inicial', type: 'date' },
        { key: 'fecha_fin', label: 'Fecha Final', type: 'date' },
        { key: 'tiempo_anios', label: 'Tiempo Total (Años)', type: 'number' }
      ]
    },
    {
      name: 'Título Académico', idType: 'Acta / Diploma',
      meta: [
        { key: 'nivel', label: 'Nivel del Título', type: 'select', options: ['Pregrado', 'Especialización', 'Maestría', 'Doctorado'] },
        { key: 'institucion', label: 'Institución', type: 'text' },
        { key: 'pais', label: 'País', type: 'text' },
        { key: 'ciudad', label: 'Ciudad', type: 'text' },
        { key: 'convalidado', label: 'Convalidado MEN', type: 'select', options: ['No Aplica/Nacional', 'Sí, Convalidado', 'En Trámite'] },
        { key: 'mes', label: 'Mes de Grado', type: 'select', options: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] },
        { key: 'anio', label: 'Año de Grado', type: 'number' }
      ]
    },
    {
      name: 'Artículo Indexado', idType: 'ISSN',
      meta: [
        { key: 'revista', label: 'Nombre de la Revista', type: 'text' },
        { key: 'categoria', label: 'Categoría Rev. (Minciencias)', type: 'select', options: ['Indexado A1', 'Indexado A2', 'Indexado B', 'Indexado C'] },
        { key: 'volumen', label: 'Volumen', type: 'text' },
        { key: 'numero', label: 'Fascículo / Número', type: 'text' },
        { key: 'mes', label: 'Mes de Publicación', type: 'select', options: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] },
        { key: 'anio', label: 'Año de Publicación', type: 'number' },
        { key: 'enlace', label: 'Enlace web / DOI URL', type: 'text' },
        { key: 'autores_totales', label: 'Número Total de Autores en el Documento', type: 'number' }
      ]
    },
    {
      name: 'Artículo No Indexado', idType: 'ISSN / Registro',
      meta: [
        { key: 'revista', label: 'Nombre de la Revista / Publicación', type: 'text' },
        { key: 'volumen', label: 'Volumen', type: 'text' },
        { key: 'numero', label: 'Fascículo / Número', type: 'text' },
        { key: 'mes', label: 'Mes de Publicación', type: 'select', options: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] },
        { key: 'anio', label: 'Año de Publicación', type: 'number' },
        { key: 'enlace', label: 'Enlace web / DOI URL', type: 'text' },
        { key: 'autores_totales', label: 'Número Total de Autores en el Documento', type: 'number' }
      ]
    },
    {
      name: 'Libro', idType: 'ISBN',
      meta: [
        { key: 'editorial', label: 'Editorial', type: 'text' },
        { key: 'pais', label: 'País', type: 'text' },
        { key: 'ciudad', label: 'Ciudad', type: 'text' },
        { key: 'mes', label: 'Mes de Publicación', type: 'select', options: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] },
        { key: 'anio', label: 'Año de Publicación', type: 'number' },
        { key: 'tiraje', label: 'Tiraje', type: 'number' },
        { key: 'tipo_libro', label: 'Tipo de Libro', type: 'select', options: ['Texto / Académico', 'Resultado de Investigación'] },
        { key: 'autores_totales', label: 'Número Total de Autores', type: 'number' }
      ]
    },
    {
      name: 'Capítulo de Libro', idType: 'ISBN del Libro',
      meta: [
        { key: 'titulo_libro', label: 'Título del Libro Principal', type: 'text' },
        { key: 'editorial', label: 'Editorial', type: 'text' },
        { key: 'pais', label: 'País', type: 'text' },
        { key: 'anio', label: 'Año de Publicación', type: 'number' },
        { key: 'autores_totales', label: 'Número Total de Autores', type: 'number' }
      ]
    },
    {
      name: 'Patente de Invención', idType: 'Código de Registro',
      meta: [
        { key: 'entidad', label: 'Entidad Otorgante', type: 'text' },
        { key: 'anio', label: 'Año de Otorgamiento', type: 'number' },
        { key: 'autores_totales', label: 'Número Total de Autores', type: 'number' }
      ]
    },
    {
      name: 'Software / App', idType: 'Registro DNDA',
      meta: [
        { key: 'plataforma', label: 'Plataforma o Lenguaje', type: 'text' },
        { key: 'version', label: 'Versión del Software', type: 'text' },
        { key: 'anio', label: 'Año de Registro', type: 'number' },
        { key: 'autores_totales', label: 'Número Total de Autores', type: 'number' }
      ]
    },
    {
      name: 'Categoría Docente', idType: 'Resolución o Acta',
      meta: [
        { key: 'categoria_asignada', label: 'Categoría Solicitada', type: 'select', options: ['Asignación de Categoría', 'Auxiliar', 'Asistente', 'Asociado', 'Titular'] }
      ]
    }
  ];

  const currentTypeConfig = productTypes.find(t => t.name === type);

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: prods } = await api.get('/products/me');
      setProducts(prods);

      try {
        const { data: reqs } = await api.get('/ciarp/my-requests');
        setCiarpRequests(reqs);
      } catch (e) { console.error('CIARP API Error', e); }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users?role=docente');
      setAvailableUsers(data);
    } catch (e) { }
  };

  const handleDynamicChange = (key: string, value: string) => {
    const newMeta = { ...metadata, [key]: value };
    
    // Auto-calculate years if we have both dates for 'Experiencia Calificada'
    if (type === 'Experiencia Calificada' && (key === 'fecha_inicio' || key === 'fecha_fin')) {
      const start = newMeta.fecha_inicio ? new Date(newMeta.fecha_inicio) : null;
      const end = newMeta.fecha_fin ? new Date(newMeta.fecha_fin) : null;
      
      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        newMeta.tiempo_anios = diffYears > 0 ? Number(diffYears.toFixed(2)) : 0;
      }
    }
    
    setMetadata(newMeta);
  };

  const handleAddAuthor = (selectedUser: any) => {
    if (authors.some(a => a.user === selectedUser._id)) {
      return alert('Este docente ya está agregado como coautor.');
    }
    setAuthors([...authors, { user: selectedUser._id, name: selectedUser.name, isExternal: false }]);
    setSearchDocente('');
  };

  const handleAddExternalUser = () => {
    if (!searchDocente.trim()) return;
    setAuthors([...authors, { name: searchDocente, isExternal: true }]);
    setSearchDocente('');
  };

  const removeAuthor = (idx: number) => {
    if (authors[idx].user === user?.id) return alert('No puedes removerte a ti mismo del producto que estás registrando.');
    setAuthors(authors.filter((_, i) => i !== idx));
  };

  // Mock Database for Journals (Base de Datos de Revistas)
  const journalsDB = [
    { name: 'Nature', issn1: '0028-0836', issn2: '1476-4687', index: { '2024': 'A1', '2023': 'A1', '2022': 'A1' } },
    { name: 'IEEE Transactions on Software Engineering', issn1: '0098-5589', issn2: '1939-3520', index: { '2024': 'A1', '2023': 'A1' } },
    { name: 'Revista UIS Ingenierías', issn1: '1657-4583', issn2: '2145-8456', index: { '2024': 'B', '2023': 'B', '2022': 'C' } },
    { name: 'DYNA Colombia', issn1: '0012-7353', issn2: '2346-2183', index: { '2024': 'A2', '2023': 'A1' } }
  ];

  useEffect(() => {
    // Auto-journal lookup
    if (type === 'Artículo Indexado' && uniqueId.length === 9) {
      const found = journalsDB.find(j => j.issn1 === uniqueId || j.issn2 === uniqueId);
      if (found && found.name !== metadata.revista) {
        const yearStr = metadata.anio?.toString() || new Date().getFullYear().toString();
        const cat = found.index[yearStr as keyof typeof found.index] || 'No Indexada';
        
        setMetadata((prev: any) => ({
          ...prev,
          revista: found.name,
          categoria: cat
        }));
      }
    }
  }, [uniqueId, type, metadata.anio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('El título es requerido.');

    const payload = {
      title,
      category,
      type,
      uniqueId: uniqueId || undefined,
      metadata,
      authors
    };

    try {
      await api.post('/products', payload);
      alert('Producto registrado exitosamente. Ya está visible en su perfil y en el de sus coautores internos.');
      setActiveTab('lista');
      fetchProducts();
      // Reset
      setTitle(''); setUniqueId(''); setMetadata({}); setAuthors([{ user: user?.id, name: user?.name, isExternal: false }]);
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Ocurrió un error al registrar el producto.');
      }
    }
  };

  const handleOpenCiarpModal = (product: any) => {
    setSelectedProduct(product);
    setLegalAccepted(false);

    const calculatedPoints = getProductPoints(product, product.metadata || {});
    setPuntosSolicitados(calculatedPoints);

    setTipoReconocimiento('Puntos Salariales');
    setEvidencias([]);
    setShowCiarpModal(true);
  };

  const submitCiarpRequest = async () => {
    if (!legalAccepted) return alert('Debe aceptar la declaratoria de integridad y ética para continuar.');
    if (puntosSolicitados < 0) return alert('Los puntos solicitados deben ser un número válido.');
    if (evidencias.length === 0) return alert('Debe adjuntar al menos 1 archivo PDF como evidencia.');
    if (evidencias.some(e => !e.description.trim())) return alert('Por favor escriba una descripción para todos los archivos PDF cargados.');

    try {
      const formData = new FormData();
      formData.append('productId', selectedProduct._id);
      formData.append('tipoReconocimiento', tipoReconocimiento);
      formData.append('puntosSolicitados', String(puntosSolicitados));
      formData.append('descriptions', JSON.stringify(evidencias.map(e => e.description)));

      evidencias.forEach(e => {
        formData.append('files', e.file);
      });

      await api.post('/ciarp/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('¡Solicitud oficializada y radicada con éxito ante el Comité CIARP!');
      setShowCiarpModal(false);
      fetchProducts();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al radicar ante el CIARP.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al eliminar el producto.');
    }
  };

  return (
    <div className="animate-fade-in pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Producción Intelectual</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Gestione sus artículos, libros, patentes y sométalos a valoración (CIARP).</p>
        </div>

        <div>
          {activeTab === 'lista' ? (
            <button
              className="btn btn-primary shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-base px-6 py-3 font-bold rounded-2xl"
              onClick={() => setActiveTab('nuevo')}
            >
              <Plus size={20} className="mr-2" /> Radicar Nuevo Producto
            </button>
          ) : (
            <button
              className="btn bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center"
              onClick={() => setActiveTab('lista')}
            >
              <ArrowLeft size={18} className="mr-2" /> Volver a mis estadísticas
            </button>
          )}
        </div>
      </div>

      {activeTab === 'lista' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-10 text-secondary">Cargando producción...</div>
          ) : products.length === 0 ? (
            <div className="card text-center py-16 bg-white border border-dashed border-gray-200 shadow-none">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-bold text-gray-600">No tienes producción registrada</p>
              <p className="text-sm text-gray-400 max-w-md mx-auto mt-2">Registra tus artículos o libros para que formen parte de tu escalafón oficial de la Universidad de Sucre.</p>
            </div>
          ) : (
            <>
              {/* ----------------- KARDEX SALARIAL (BILLETERA DOCENTE) ----------------- */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Kardex Financiero Principal */}
                <div className="card" style={{ flex: '0 0 35%', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="flex items-center mb-2">
                      <Wallet style={{ color: '#10b981', marginRight: '0.5rem' }} size={24} strokeWidth={1.5} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Kardex Financiero</h3>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
                      Totalización de Puntos Acumulados y Proyección Salarial Oficial (Dec. 1279). Valor Vrg. $ 22.358
                    </p>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>~ Puntos Totales</p>
                      <p style={{ fontSize: '2rem', fontWeight: 300, color: '#065f46', lineHeight: 1 }}>{results.totalAprobados} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>pts</span></p>
                    </div>
                    <div style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '1.125rem', fontWeight: 700 }}>
                      <span style={{ color: '#059669', marginRight: '0.25rem' }}>$</span>{new Intl.NumberFormat('es-CO').format(results.totalAprobados * 22358)} <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#059669' }}>COP</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Categorías */}
                <div className="flex flex-col md:flex-row gap-4" style={{ flex: 1 }}>
                  <div className="card flex-1" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <Wallet size={20} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} strokeWidth={1.5} />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Categoría</h4>
                    <p style={{ fontSize: '1.875rem', fontWeight: 300, color: '#065f46' }}>{results.ptsCat} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>pts</span></p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '1rem', lineHeight: 1.2 }}>Acumulado mensual permanente</p>
                  </div>
                  <div className="card flex-1" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <TrendingUp size={20} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} strokeWidth={1.5} />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Experiencia</h4>
                    <p style={{ fontSize: '1.875rem', fontWeight: 300, color: '#065f46' }}>{results.ptsExp} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>pts</span></p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '1rem', lineHeight: 1.2 }}>Acumulado permanente</p>
                  </div>
                  <div className="card flex-1" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <Award size={20} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} strokeWidth={1.5} />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tránsito</h4>
                    <p style={{ fontSize: '1.875rem', fontWeight: 300, color: '#b45309' }}>{results.totalTransito} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>pts</span></p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '1rem', lineHeight: 1.2 }}>Pendientes por CIARP</p>
                  </div>
                  <div className="card flex-1" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <Users size={20} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} strokeWidth={1.5} />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Producción</h4>
                    <p style={{ fontSize: '1.875rem', fontWeight: 300, color: '#065f46' }}>{results.ptsProd} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>pts</span></p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '1rem', lineHeight: 1.2 }}>Acumulado permanente</p>
                  </div>
                </div>
              </div>

              {/* Tránsito Ribbon */}
              {results.totalTransito > 0 && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#b45309', marginBottom: '1.5rem' }}>
                  <AlertTriangle size={14} style={{ marginRight: '0.5rem', color: '#f59e0b' }} />
                  Tienes {results.totalTransito} puntos en tránsito siendo analizados por el Comité CIARP.
                </div>
              )}

              {/* KPI Dashboard (Graficos y Cantidades) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:shadow-md">
                  <div className="flex flex-col">
                    <p className="text-[12px] text-gray-800 font-semibold mb-1">Total Entradas</p>
                    <p className="text-xs text-gray-500">{products.length}</p>
                  </div>
                  <p className="text-3xl font-light text-emerald-700/80">{products.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:shadow-md">
                  <div className="flex flex-col">
                    <p className="text-[12px] text-gray-800 font-semibold mb-1">Artículos Index.</p>
                    <p className="text-xs text-gray-500">{products.filter(p => p.type === 'Artículo Indexado').length}</p>
                  </div>
                  <p className="text-3xl font-light text-emerald-700/80">{products.filter(p => p.type === 'Artículo Indexado').length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:shadow-md">
                  <div className="flex flex-col">
                    <p className="text-[12px] text-gray-800 font-semibold mb-1">Libros / Caps</p>
                    <p className="text-xs text-gray-500">{products.filter(p => p.type.includes('Libro')).length}</p>
                  </div>
                  <p className="text-3xl font-light text-emerald-700/80">{products.filter(p => p.type.includes('Libro')).length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:shadow-md">
                  <div className="flex flex-col">
                    <p className="text-[12px] text-gray-800 font-semibold mb-1">Software / Pat.</p>
                    <p className="text-xs text-gray-500">{products.filter(p => p.type.includes('Software') || p.type.includes('Patente')).length}</p>
                  </div>
                  <p className="text-3xl font-light text-emerald-700/80">{products.filter(p => p.type.includes('Software') || p.type.includes('Patente')).length}</p>
                </div>
              </div>

              {/* Tabla de Productos Estructurada con Filtros Premium */}
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 mb-10 overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-5 border-b border-slate-50 flex flex-col lg:flex-row gap-4 items-center bg-slate-50/30">
                  <div className="relative flex-[2] w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none shadow-sm"
                      placeholder="Buscar por nombre del registro..." 
                      value={filterTitle} 
                      onChange={e => setFilterTitle(e.target.value)} 
                    />
                  </div>
                  
                  <div className="flex flex-1 w-full gap-3">
                    <div className="relative flex-1 group">
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none shadow-sm appearance-none cursor-pointer"
                        value={filterType} 
                        onChange={e => setFilterType(e.target.value)}
                      >
                        <option value="">Todas las Categorías</option>
                        <option value="Artículo">Artículos</option>
                        <option value="Libro">Libros / Capítulos</option>
                        <option value="Software">Software / Patentes</option>
                        <option value="Ponencia">Eventos / Ponencias</option>
                      </select>
                      <Plus size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative flex-1 group">
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none shadow-sm appearance-none cursor-pointer"
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                        <option value="">Todos los Estados</option>
                        <option value="radicado">Radicado</option>
                        <option value="evaluación">En Evaluación</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="rechazado">Rechazado</option>
                      </select>
                      <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-5 font-black text-slate-500 text-[11px] uppercase tracking-wider">Categoría › Tipo</th>
                        <th className="px-6 py-5 font-black text-slate-500 text-[11px] uppercase tracking-wider w-1/3">Nombre del Registro</th>
                        <th className="px-6 py-5 font-black text-slate-500 text-[11px] uppercase tracking-wider text-center">Radicación</th>
                        <th className="px-6 py-5 font-black text-slate-500 text-[11px] uppercase tracking-wider">Participación</th>
                        <th className="px-6 py-5 font-black text-slate-500 text-[11px] uppercase tracking-wider text-center">Estado CIARP</th>
                        <th className="px-6 py-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.filter(p => {
                        const matchType = filterType ? (p.type.toLowerCase().includes(filterType.toLowerCase()) || p.category.toLowerCase().includes(filterType.toLowerCase())) : true;
                        const matchTitle = filterTitle ? p.title.toLowerCase().includes(filterTitle.toLowerCase()) : true;
                        const matchStatus = filterStatus ? p.status.toLowerCase().includes(filterStatus.toLowerCase()) : true;
                        return matchType && matchTitle && matchStatus;
                      }).map(p => {
                        const radDate = new Date(p.createdAt);
                        const dateStr = radDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
                        const initialStr = p.authors.map((a: any) => a.name.charAt(0)).join('').toUpperCase().substring(0, 4);

                        return (
                          <tr key={p._id} className="hover:bg-emerald-50/20 transition-all group">
                            <td className="px-6 py-6 align-middle">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter mb-0.5">{p.category}</span>
                                <span className="text-sm font-bold text-slate-700">{p.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-6 align-middle">
                              <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors">{p.title}</p>
                            </td>
                            <td className="px-6 py-6 align-middle text-center">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-slate-500 text-xs font-bold">
                                <Calendar size={13} />
                                {dateStr}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-middle">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 border-2 border-white shadow-sm">
                                  {initialStr}
                                </div>
                                <span className="text-xs font-bold text-slate-500">{p.authors.length} Autores</span>
                              </div>
                            </td>
                            <td className="px-6 py-6 align-middle text-center">
                              {p.status === 'radicado' || p.status === 'borrador' ? (
                                <button 
                                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                  onClick={() => handleOpenCiarpModal(p)}
                                >
                                  Enviar a CIARP
                                </button>
                              ) : (
                                <span style={{
                                  padding: '6px 16px',
                                  borderRadius: '9999px',
                                  fontSize: '10px',
                                  fontWeight: '900',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  backgroundColor: p.status === 'evaluación_ciarp' ? '#fef3c7' : p.status === 'aprobado_ciarp' ? '#d1fae5' : '#fee2e2',
                                  color: p.status === 'evaluación_ciarp' ? '#b45309' : p.status === 'aprobado_ciarp' ? '#059669' : '#dc2626',
                                  border: `1px solid ${p.status === 'evaluación_ciarp' ? '#fde68a' : p.status === 'aprobado_ciarp' ? '#a7f3d0' : '#fecaca'}`,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {p.status === 'aprobado_ciarp' && <Award size={12} />}
                                  {p.status.replace('_', ' ').replace('ciarp', '')}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-6 align-middle text-right">
                              {(p.status === 'radicado' || p.status === 'borrador') && (
                                <button 
                                  onClick={() => handleDeleteProduct(p._id)}
                                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  title="Eliminar registro"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {products.length > 0 && products.filter(p => {
                        const matchType = filterType ? (p.type.toLowerCase().includes(filterType.toLowerCase()) || p.category.toLowerCase().includes(filterType.toLowerCase())) : true;
                        const matchTitle = filterTitle ? p.title.toLowerCase().includes(filterTitle.toLowerCase()) : true;
                        const matchStatus = filterStatus ? p.status.toLowerCase().includes(filterStatus.toLowerCase()) : true;
                        return matchType && matchTitle && matchStatus;
                      }).length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-20 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p className="font-bold">No se encontraron registros</p>
                                <p className="text-xs">Intenta ajustar los términos de búsqueda o filtros.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50/50 p-6 flex justify-between items-center border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Total: <span className="text-slate-800">{products.length} registros</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-all">&laquo;</button>
                    <button className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20">1</button>
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-all">&raquo;</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'nuevo' && (
        <div className="card p-8 max-w-5xl border border-gray-100 shadow-lg mx-auto bg-white rounded-2xl relative">
          <h3 className="font-extrabold text-2xl text-primary-900 mb-6 flex items-center border-b pb-4">
            <BookOpen className="mr-3 text-primary-500" size={28} /> Formulario Oficial de Producción
          </h3>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Categorización */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Naturaleza del Producto</label>
                <select className="form-input w-full" value={category} onChange={e => setCategory(e.target.value as any)}>
                  <option value="investigación">Resultado de Investigación</option>
                  <option value="académico">Producción Académica</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tipología</label>
                <select className="form-input w-full" value={type} onChange={e => { setType(e.target.value); setMetadata({}); }}>
                  {productTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </section>

            {/* General Data */}
            <section className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">
                  {type === 'Categoría Docente' ? 'Nombre de la Solicitud' : 
                   type === 'Experiencia Calificada' ? 'Entidad / Institución' : 
                   `Título Oficial del ${type}`}
                </label>
                <input 
                  type="text" 
                  className="form-input w-full" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  placeholder={
                    type === 'Categoría Docente' ? "Ej: Solicitud de Ascenso a Asociado" : 
                    type === 'Experiencia Calificada' ? "Nombre de la Empresa o Universidad donde laboró" :
                    "Escriba el título exacto tal cual fue publicado"
                  } 
                />
              </div>
              {/* Unique ID Section - Hidden for Individual/Non-Product requests */}
              {type !== 'Categoría Docente' && type !== 'Experiencia Calificada' && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase block">
                      {(type === 'Artículo Indexado' || type === 'Artículo No Indexado') ? 'ISSN (Requerido)' : (currentTypeConfig?.idType || 'Identificador Único')}
                    </label>
                    {type !== 'Artículo Indexado' && type !== 'Artículo No Indexado' && (
                      <span className="tooltip group relative cursor-help">
                        <AlertTriangle size={14} className="text-orange-500" />
                        <span className="tooltiptext hidden group-hover:block absolute bg-gray-800 text-white text-[10px] w-64 p-2 rounded -top-12 left-6 z-50">
                          Si un coautor ya registró este ISBN/DOI, el sistema lo detectará para evitar doble conteo.
                        </span>
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className={`form-input w-full md:w-1/2 font-mono ${(type === 'Artículo Indexado' || type === 'Artículo No Indexado') ? 'border-emerald-200' : 'text-primary-700'}`} 
                    value={uniqueId} 
                    onChange={e => {
                      let val = e.target.value.toUpperCase();
                      if (type === 'Artículo Indexado' || type === 'Artículo No Indexado') {
                        // ISSN Mask: XXXX-XXXX
                        val = val.replace(/[^A-Z0-9]/g, ''); // Remove non-alphanumeric
                        if (val.length > 8) val = val.substring(0, 8);
                        if (val.length > 4) {
                          val = val.substring(0, 4) + '-' + val.substring(4);
                        }
                      }
                      setUniqueId(val);
                    }} 
                    placeholder={(type === 'Artículo Indexado' || type === 'Artículo No Indexado') ? "Ej: 1234-5678" : "Ej. 10.1000/xyz123 O 978-3-16-148410-0"} 
                    maxLength={(type === 'Artículo Indexado' || type === 'Artículo No Indexado') ? 9 : 100}
                    required={type === 'Artículo Indexado' || type === 'Artículo No Indexado'}
                  />
                  {(type === 'Artículo Indexado' || type === 'Artículo No Indexado') && !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(uniqueId) && uniqueId.length > 0 && (
                    <p className="text-[10px] text-red-500 mt-1 font-bold italic">Formato ISSN inválido (XXXX-XXXX)</p>
                  )}
                </div>
              )}

              {/* Metadata fields based on Typlogy */}
              {currentTypeConfig && currentTypeConfig.meta.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4 mt-4">
                  {currentTypeConfig.meta.map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{field.label}</label>

                      {field.type === 'select' ? (
                        <select className="form-input w-full text-sm" value={metadata[field.key] || ''} onChange={e => handleDynamicChange(field.key, e.target.value)}>
                          <option value="">-- Seleccionar --</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2">
                            <input 
                              type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} 
                              className={`form-input flex-1 text-sm ${field.key === 'enlace' ? 'text-blue-600 font-medium' : ''}`} 
                              value={metadata[field.key] || ''} 
                              onChange={e => handleDynamicChange(field.key, e.target.value)} 
                              placeholder={field.key === 'enlace' ? "https://..." : ""}
                            />
                            {field.key === 'enlace' && metadata[field.key] && (
                              <button 
                                type="button"
                                onClick={() => window.open(metadata[field.key], '_blank')}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all"
                              >
                                Probar
                              </button>
                            )}
                          </div>
                          {field.key === 'enlace' && (
                            <p className="text-[10px] text-slate-400 italic">El enlace debe llevar directamente al artículo o resumen oficial.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* MAGIC: Co-author Multi-System - Hidden for Individual Requests (Category, Experience, Degree) */}
            {type !== 'Categoría Docente' && 
             type !== 'Experiencia Calificada' && 
             type !== 'Título Académico' && (
              <section>
                <h4 className="flex items-center text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                  <UserPlus size={20} className="mr-2 text-primary-500" /> Autores y Co-Autores
                </h4>
              <p className="text-xs text-secondary mb-4">
                Declare todas las personas que contribuyeron al producto. Si pertenecen a la universidad, agréguelos usando la casilla de búsqueda; si son externos al ecosistema, digite su nombre completo y presione "Agregar Autor Externo". El sistema auto-asociará este producto a los perfiles de los docentes internos de inmediato.
              </p>

              <div className="flex gap-2 mb-4 relative max-w-xl">
                <input
                  type="text"
                  className="form-input flex-1 text-sm"
                  placeholder="Buscar docente o digitar nombre externo..."
                  value={searchDocente}
                  onChange={e => setSearchDocente(e.target.value)}
                />
                <button type="button" className="btn btn-outline" onClick={handleAddExternalUser}>Añadir Externo</button>

                {/* Auto-suggest dropdown for quick internal match */}
                {searchDocente.trim().length > 2 && (
                  <div className="absolute top-12 left-0 w-2/3 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    {availableUsers.filter(u => u.name.toLowerCase().includes(searchDocente.toLowerCase())).map(u => (
                      <div key={u._id} className="p-3 hover:bg-gray-50 cursor-pointer border-b text-sm" onClick={() => handleAddAuthor(u)}>
                        <span className="font-bold text-gray-800 block">{u.name}</span>
                        <span className="text-xs text-gray-500">{u.email}</span>
                      </div>
                    ))}
                    {availableUsers.filter(u => u.name.toLowerCase().includes(searchDocente.toLowerCase())).length === 0 && (
                      <div className="p-3 text-sm text-gray-500 italic">No se encontraron docentes. Añádalo como externo.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-lg overflow-hidden shrink-0 max-w-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs">
                    <tr>
                      <th className="p-3 font-bold">Autor(es) Asociados</th>
                      <th className="p-3 font-bold w-24 text-center">Tipo</th>
                      <th className="p-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {authors.map((a, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3">
                          <span className={a.user === user?.id ? 'font-bold text-primary-700' : 'font-medium text-gray-800'}>
                            {a.name} {a.user === user?.id && '(Tú)'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {a.isExternal ?
                            <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold uppercase tracking-wide">Externo</span> :
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold uppercase tracking-wide">Interno Unisucre</span>
                          }
                        </td>
                        <td className="p-3 text-right">
                          {a.user !== user?.id && (
                            <button type="button" className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-md" onClick={() => removeAuthor(idx)}><X size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="border-t pt-6 text-right">
              <button type="submit" className="btn btn-primary px-10 shadow-lg text-base">Guardar y Oficializar Producto</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE SOLICITUD CIARP (DECLARATORIA DECRETO 1279) */}
      {showCiarpModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="bg-primary-900 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center"><BookOpen className="mr-2" /> Solicitud Oficial ante CIARP</h3>
              <button className="text-white/70 hover:text-white" onClick={() => setShowCiarpModal(false)}><X /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase">Producto a evaluar</p>
                <p className="font-bold text-gray-900 text-lg leading-tight mt-1">{selectedProduct.title}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="bg-white px-2 py-0.5 rounded border">{selectedProduct.type}</span>
                  <span className="font-mono">{selectedProduct.uniqueId}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5 border-b pb-5">
                <div>
                  <label className="text-sm font-bold text-gray-800 block mb-2">Tipo de Solicitud Legal</label>
                  <select className="form-input w-full font-bold text-gray-700 bg-gray-50 mb-2 border-gray-300" value={tipoReconocimiento} onChange={e => setTipoReconocimiento(e.target.value as any)}>
                    <option value="Puntos Salariales">Puntos Salariales (Escalafón)</option>
                    <option value="Bonificación">Bonificación (Pago Único)</option>
                  </select>
                  <p className="text-xs text-gray-500 text-justify">El Comité puede cambiar esta naturaleza si la temporalidad del producto incumple la norma para escalafón.</p>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 p-4 rounded-xl relative overflow-hidden shadow-inner">
                  <div className="absolute opacity-[0.05] -right-4 -bottom-4 z-0 text-primary-900">
                    <Calculator size={100} />
                  </div>

                  <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest flex items-center mb-1 relative z-10">
                    <Calculator size={12} className="mr-1.5" /> Motor Dec. 1279
                  </label>

                  <div className="flex items-end gap-2 mb-2 relative z-10">
                    <span className="text-4xl font-black text-primary-900 leading-none tracking-tighter shadow-sm">{puntosSolicitados}</span>
                    <span className="text-sm font-bold text-primary-700 pb-1">pts. netos referenciales</span>
                  </div>

                  <p className="text-xs text-primary-800 font-medium relative z-10 leading-tight">
                    Cálculo fraccionado en base a <strong className="font-extrabold text-primary-900">{selectedProduct?.authors?.length || 1} autor(es)</strong> declarados para este producto.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-800 block mb-2 flex items-center"><FileText size={16} className="mr-2" /> Evidencias Adjuntas (PDF)</label>
                <p className="text-xs text-secondary mb-3">Soporte verificable del producto (Ej. Copia del artículo con el ISSN, resolución). <strong>Máximo 3 archivos.</strong></p>

                <div className="border border-dashed border-gray-400 bg-gray-50 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="pdf_upload_ciarp"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={e => {
                      if (e.target.files) {
                        const filesArray = Array.from(e.target.files);
                        if (evidencias.length + filesArray.length > 3) {
                          alert('El sistema permite un máximo estricto de 3 archivos de evidencia por producto.');
                        } else {
                          const newEvidences = filesArray.map(f => ({ file: f, description: '' }));
                          setEvidencias([...evidencias, ...newEvidences].slice(0, 3));
                        }
                        // Reset input value to allow selecting same file if it was removed
                        e.target.value = '';
                      }
                    }}
                  />
                  <label htmlFor="pdf_upload_ciarp" className="btn btn-outline border-primary-500 text-primary-600 bg-white hover:bg-primary-50 cursor-pointer inline-flex items-center font-bold px-4 py-2 rounded shadow-sm">
                    <FileText size={18} className="mr-2" />
                    Seleccionar PDFs desde mi computador
                  </label>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Puedes cargar {3 - evidencias.length} archivos más. Límite: 3 PDFs</p>
                </div>

                {evidencias.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {evidencias.map((ev, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white border border-gray-200 shadow-sm p-3 rounded-md items-center animate-fade-in">

                        <div className="md:col-span-4 flex items-center gap-2 overflow-hidden">
                          <div className="bg-red-50 text-red-600 p-1.5 rounded shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-800 truncate" title={ev.file.name}>{ev.file.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{(ev.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>

                        <div className="md:col-span-6">
                          <input
                            type="text"
                            className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Escriba aquí la descripción del PDF (Obligatorio)..."
                            value={ev.description}
                            onChange={e => {
                              const newEvidences = [...evidencias];
                              newEvidences[i].description = e.target.value;
                              setEvidencias(newEvidences);
                            }}
                            required
                          />
                        </div>

                        <div className="md:col-span-2 text-right">
                          <button type="button" onClick={() => setEvidencias(evidencias.filter((_, idx) => idx !== i))} className="bg-white border text-[11px] border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 font-bold px-2.5 py-1 rounded w-full md:w-auto shadow-sm transition-colors">
                            <X size={12} className="inline mr-1" />
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 p-5 rounded-lg mb-4">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded" checked={legalAccepted} onChange={e => setLegalAccepted(e.target.checked)} />
                  <span className="text-sm text-gray-800 text-justify leading-relaxed">
                    <strong>Declaratoria de Integridad:</strong> En calidad de autor de los productos sujetos a puntos salariales presentados, declaro que los mismos cumplen con la normatividad actual vigente de propiedad intelectual. Igualmente, asumo toda responsabilidad en la selección y publicación de mi trabajo en la revista y/o editorial elegida y confirmo que he validado su integridad, ética y buenas prácticas editoriales según los estándares nacionales e internacionales establecidos.
                  </span>
                </label>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => setShowCiarpModal(false)}>Cancelar</button>
              <button className="btn btn-primary shadow-md" onClick={submitCiarpRequest} disabled={!legalAccepted}>Radicar Solicitud al Comité</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
