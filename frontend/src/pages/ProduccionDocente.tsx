import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  BookOpen, UserPlus, X, AlertTriangle, Plus, ArrowLeft, FileSignature,
  FileText, Wallet, TrendingUp, Users, Search, Clock, Award,
  Trash2, Edit2, Settings2, Download,
  Eye, EyeOff, ChevronDown, GraduationCap
} from 'lucide-react';

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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Table Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAnio, setFilterAnio] = useState('');
  const [filterRadicacion, setFilterRadicacion] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    tipo: true,
    nombre: true,
    anio: true,
    radicacion: true,
    participacion: true,
    ciarp: true,
    acciones: true
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // ----------------- MOTOR DE CÁLCULO UNIFICADO (DEC. 1279) -----------------
  const getProductPoints = (product: any, meta: any) => {
    let base = 0;
    const type = product.type || '';
    const authorsCount = product.authors?.length || 1;

    // A. Liquidación base por Tipología
    if (type.includes('Artículo Indexado')) {
      if (meta.categoria?.includes('A1')) base = 15;
      else if (meta.categoria?.includes('A2')) base = 12;
      else if (meta.categoria?.includes('B')) base = 8;
      else if (meta.categoria?.includes('C')) base = 3;
    } else if (type.includes('Artículo No Indexado')) {
      base = 1.5; // Aproximado para no-indexados
    } else if (type.includes('Libro')) {
      if (meta.tipo_libro?.includes('Investigación')) base = 20;
      else if (meta.tipo_libro?.includes('Texto')) base = 15;
      else if (meta.tipo_libro?.includes('Ensayo')) base = 15;
      else base = 15;
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
    } else if (type.includes('Categoría Docente')) {
      if (meta.categoria?.includes('Asistente')) base = 58;
      else if (meta.categoria?.includes('Auxiliar')) base = 37;
      else if (meta.categoria?.includes('Asociado')) base = 74;
      else if (meta.categoria?.includes('Titular')) base = 96;
    }

    // B. Restricción por número de autores (Regla Global III)
    if (base <= 0) return 0;

    let pointsPerAuthor = 0;
    if (authorsCount <= 3) {
      // a) Hasta 3 autores: 100% puntaje a cada uno
      pointsPerAuthor = base;
    } else if (authorsCount <= 5) {
      // b) 4 a 5 autores: 50% puntaje a cada uno
      pointsPerAuthor = base / 2;
    } else {
      // c) 6 o más autores: Puntaje / (N / 2)
      pointsPerAuthor = base / (authorsCount / 2);
    }

    return Number(pointsPerAuthor.toFixed(2));
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
      requiredEvidences: ['Artículo en PDF'],
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
      requiredEvidences: ['Libro en PDF'],
      meta: [
        { key: 'editorial', label: 'Editorial', type: 'text' },
        { key: 'pais', label: 'País', type: 'text' },
        { key: 'ciudad', label: 'Ciudad', type: 'text' },
        { key: 'mes', label: 'Mes de Publicación', type: 'select', options: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] },
        { key: 'anio', label: 'Año de Publicación', type: 'number' },
        { key: 'tiraje', label: 'Tiraje', type: 'number' },
        { key: 'tipo_libro', label: 'Tipo de Libro', type: 'select', options: ['Libro de Investigación', 'Libro de Texto', 'Libro de Ensayo'] },
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

    // Validación de autores totales vs registrados
    if (metadata.autores_totales) {
      const totalDeclarado = Number(metadata.autores_totales);
      const totalRegistrados = authors.length;

      if (totalRegistrados < totalDeclarado) {
        return alert(`Debe registrar los otros autores. Ha declarado ${totalDeclarado} autores pero solo ha registrado ${totalRegistrados} en la sección de Coautores.`);
      }
      
      if (totalRegistrados > totalDeclarado) {
        return alert(`El número de autores registrados (${totalRegistrados}) excede el total declarado (${totalDeclarado}). Por favor ajuste el campo 'Número Total de Autores'.`);
      }
    }

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
    if (!product) return;

    console.log('Abriendo modal CIARP para:', product.title);
    setSelectedProduct(product);
    setLegalAccepted(false);

    try {
      const calculatedPoints = getProductPoints(product, product.metadata || {});
      setPuntosSolicitados(isNaN(calculatedPoints) ? 0 : calculatedPoints);
    } catch (e) {
      console.error('Error calculando puntos:', e);
      setPuntosSolicitados(0);
    }

    setTipoReconocimiento('Puntos Salariales');
    setEvidencias([]);
    setShowCiarpModal(true);
  };
  const submitCiarpRequest = async () => {
    if (!legalAccepted) return alert('Debe aceptar la declaratoria de integridad y ética para continuar.');
    if (puntosSolicitados < 0) return alert('Los puntos solicitados deben ser un número válido.');

    const config = productTypes.find(t => t.name === selectedProduct?.type);

    if (config?.requiredEvidences) {
      for (const req of config.requiredEvidences) {
        if (!evidencias.some(e => e.description === req)) {
          return alert(`Debe adjuntar el soporte obligatorio: ${req}`);
        }
      }
    } else {
      if (evidencias.length === 0) return alert('Debe adjuntar al menos 1 archivo PDF como evidencia.');
      if (evidencias.some(e => !e.description.trim())) return alert('Por favor escriba una descripción para todos los archivos PDF cargados.');
    }

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

  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setTitle(product.title);
    setCategory(product.category);
    setType(product.type);
    setUniqueId(product.uniqueId || '');
    setMetadata(product.metadata || {});
    setAuthors(product.authors || []);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { title, category, type, uniqueId, metadata, authors };
      await api.patch(`/products/${editingProduct._id}`, payload);
      alert('Producto actualizado con éxito.');
      setShowEditModal(false);
      // Reset
      setTitle(''); setUniqueId(''); setMetadata({}); setAuthors([{ user: user?.id, name: user?.name, isExternal: false }]);
      fetchProducts();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al actualizar el producto.');
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
                  <div className="card flex-1" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                    <GraduationCap size={20} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} strokeWidth={1.5} />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Títulos</h4>
                    <p style={{ fontSize: '1.875rem', fontWeight: 300, color: '#065f46' }}>{results.ptsTitulos} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>pts</span></p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '1rem', lineHeight: 1.2 }}>Acumulado permanente</p>
                  </div>
                  <div className="card flex-1" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                    <TrendingUp size={20} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} strokeWidth={1.5} />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Experiencia</h4>
                    <p style={{ fontSize: '1.875rem', fontWeight: 300, color: '#065f46' }}>{results.ptsExp} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>pts</span></p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '1rem', lineHeight: 1.2 }}>Acumulado permanente</p>
                  </div>
                  <div className="card flex-1" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                    <Award size={20} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} strokeWidth={1.5} />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tránsito</h4>
                    <p style={{ fontSize: '1.875rem', fontWeight: 300, color: '#b45309' }}>{results.totalTransito} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>pts</span></p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '1rem', lineHeight: 1.2 }}>Pendientes por CIARP</p>
                  </div>
                  <div className="card flex-1" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                    <BookOpen size={20} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} strokeWidth={1.5} />
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
                {/* Smart Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 p-6 bg-white border-b border-slate-100">
                  <div
                    className="flex-1 flex items-center gap-3 shadow-sm bg-white"
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '0 12px',
                      height: '36px'
                    }}
                  >
                    <Search size={14} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre de producto, tipo o estado..."
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
                        className="shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tight transition-all active:scale-95"
                        style={{
                          backgroundColor: showColumnMenu ? '#f8fafc' : '#ffffff',
                          color: showColumnMenu ? '#0f172a' : '#64748b',
                          border: showColumnMenu ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '0 16px',
                          fontSize: '9.5px',
                          height: '36px',
                          minWidth: '120px'
                        }}
                        onClick={() => setShowColumnMenu(!showColumnMenu)}
                      >
                        <Settings2 size={13} className={showColumnMenu ? 'text-primary-600' : ''} />
                        <span>Columnas</span>
                        <ChevronDown size={11} className={`transition-transform duration-200 ${showColumnMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {showColumnMenu && (
                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                                <Settings2 size={14} />
                              </div>
                              <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest leading-none">Configurar Vista</span>
                            </div>
                            <button onClick={() => setShowColumnMenu(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                              <X size={14} />
                            </button>
                          </div>

                          <div className="p-2 space-y-1">
                            {[
                              { id: 'tipo', label: 'Tipo de Producto' },
                              { id: 'nombre', label: 'Nombre del Producto' },
                              { id: 'anio', label: 'Año de Realización' },
                              { id: 'radicacion', label: 'Fecha Radicación' },
                              { id: 'participacion', label: 'Coautores / Participación' },
                              { id: 'ciarp', label: 'Estado en CIARP' },
                              { id: 'acciones', label: 'Botones / Acciones' }
                            ].map(col => (
                              <label key={col.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50/50 rounded-xl cursor-pointer transition-all group relative overflow-hidden">
                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${visibleColumns[col.id as keyof typeof visibleColumns] ? 'text-slate-800' : 'text-slate-400'}`}>
                                  {col.label}
                                </span>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={visibleColumns[col.id as keyof typeof visibleColumns]}
                                  onChange={() => setVisibleColumns(prev => ({ ...prev, [col.id]: !prev[col.id as keyof typeof prev] }))}
                                />
                                <div className={`p-1.5 rounded-lg transition-all duration-300 ${visibleColumns[col.id as keyof typeof visibleColumns] ? 'text-emerald-600 bg-emerald-100 shadow-sm shadow-emerald-200/50 scale-110' : 'text-slate-300 bg-slate-100'}`}>
                                  {visibleColumns[col.id as keyof typeof visibleColumns] ? <Eye size={14} /> : <EyeOff size={14} />}
                                </div>
                              </label>
                            ))}
                          </div>

                          <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100">
                            <p className="text-[9px] text-slate-400 font-bold italic leading-tight uppercase tracking-tighter text-center">
                              Seleccione los campos a visualizar en su tabla.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      className="shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tight transition-colors"
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
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.color = '#047857'; e.currentTarget.style.borderColor = '#dcfce7'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      onClick={() => {
                        const headers = ["Tipo", "Nombre del Producto", "Año", "Radicación", "Estado CIARP"];
                        const rows = products.map(p => [
                          p.type,
                          p.title,
                          p.metadata?.anio || p.metadata?.año || '-',
                          new Date(p.createdAt).toLocaleDateString(),
                          p.status
                        ]);
                        const csvContent = "data:text/csv;charset=utf-8,"
                          + headers.join(",") + "\n"
                          + rows.map(e => e.join(",")).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `Produccion_Docente_${user?.name?.replace(/ /g, '_')}.csv`);
                        document.body.appendChild(link);
                        link.click();
                      }}
                    >
                      <Download size={13} className="text-emerald-600" />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        {visibleColumns.tipo && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest" style={{ fontSize: '11px' }}>Tipo</th>}
                        {visibleColumns.nombre && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest w-1/3" style={{ fontSize: '11px' }}>Nombre del Producto</th>}
                        {visibleColumns.anio && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center" style={{ fontSize: '11px' }}>Año</th>}
                        {visibleColumns.radicacion && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center" style={{ fontSize: '11px' }}>Radicación</th>}
                        {visibleColumns.participacion && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center" style={{ fontSize: '11px' }}>Participación</th>}
                        {visibleColumns.ciarp && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center" style={{ fontSize: '11px' }}>Estado CIARP</th>}
                        {visibleColumns.acciones && <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center" style={{ fontSize: '11px' }}>Acciones</th>}
                      </tr>
                      {/* Filter Row */}
                      <tr className="bg-white/50 border-b border-slate-100/50" style={{ borderBottom: '1px solid #e2e8f0' }}>
                        {visibleColumns.tipo && (
                          <th className="px-4 py-2">
                            <select
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-500 outline-none transition-all placeholder:text-slate-200"
                              style={{ fontSize: '11px', height: '28px' }}
                              value={filterType}
                              onChange={e => setFilterType(e.target.value)}
                            >
                              <option value="">Tipo...</option>
                              <option value="Artículo">Artículos</option>
                              <option value="Libro">Libros</option>
                              <option value="Software">Software</option>
                              <option value="Título">Títulos</option>
                            </select>
                          </th>
                        )}
                        {visibleColumns.nombre && (
                          <th className="px-4 py-2">
                            <input
                              type="text"
                              placeholder="Filtrar nombre..."
                              className="w-full font-medium text-slate-500 outline-none transition-all placeholder:text-slate-300 border border-slate-200 rounded px-2 py-1"
                              style={{ fontSize: '11px', height: '28px' }}
                              value={filterTitle}
                              onChange={e => setFilterTitle(e.target.value)}
                            />
                          </th>
                        )}
                        {visibleColumns.anio && (
                          <th className="px-4 py-2">
                            <input
                              type="text"
                              placeholder="Filtro año..."
                              className="w-full font-medium text-slate-500 outline-none transition-all placeholder:text-slate-400 border border-slate-200 rounded px-2 py-1"
                              style={{ fontSize: '11px', height: '28px' }}
                              value={filterAnio}
                              onChange={e => setFilterAnio(e.target.value)}
                            />
                          </th>
                        )}
                        {visibleColumns.radicacion && (
                          <th className="px-4 py-2">
                            <input
                              type="text"
                              placeholder="Filtro fecha..."
                              className="w-full font-medium text-slate-500 outline-none transition-all placeholder:text-slate-400 border border-slate-200 rounded px-2 py-1"
                              style={{ fontSize: '11px', height: '28px' }}
                              value={filterRadicacion}
                              onChange={e => setFilterRadicacion(e.target.value)}
                            />
                          </th>
                        )}
                        {visibleColumns.participacion && <th className="px-4 py-2"></th>}
                        {visibleColumns.ciarp && (
                          <th className="px-4 py-2">
                            <select
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-500 outline-none transition-all"
                              style={{ fontSize: '11px', height: '28px' }}
                              value={filterStatus}
                              onChange={e => setFilterStatus(e.target.value)}
                            >
                              <option value="">Estado...</option>
                              <option value="radicado">Radicado</option>
                              <option value="evaluación">Evaluación</option>
                              <option value="aprobado">Aprobado</option>
                            </select>
                          </th>
                        )}
                        {visibleColumns.acciones && <th className="px-4 py-2"></th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {products.filter(p => {
                        const searchLower = searchTerm.toLowerCase();
                        const matchSearch = p.title.toLowerCase().includes(searchLower) ||
                          p.type.toLowerCase().includes(searchLower) ||
                          p.status.toLowerCase().includes(searchLower) ||
                          (p.category && p.category.toLowerCase().includes(searchLower));

                        const matchType = filterType ? p.type.toLowerCase().includes(filterType.toLowerCase()) : true;
                        const matchTitle = filterTitle ? p.title.toLowerCase().includes(filterTitle.toLowerCase()) : true;
                        const matchStatus = filterStatus ? p.status.toLowerCase().includes(filterStatus.toLowerCase()) : true;
                        const productAnio = (p.metadata?.anio || p.metadata?.año || '-').toString();
                        const matchAnio = filterAnio ? productAnio.toLowerCase().includes(filterAnio.toLowerCase()) : true;
                        const radDate = new Date(p.createdAt);
                        const dateStr = radDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
                        const matchRad = filterRadicacion ? dateStr.toLowerCase().includes(filterRadicacion.toLowerCase()) : true;

                        return matchSearch && matchType && matchTitle && matchStatus && matchAnio && matchRad;
                      }).map(p => {
                        const radDate = new Date(p.createdAt);
                        const dateStr = radDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

                        return (
                          <tr
                            key={p._id}
                            className="transition-all duration-200 text-slate-700"
                            style={{ fontSize: '11px', cursor: 'default' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(236, 253, 245, 0.4)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {visibleColumns.tipo && (
                              <td className="px-6 py-4" style={{ borderBottom: '1px solid #dcfce7' }}>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] font-bold uppercase tracking-wider border border-slate-200">
                                  {p.type}
                                </span>
                              </td>
                            )}
                            {visibleColumns.nombre && (
                              <td className="px-6 py-4" style={{ borderBottom: '1px solid #dcfce7' }}>
                                <div className="font-black text-slate-800 uppercase tracking-tight leading-tight" style={{ fontSize: '12px' }}>{p.title}</div>
                              </td>
                            )}
                            {visibleColumns.anio && (
                              <td className="px-6 py-4 text-center text-slate-600 font-bold" style={{ borderBottom: '1px solid #dcfce7' }}>
                                {p.metadata?.anio || p.metadata?.año || '-'}
                              </td>
                            )}
                            {visibleColumns.radicacion && (
                              <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap" style={{ borderBottom: '1px solid #dcfce7' }}>
                                {dateStr}
                              </td>
                            )}
                            {visibleColumns.participacion && (
                              <td className="px-6 py-4 text-center" style={{ borderBottom: '1px solid #dcfce7' }}>
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 text-primary-700 rounded-md font-bold uppercase tracking-tighter">
                                  <Users size={10} />
                                  {p.authors?.length || 1} AUTORES
                                </div>
                              </td>
                            )}
                            {visibleColumns.ciarp && (
                              <td className="px-6 py-4 text-center" style={{ borderBottom: '1px solid #dcfce7' }}>
                                {(user?.role === 'docente' || user?.role === 'admin' || user?.tipoContrato) ? (
                                  <>
                                    {p.status === 'radicado' || p.status === 'borrador' ? (
                                      <button
                                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                                        onClick={() => handleOpenCiarpModal(p)}
                                      >
                                        Enviar a CIARP
                                      </button>
                                    ) : (
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px] border
                                         ${p.status.includes('aprobado') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                          p.status.includes('evaluación') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-rose-50 text-rose-600 border-rose-100'}`}
                                      >
                                        {p.status.includes('aprobado') && <Award size={11} />}
                                        {p.status.includes('evaluación') && <Clock size={11} />}
                                        {p.status.includes('rechazado') && <AlertTriangle size={11} />}
                                        {p.status.replace('_', ' ').replace('ciarp', '')}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-300 italic text-[9px]">N/A</span>
                                )}
                              </td>
                            )}
                            {visibleColumns.acciones && (
                              <td className="px-6 py-4 text-center" style={{ borderBottom: '1px solid #dcfce7' }}>
                                <div className="flex justify-center gap-2">
                                  {(p.status === 'radicado' || p.status === 'borrador') ? (
                                    <>
                                      <button
                                        onClick={() => handleOpenEditModal(p)}
                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-100"
                                        title="Editar registro"
                                      >
                                        <Edit2 size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteProduct(p._id)}
                                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                        title="Eliminar registro"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="p-1.5 text-slate-200 cursor-not-allowed">
                                      <X size={13} />
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}

                      {products.length > 0 && products.filter(p => {
                        const searchLower = searchTerm.toLowerCase();
                        const matchSearch = p.title.toLowerCase().includes(searchLower) || p.type.toLowerCase().includes(searchLower);
                        const matchType = filterType ? p.type.toLowerCase().includes(filterType.toLowerCase()) : true;
                        const matchTitle = filterTitle ? p.title.toLowerCase().includes(filterTitle.toLowerCase()) : true;
                        const matchStatus = filterStatus ? p.status.toLowerCase().includes(filterStatus.toLowerCase()) : true;
                        return matchSearch && matchType && matchTitle && matchStatus;
                      }).length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-20 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p className="font-bold">No se encontraron registros</p>
                                <p className="text-xs">Intenta ajustar los términos de búsqueda.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50/50 p-6 flex justify-between items-center border-t border-slate-100">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                    Total: <span className="text-slate-800 font-bold">{products.length} registros</span>
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
                                Verificar URL
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
                  
                  {metadata.autores_totales && Number(metadata.autores_totales) !== authors.length && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-xs font-bold">
                      <AlertTriangle size={16} /> 
                      Atención: Debe registrar los otros autores. Ha declarado {metadata.autores_totales} totales (Actual: {authors.length})
                    </div>
                  )}

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
      {showCiarpModal && selectedProduct && (() => {
        const config = productTypes.find(t => t.name === selectedProduct.type);
        return createPortal(
          <div className="modal-backdrop" style={{ zIndex: 9999 }}>
            <div className="card w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white p-8 shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-4 mb-6 sticky top-0 bg-white z-10">
              <h3 className="font-extrabold text-2xl text-primary-900 flex items-center gap-2">
                <FileSignature className="text-primary-500" size={24} /> Radicación Oficial ante el CIARP
              </h3>
              <button
                onClick={() => setShowCiarpModal(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Resumen del Producto */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left">
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">
                  {selectedProduct.type}
                </span>
                <h4 className="text-xl font-bold text-slate-800 mb-1">{selectedProduct.title}</h4>
                <div className="flex gap-4 text-xs text-slate-500 font-medium">
                  <span>ID: {selectedProduct.uniqueId}</span>
                  <span>•</span>
                  <span>Registrado el {new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Formulario de Radicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2 tracking-wider">Tipo de Reconocimiento Solicitado</label>
                    <select
                      className="form-input w-full"
                      value={tipoReconocimiento}
                      onChange={e => setTipoReconocimiento(e.target.value as any)}
                    >
                      <option value="Puntos Salariales">Puntos Salariales (Permanente)</option>
                      <option value="Bonificación">Bonificación (No constitutiva)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2 tracking-wider">Proyección de Puntos</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        className="form-input w-full pl-10 font-bold text-lg"
                        value={puntosSolicitados}
                        onChange={e => setPuntosSolicitados(Number(e.target.value))}
                      />
                      <TrendingUp size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">* Valor estimado según la tipología del producto y el Decreto 1279.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2 tracking-wider">Soportes y Evidencias (PDF)</label>
                  <div className="space-y-3">
                    {config?.requiredEvidences ? (
                      config.requiredEvidences.map((reqName) => {
                        const uploaded = evidencias.find(e => e.description === reqName);
                        return (
                          <div key={reqName}>
                            {uploaded ? (
                              <div className="flex items-center gap-3 p-3 bg-white border border-emerald-200 rounded-xl shadow-sm">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{reqName}</p>
                                  <p className="text-xs font-bold text-slate-700 truncate">{uploaded.file.name}</p>
                                  <p className="text-[10px] text-slate-400">{(uploaded.file.size / 1024).toFixed(0)} KB</p>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => setEvidencias(evidencias.filter(e => e.description !== reqName))}
                                  className="text-gray-400 hover:text-rose-500 p-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ) : (
                              <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all text-slate-400 bg-gray-50/50">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={e => {
                                    if (e.target.files?.[0]) {
                                      setEvidencias([...evidencias, { file: e.target.files[0], description: reqName }]);
                                    }
                                  }}
                                />
                                <Plus size={20} className="text-primary-400" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Cargar {reqName}</span>
                              </label>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <>
                        {evidencias.map((ev, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm">
                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
                              <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-xs font-bold text-slate-700 truncate">{ev.file.name}</p>
                              <p className="text-[10px] text-slate-400">{(ev.file.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setEvidencias(evidencias.filter((_, idx) => idx !== i))}
                              className="text-rose-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        {evidencias.length < 3 && (
                          <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all text-slate-400">
                            <input
                              type="file"
                              accept=".pdf"
                              multiple
                              className="hidden"
                              onChange={e => {
                                if (e.target.files) {
                                  const filesArray = Array.from(e.target.files);
                                  if (evidencias.length + filesArray.length > 3) {
                                    alert('Máximo 3 archivos');
                                  } else {
                                    setEvidencias([...evidencias, ...filesArray.map(f => ({ file: f, description: '' }))]);
                                  }
                                }
                              }}
                            />
                            <Plus size={20} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Adjuntar Soporte</span>
                          </label>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Declaración de Responsabilidad */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={legalAccepted}
                    onChange={e => setLegalAccepted(e.target.checked)}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-1">Declaración de Responsabilidad Ética</p>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      "Certifico que la información y soportes suministrados son verídicos. Conozco las implicaciones legales del Decreto 1279 de 2002 sobre propiedad intelectual y radicación de productos académicos."
                    </p>
                  </div>
                </label>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  className="btn bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200 px-8 font-bold"
                  onClick={() => setShowCiarpModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`btn px-10 shadow-lg font-bold ${legalAccepted && evidencias.length > 0 ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  onClick={submitCiarpRequest}
                  disabled={!legalAccepted || evidencias.length === 0}
                >
                  Confirmar Radicación Oficial
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
        );
      })()}


      {/* MODAL DE EDICIÓN DE PRODUCTO */}
      {showEditModal && editingProduct && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="card w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white p-8 shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-4 mb-6 sticky top-0 bg-white z-10">
              <h3 className="font-extrabold text-2xl text-primary-900 flex items-center">
                <Edit2 className="mr-3 text-primary-500" size={24} /> Actualizar Producto Registrado
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  setTitle(''); setUniqueId(''); setMetadata({}); setAuthors([{ user: user?.id, name: user?.name, isExternal: false }]);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
              {/* Reutilización de la lógica del formulario oficial */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
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

              <section className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left text-sm">
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">
                    {type === 'Categoría Docente' ? 'Nombre de la Solicitud' :
                      type === 'Experiencia Calificada' ? 'Entidad / Institución' :
                        `Título Oficial del ${type}`}
                  </label>
                  <input type="text" className="form-input w-full" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">{currentTypeConfig?.idType || 'Identificador'}</label>
                  <input type="text" className="form-input w-full md:w-1/2" value={uniqueId} onChange={e => setUniqueId(e.target.value)} />
                </div>

                {currentTypeConfig && currentTypeConfig.meta.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-6 mt-6">
                    {currentTypeConfig.meta.map(field => (
                      <div key={field.key}>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{field.label}</label>
                        {field.type === 'select' ? (
                          <select className="form-input w-full text-sm" value={metadata[field.key] || ''} onChange={e => handleDynamicChange(field.key, e.target.value)}>
                            <option value="">-- Seleccionar --</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} className="form-input w-full text-sm" value={metadata[field.key] || ''} onChange={e => handleDynamicChange(field.key, e.target.value)} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Seccion Coautores */}
              <section className="text-left">
                <h4 className="flex items-center text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                  <UserPlus size={20} className="mr-2 text-primary-500" /> Coautores y Participantes
                </h4>
                <div className="flex gap-2 mb-4 relative max-w-xl">
                  <input
                    type="text"
                    className="form-input flex-1 text-sm"
                    placeholder="Buscar docente o digitar nombre externo..."
                    value={searchDocente}
                    onChange={e => setSearchDocente(e.target.value)}
                  />
                  <button type="button" className="btn btn-outline" onClick={handleAddExternalUser}>Añadir Externo</button>
                  {searchDocente.trim().length > 2 && (
                    <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {availableUsers.filter(u => u.name.toLowerCase().includes(searchDocente.toLowerCase())).map(u => (
                        <div key={u._id} className="p-3 hover:bg-gray-50 cursor-pointer border-b text-sm" onClick={() => handleAddAuthor(u)}>
                          <span className="font-bold text-gray-800 block">{u.name}</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs uppercase font-bold tracking-tight">
                    <thead className="bg-gray-50 text-gray-500 border-b">
                      <tr>
                        <th className="p-3">Nombre Completo</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3 text-right text-rose-500">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 normal-case font-normal text-sm">
                      {authors.map((a, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3 font-medium text-gray-800">{a.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${a.isExternal ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {a.isExternal ? 'Externo' : 'Unisucre'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {a.user !== user?.id && (
                              <button type="button" onClick={() => removeAuthor(idx)} className="text-rose-400 hover:text-rose-600 p-1">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white z-10 mt-6">
                <button
                  type="button"
                  className="btn bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200 px-8"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    setTitle(''); setUniqueId(''); setMetadata({}); setAuthors([{ user: user?.id, name: user?.name, isExternal: false }]);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary px-10 shadow-lg font-bold">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
