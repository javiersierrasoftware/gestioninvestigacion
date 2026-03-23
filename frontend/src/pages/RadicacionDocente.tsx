import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { FileText, Calendar, DollarSign, Search, CheckCircle, ArrowRight, X, Save, Send, Download, CheckSquare, Plus, Edit2, Trash2, Users, Activity, Award, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DynamicField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  helpText: string;
  placeholder: string;
  options?: string[];
  columns?: string[];
}

interface Convocatoria {
  _id: string;
  number: string;
  title: string;
  year: number;
  directedTo: string;
  budgetPerProject: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  dynamicFields: DynamicField[];
}

interface Project {
  _id: string;
  title: string;
  summary: string;
  executionMonths: number;
  status: 'borrador' | 'radicado' | 'en_revision' | 'aprobado' | 'rechazado';
  convocatoria: Convocatoria;
  investigadorPrincipal?: string;
  teamMembers: any[];
  dynamicResponses: Record<string, any>;
  group?: string;
  participatingGroups?: string[];
  resolutionComments?: string;
  createdAt?: string;
}

interface ExternalUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  identificationNumber?: string;
}

export const RadicacionDocente = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'convocatorias' | 'mis-proyectos'>('convocatorias');
  const [misProyectos, setMisProyectos] = useState<Project[]>([]);

  // Application Form State
  const [selectedConvo, setSelectedConvo] = useState<Convocatoria | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [executionMonths, setExecutionMonths] = useState(0);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projectGroup, setProjectGroup] = useState('');
  const [participatingGroups, setParticipatingGroups] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [dynamicResponses, setDynamicResponses] = useState<Record<string, any>>({});

  // Platform Users (For selection)
  const [availableUsers, setAvailableUsers] = useState<ExternalUser[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>({
    user: '', name: '', identificationNumber: '', role: 'Investigador Principal', hoursPerMonth: 0, hourlyRate: 0, months: 0, isContrapartida: false
  });

  // Wizard state
  const [formStep, setFormStep] = useState<'general' | 'personal' | 'formulario' | 'cronograma' | 'validar'>('general');
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { token, user } = useAuth();

  useEffect(() => {
    fetchConvocatorias();
    fetchMisProyectos();
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAvailableGroups(await res.json());
    } catch (e) { console.error(e); }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAvailableUsers(await res.json());
    } catch (e) { console.error(e); }
  }

  const fetchConvocatorias = async () => {
    try {
      const res = await fetch(`${API_URL}/convocatorias`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data: Convocatoria[] = await res.json();
        // Keep all convocatorias so drafts can find their metadata
        setConvocatorias(data);
      }
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMisProyectos = async () => {
    try {
      const res = await fetch(`${API_URL}/projects/my-projects`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        // Ordenar por fecha de creación descendente (los últimos arriba)
        const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMisProyectos(sorted);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este borrador? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMisProyectos();
      } else {
        alert('Error al eliminar el proyecto');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al intentar eliminar el proyecto');
    }
  };

  const handleStartApplication = (convo: Convocatoria) => {
    setSelectedConvo(convo);
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectSummary('');
    setExecutionMonths(0);
    setTeamMembers([{
      user: user?.id,
      name: user?.name,
      role: 'Investigador Principal',
      hoursPerMonth: 0,
      hourlyRate: 0,
      months: 0,
      isContrapartida: false
    }]);
    setProjectGroup('');
    setParticipatingGroups([]);
    setDynamicResponses({});
    setFormStep('general');
    setValidationErrors([]);
    setIsDirty(false);
  };

  const handleEditDraft = (proj: Project) => {
    // Attempt to lookup full metadata (especially dynamicFields) from the list of all convocatorias
    const storeConvo = convocatorias.find(c => c._id === (proj.convocatoria?._id || proj.convocatoria));
    setSelectedConvo(storeConvo || proj.convocatoria);
    setEditingProjectId(proj._id);
    setProjectTitle(proj.title || '');
    setProjectSummary(proj.summary || '');
    setExecutionMonths(proj.executionMonths || 0);
    setTeamMembers(proj.teamMembers || []);
    setProjectGroup(proj.group || '');
    setParticipatingGroups(proj.participatingGroups || []);
    setDynamicResponses(proj.dynamicResponses || {});
    setFormStep('general');
    setValidationErrors([]);
    setIsDirty(false);
  };

  const isGeneralComplete = () => {
    return projectTitle.trim() !== '' && projectSummary.trim() !== '' && executionMonths > 0;
  };

  // Wrapper for step changes with auto-save
  const navigateToStep = async (step: 'general' | 'personal' | 'formulario' | 'cronograma' | 'validar') => {
    if (step !== 'general' && !isGeneralComplete()) {
      alert('Por favor complete la Información General (Título, Meses y Resumen) antes de continuar.');
      return;
    }
    const hasObjTree = selectedConvo?.dynamicFields?.some(f => f.label.toLowerCase().includes('objetivo') && f.type === 'table');
    if (step === 'cronograma' && !hasObjTree) {
      alert('El cronograma requiere que se defina un Árbol de Objetivos en el Formulario Específico.');
      return;
    }
    if (isDirty) {
      alert('Tiene cambios sin guardar. Por favor haga clic en "Guardar Borrador" antes de cambiar de sección.');
      return;
    }
    // Silent auto-save when moving between steps
    if (editingProjectId || projectTitle || projectSummary) {
      await handleSaveData('borrador', true);
    }
    setFormStep(step);
  };

  const handleDynamicChange = (name: string, value: any) => {
    setDynamicResponses(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!projectTitle.trim()) errors.push("El título es obligatorio en la sección 'General'.");
    if (!projectSummary.trim()) errors.push("El resumen es obligatorio en la sección 'General'.");

    if (selectedConvo) {
      selectedConvo.dynamicFields.forEach(f => {
        const response = dynamicResponses[f.name];
        if (f.required) {
          if (!response || (Array.isArray(response) && response.length === 0)) {
            errors.push(`El campo '${f.label}' es obligatorio en la sección 'Formulario'.`);
          } else if (typeof response === 'string' && response.trim() === '') {
            errors.push(`El campo '${f.label}' es obligatorio en la sección 'Formulario'.`);
          } else if (Array.isArray(response) && response.length > 0) {
            // If it's the Problem Tree, ensure at least one 'PROBLEMA' exists
            const isArbol = (f.name.toLowerCase().includes('arbol') || f.label.toLowerCase().includes('árbol')) && !f.label.toLowerCase().includes('objetivo');
            if (isArbol) {
              const hasProblem = response.some((row: any) => row.type === 'PROBLEMA' && row.description?.trim());
              if (!hasProblem) {
                errors.push(`El '${f.label}' requiere al menos un 'Problema Central' definido.`);
              }
            }
            const isObjTree = f.label.toLowerCase().includes('objetivo') && f.type === 'table';
            if (isObjTree) {
              const hasGeneral = response.some((row: any) => row.type === 'OBJETIVO_GENERAL' && row.description?.trim());
              if (!hasGeneral) errors.push("El 'Árbol de Objetivos' requiere un Objetivo General definido.");
            }
          }
        }
      });
      // Validate Cronograma
      const crono = dynamicResponses['cronograma'] || [];
      if (crono.length === 0) errors.push("Debe registrar al menos una actividad en el Cronograma.");
      crono.forEach((act: any, idx: number) => {
        if (!act.description?.trim()) errors.push(`Actividad ${idx + 1}: La descripción es obligatoria.`);
        if (!act.objective) errors.push(`Actividad ${idx + 1}: Debe estar vinculada a un objetivo.`);
        if (act.startMonth > act.endMonth) errors.push(`Actividad ${idx + 1}: El mes de inicio no puede ser mayor al de fin.`);
      });
    }
    setValidationErrors(errors);
    return errors.length === 0;
  }

  const handleSaveData = async (statusToSet: 'borrador' | 'radicado', isSilent = false, customMembers?: any[], customGroups?: string[]) => {
    if (!selectedConvo) return;

    if (statusToSet === 'radicado') {
      const isValid = validateForm();
      if (!isValid) {
        setFormStep('validar'); // Move to validation screen to show errors
        return;
      }
    }

    if (!isSilent) setSubmitting(true);

    try {
      const payload = {
        title: projectTitle,
        summary: projectSummary,
        executionMonths: executionMonths,
        teamMembers: customMembers || teamMembers,
        convocatoria: selectedConvo._id,
        dynamicResponses: dynamicResponses,
        status: statusToSet,
        group: projectGroup, // Ensure group is included in payload
        participatingGroups: customGroups || participatingGroups
      };

      const url = editingProjectId ? `${API_URL}/projects/${editingProjectId}` : `${API_URL}/projects`;
      const method = editingProjectId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedProject = await res.json();
        setEditingProjectId(savedProject._id); // Update ID in case it was a new draft
        setIsDirty(false);

        if (!isSilent) {
          if (statusToSet === 'radicado') {
            alert('¡Proyecto Radicado Exitosamente!');
            setSelectedConvo(null);
            setActiveTab('mis-proyectos');
          } else {
            alert('Borrador guardado correctamente.');
          }
        }
        fetchMisProyectos();
      } else {
        if (!isSilent) alert('Error al procesar la solicitud.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const generateApprovalLetter = (proj: Project) => {
    const doc = new jsPDF();
    let yPos = 20;

    // 1. Official University Header
    doc.setFillColor(50, 150, 93); // University Green
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSIDAD DE SUCRE', 105, 18, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('DIVISIÓN DE INVESTIGACIÓN', 105, 26, { align: 'center' });
    doc.text('CARTA OFICIAL DE APROBACIÓN', 105, 33, { align: 'center' });

    yPos = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');

    // Date
    const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Sincelejo, ${today}`, 14, yPos);
    yPos += 15;

    // Lookup references
    const piUser = availableUsers.find(u => u._id === proj.investigadorPrincipal);
    const piName = piUser ? piUser.name : (proj.investigadorPrincipal || user?.name || 'Docente Investigador');
    const piEmail = piUser ? piUser.email : (user?.email || '');
    const mainGroup = availableGroups.find(g => g._id === proj.group);

    doc.setFont('helvetica', 'normal');
    doc.text(`Señor(a):`, 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`${piName.toUpperCase()}`, 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Investigador Principal`, 14, yPos);
    yPos += 6;
    doc.text(`Correo Electrónico: ${piEmail}`, 14, yPos);
    if (mainGroup) {
      yPos += 6;
      doc.text(`Grupo de Investigación: ${mainGroup.name}`, 14, yPos);
    }

    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`Asunto: Dictamen Favorable de Aprobación de Proyecto de Investigación.`, 14, yPos);

    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const bodyText = `Respetado Investigador,\n\nLa División de Investigación de la Universidad de Sucre le informa de manera oficial que, una vez culminado el proceso de revisión y evaluación por pares académicos ciegos, su propuesta adscrita a los términos de referencia de la Convocatoria " ${proj.convocatoria?.title} (${proj.convocatoria?.year}) " ha sido APROBADA.`;
    const splitBody = doc.splitTextToSize(bodyText, 182);
    doc.text(splitBody, 14, yPos);
    yPos += (splitBody.length * 6) + 5;

    // Summary Box
    doc.setFillColor(245, 245, 245);
    doc.rect(14, yPos, 182, 35, 'F');

    doc.setFontSize(10);
    autoTable(doc, {
      startY: yPos + 5,
      body: [
        ['TÍTULO REGISTRADO:', proj.title.toUpperCase()],
        ['CONVOCATORIA:', `${proj.convocatoria?.number || 'S/N'} - ${proj.convocatoria?.title}`],
        ['DURACIÓN AUTORIZADA:', `${proj.executionMonths} meses`]
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2, fillColor: [245, 245, 245] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (proj.resolutionComments) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Observaciones de la Resolución Institucional:`, 14, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      const splitObs = doc.splitTextToSize(`"${proj.resolutionComments}"`, 182);
      doc.text(splitObs, 14, yPos);
      yPos += (splitObs.length * 5) + 10;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const finalCopy = `Con esta resolución, el proyecto queda amparado bajo la normativa investigativa actual y se autoriza el inicio de su fase de ejecución. Para dar cumplimiento a sus actividades contractuales y programáticas exigidas por la Convocatoria, le solicitamos permanecer atento a los canales virtuales.\n\nFelicidades por su contribución al tejido investigativo de la universidad.`;
    const splitFinal = doc.splitTextToSize(finalCopy, 182);
    doc.text(splitFinal, 14, yPos);

    yPos += (splitFinal.length * 5) + 30;

    doc.setFont('helvetica', 'bold');
    doc.text(`_____________________________________`, 14, yPos);
    yPos += 6;
    doc.text(`Jefatura - División de Investigación`, 14, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Universidad de Sucre`, 14, yPos);

    // Watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(50);
    doc.text('DOCUMENTO OFICIAL', 105, 150, { angle: 100, align: 'center', opacity: 0.1 } as any);

    window.open(doc.output('bloburl'), '_blank');
  };

  const generatePDF = (proj: Project) => {
    if (proj.status === 'aprobado') {
      return generateApprovalLetter(proj);
    }

    const doc = new jsPDF();
    let yPos = 20;

    // 1. Official University Header
    doc.setFillColor(50, 150, 93); // University Green
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSIDAD DE SUCRE', 105, 18, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('DIVISIÓN DE INVESTIGACIÓN', 105, 26, { align: 'center' });
    doc.text('VICERRECTORÍA DE INVESTIGACIÓN', 105, 33, { align: 'center' });

    yPos = 55;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMATO OFICIAL DE RADICACIÓN DE PROYECTO', 105, yPos, { align: 'center' });

    // Lookup references
    const piUser = availableUsers.find(u => u._id === proj.investigadorPrincipal);
    const piName = piUser ? piUser.name : (proj.investigadorPrincipal || user?.name || 'No asignado');
    const piEmail = piUser ? piUser.email : (user?.email || '');
    const mainGroup = availableGroups.find(g => g._id === proj.group);

    // 2. Project Metadata Table
    autoTable(doc, {
      startY: yPos,
      body: [
        ['TÍTULO DEL PROYECTO', proj.title.toUpperCase()],
        ['CONVOCATORIA', `${proj.convocatoria?.number} - ${proj.convocatoria?.title}`],
        ['GRUPO DE INVESTIGACIÓN', mainGroup?.name?.toUpperCase() || 'NO ASIGNADO'],
        ['INVESTIGADOR PRINCIPAL', `${piName.toUpperCase()} (${piEmail})`],
        ['DURACIÓN ESTIMADA', `${proj.executionMonths} meses`],
        ['ESTADO ACTUAL', proj.status.toUpperCase()],
        ['FECHA DE GENERACIÓN', new Date().toLocaleString()]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 50 } }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // 3. Project Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitSummary = doc.splitTextToSize(proj.summary || 'Sin resumen registrado.', 180);
    doc.text(splitSummary, 14, yPos);
    yPos += (splitSummary.length * 5) + 15;

    // 4. Personnel Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONAL VINCULADO', 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['CATEGORÍA / NOMBRE', 'IDENTIFICACIÓN', 'DEDICACIÓN', 'COSTO ESTIMADO']],
      body: (proj.teamMembers || []).map(m => [
        `${m.role.toUpperCase()}: ${m.name || 'Personal Externo'}`,
        m.identificationNumber || 'N/A',
        `${m.hoursPerMonth}h/m x ${m.months}m`,
        `$${(m.hoursPerMonth * m.hourlyRate * m.months).toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [50, 150, 93], fontSize: 9 },
      styles: { fontSize: 8 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;

    // 4.5. Participating Groups (Adicionales)
    if (proj.participatingGroups && proj.participatingGroups.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('GRUPOS DE INVESTIGACIÓN COLABORADORES (ALIADOS)', 14, yPos);
      yPos += 6;

      const groupNames = proj.participatingGroups.map(gid => {
        const g = availableGroups.find(x => x._id === gid);
        return [g?.name || 'Grupo Aliado'];
      });

      autoTable(doc, {
        startY: yPos,
        body: groupNames,
        theme: 'plain',
        styles: { fontSize: 8.5 }
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      yPos += 10;
    }

    // 5. Dynamic Fields / Formulario Específico
    if (proj.dynamicResponses && proj.convocatoria?.dynamicFields) {
      doc.addPage();
      yPos = 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 150, 93);
      doc.text('CONTENIDO ESPECÍFICO DE LA PROPUESTA', 105, yPos, { align: 'center' });
      yPos += 12;

      Object.entries(proj.dynamicResponses).forEach(([key, value]) => {
        const field = proj.convocatoria.dynamicFields.find(f => f.name === key);
        if (!field) return;

        if (yPos > 240) { doc.addPage(); yPos = 20; }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(field.label.toUpperCase(), 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        if (Array.isArray(value)) {
          const padArray = (arr: string[]) => {
            const res = ['', '', ''];
            arr.forEach((v, i) => { if (i < 3) res[i] = v; });
            return res;
          };

          const isArbol = key.toLowerCase().includes('arbol') || field.label.toLowerCase().includes('árbol') || field.label.toLowerCase().includes('arbol');

          if (isArbol && value.length > 0) {
            // ... (keep existing problem tree logic)
            const keys = Object.keys(value[0]);
            const typeKey = keys.find(k => k.toLowerCase().includes('type') || k.toLowerCase().includes('tipo') || k.toLowerCase().includes('comp')) || keys[0];
            const descKey = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('detalle')) || keys[1] || keys[0];

            const getItemsByStrictKeyword = (kw: string) => value
              .filter((v: any) => String(v[typeKey] || '').toUpperCase().includes(kw.toUpperCase()))
              .map((v: any) => String(v[descKey] || ''))
              .slice(0, 3);

            const directEffects = getItemsByStrictKeyword('EFECTO_DIRECTO');
            const indirectEffects = getItemsByStrictKeyword('EFECTO_INDIRECTO');
            const problems = getItemsByStrictKeyword('PROBLEMA');
            const directCauses = getItemsByStrictKeyword('CAUSA_DIRECTA');
            const indirectCauses = getItemsByStrictKeyword('CAUSA_INDIRECTA');

            autoTable(doc, {
              startY: yPos,
              body: [
                ['EFECTOS INDIRECTOS', ...padArray(indirectEffects)],
                ['EFECTOS DIRECTOS', ...padArray(directEffects)],
                ['PROBLEMA CENTRAL', { content: problems[0] || 'No definido', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [248, 252, 248] } }],
                ['CAUSAS DIRECTAS', ...padArray(directCauses)],
                ['CAUSAS INDIRECTAS', ...padArray(indirectCauses)]
              ],
              theme: 'grid',
              styles: { fontSize: 8, cellPadding: 3, lineColor: [200, 200, 200] },
              columnStyles: {
                0: { fontStyle: 'bold', fillColor: [240, 245, 240], cellWidth: 40 },
                1: { cellWidth: 46 }, 2: { cellWidth: 46 }, 3: { cellWidth: 46 }
              }
            });
            yPos = (doc as any).lastAutoTable.finalY + 12;
          } else if (field.label.toLowerCase().includes('objetivo') && field.type === 'table' && value.length > 0) {
            // Objectives Tree logic with padArray now in scope
            const typeKey = Object.keys(value[0] || {}).find(k => k.toLowerCase().includes('type') || k.toLowerCase().includes('tipo')) || 'type';
            const descKey = Object.keys(value[0] || {}).find(k => k.toLowerCase().includes('desc')) || 'description';
            const getItems = (type: string) => value.filter((v: any) => String(v[typeKey]).toUpperCase() === type).map((v: any) => String(v[descKey] || ''));

            autoTable(doc, {
              startY: yPos,
              body: [
                ['FINES INDIRECTOS', ...padArray(getItems('FIN_INDIRECTO'))],
                ['FINES DIRECTOS', ...padArray(getItems('FIN_DIRECTO'))],
                ['OBJETIVO GENERAL', { content: getItems('OBJETIVO_GENERAL')[0] || 'No definido', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [240, 250, 240] } }],
                ['OBJETIVOS ESPECÍFICOS', ...padArray(getItems('OBJETIVO_ESPECIFICO'))],
                ['MEDIOS INDIRECTOS', ...padArray(getItems('MEDIO_INDIRECTO'))]
              ],
              theme: 'grid',
              styles: { fontSize: 8, cellPadding: 3 },
              columnStyles: { 0: { fontStyle: 'bold', fillColor: [240, 245, 240], cellWidth: 40 } }
            });
            yPos = (doc as any).lastAutoTable.finalY + 12;
          } else {
            // Standard Table
            const columns = Object.keys(value[0] || {});
            autoTable(doc, {
              startY: yPos,
              head: [columns.map(c => c.toUpperCase())],
              body: value.map((r: any) => columns.map(c => String(r[c] || ''))),
              theme: 'grid',
              headStyles: { fillColor: [80, 80, 80] },
              styles: { fontSize: 8 }
            });
            yPos = (doc as any).lastAutoTable.finalY + 12;
          }
        } else {
          const textValue = String(value || '');
          const splitText = doc.splitTextToSize(textValue, 182);
          doc.text(splitText, 14, yPos);
          yPos += (splitText.length * 5) + 12;
        }
      });
    }

    // 5.5. Cronograma de Actividades (New Section)
    if (proj.dynamicResponses['cronograma'] && Array.isArray(proj.dynamicResponses['cronograma']) && proj.dynamicResponses['cronograma'].length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; } else { yPos += 10; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 150, 93);
      doc.text('CRONOGRAMA DE ACTIVIDADES', 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['OBJETIVO ASOCIADO', 'ACTIVIDAD / TAREA', 'M. INI', 'M. FIN']],
        body: (proj.dynamicResponses['cronograma'] as any[]).map(act => [
          act.objective?.substring(0, 40) + (act.objective?.length > 40 ? '...' : ''),
          act.description,
          act.startMonth,
          act.endMonth
        ]),
        theme: 'grid',
        headStyles: { fillColor: [50, 150, 93], fontSize: 9 },
        styles: { fontSize: 8 }
      });
      yPos = (doc as any).lastAutoTable.finalY + 12;
    }

    // 6. Footer on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generado por SGDI - Universidad de Sucre | Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

    window.open(doc.output('bloburl'), '_blank');
  };

  const handlePreviewPDF = () => {
    if (!selectedConvo) return;
    const tempProject: Project = {
      _id: editingProjectId || 'new',
      title: projectTitle,
      summary: projectSummary,
      executionMonths: executionMonths,
      status: 'borrador',
      convocatoria: selectedConvo,
      teamMembers: teamMembers,
      dynamicResponses: dynamicResponses,
      group: projectGroup,
      participatingGroups: participatingGroups
    };
    generatePDF(tempProject);
  };

  const addOrUpdateMember = async () => {
    let newMembers;
    if (currentMember.index !== undefined) {
      newMembers = [...teamMembers];
      newMembers[currentMember.index] = { ...currentMember };
    } else {
      newMembers = [...teamMembers, currentMember];
    }
    setTeamMembers(newMembers);
    setShowMemberModal(false);
    setIsDirty(false);
    await handleSaveData('borrador', true, newMembers);
  }

  const removeMember = (idx: number) => {
    if (confirm('¿Eliminar esta persona del proyecto?')) {
      setTeamMembers(teamMembers.filter((_, i) => i !== idx));
      setIsDirty(true);
    }
  }

  const calculateTotalPersonnelCost = () => {
    return teamMembers
      .filter(m => !m.isContrapartida)
      .reduce((acc, m) => acc + (m.hoursPerMonth * m.hourlyRate * m.months), 0);
  }

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return <div className="text-center mt-10 p-6 card">Acceso denegado. Sección solo para docentes.</div>;
  }

  return (
    <div className="animate-fade-in pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Panel del Docente Investigador</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Busca convocatorias abiertas y radica tus propuestas de investigación.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '4px', marginBottom: '48px', borderBottom: '4px solid #059669', width: '100%', position: 'sticky', top: '0', backgroundColor: '#f9fafb', zIndex: 10, paddingTop: '16px' }}>
        <button
          style={{
            minWidth: '250px',
            height: '64px',
            fontSize: '18px',
            fontWeight: '900',
            backgroundColor: activeTab === 'convocatorias' ? '#059669' : '#ecfdf5',
            color: activeTab === 'convocatorias' ? '#ffffff' : '#047857',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: activeTab === 'convocatorias' ? '0 10px 15px -3px rgba(5, 150, 105, 0.3)' : 'none'
          }}
          onClick={() => setActiveTab('convocatorias')}
        >
          <Search size={20} strokeWidth={3} />
          Convocatorias Abiertas
        </button>
        <button
          style={{
            minWidth: '250px',
            height: '64px',
            fontSize: '18px',
            fontWeight: '900',
            backgroundColor: activeTab === 'mis-proyectos' ? '#059669' : '#ecfdf5',
            color: activeTab === 'mis-proyectos' ? '#ffffff' : '#047857',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: activeTab === 'mis-proyectos' ? '0 10px 15px -3px rgba(5, 150, 105, 0.3)' : 'none'
          }}
          onClick={() => setActiveTab('mis-proyectos')}
        >
          <Plus size={20} strokeWidth={3} />
          Mis Proyectos Registrados
          <span style={{
            marginLeft: '8px',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '900',
            backgroundColor: activeTab === 'mis-proyectos' ? '#10b981' : '#d1fae5',
            color: '#ffffff'
          }}>
            {misProyectos.length}
          </span>
        </button>
      </div>

      <div style={{ minHeight: '600px' }}>

        {activeTab === 'convocatorias' && (
          <>
            {loading ? (
              <div className="text-center text-secondary py-10">Cargando convocatorias...</div>
            ) : convocatorias.length === 0 ? (
              <div className="card text-center py-16">
                <div className="flex justify-center mb-4 text-primary-200">
                  <Search size={64} />
                </div>
                <h3 className="heading-3 mb-2">No hay convocatorias abiertas actuales</h3>
                <p className="text-secondary">La División de Investigación aún no ha liberado oportunidades públicas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {convocatorias.filter(c => c.isActive).map((convo) => (
                  <div key={convo._id} className="bg-white rounded-[32px] border border-slate-100 flex flex-col h-full hover:border-emerald-200 transition-all shadow-sm hover:shadow-md overflow-hidden group">
                    <div className="p-8 flex-1">
                      <div style={{ padding: '4px 12px', borderRadius: '9999px', backgroundColor: '#d1fae5', color: '#059669', fontSize: '10px', fontWeight: '900', letterSpacing: '0.05em', border: '1px solid #a7f3d0', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                        <CheckCircle size={12} /> Abierta
                      </div>
                      <h3 className="font-black text-xl mb-4 leading-tight text-slate-800">{convo.title}</h3>
                      <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{convo.description}</p>

                      <div className="space-y-3 mt-auto text-sm">
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <DollarSign size={16} />
                          </div>
                          <span className="font-bold">Financiamiento:</span> ${convo.budgetPerProject.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Calendar size={16} />
                          </div>
                          <span className="font-bold">Cierre:</span> {new Date(convo.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                      <button
                        className="btn btn-primary w-full py-3 rounded-xl font-black shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        onClick={() => handleStartApplication(convo)}
                      >
                        Aplicar / Iniciar Registro <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'mis-proyectos' && (
          <div className="flex flex-col gap-6">
            {misProyectos.length === 0 ? (
              <div className="card text-center py-20 bg-white border border-dashed border-gray-200">
                <FileText size={64} className="mx-auto text-gray-200 mb-4" />
                <p className="text-xl font-bold text-gray-600">No tienes proyectos registrados</p>
                <p className="text-sm text-gray-400 mt-2">Tus borradores y propuestas radicadas aparecerán aquí.</p>
              </div>
            ) : (
              misProyectos.map((proj) => {
                const radDate = new Date(proj.createdAt || new Date()).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });

                let daysLeft = null;
                if (proj.convocatoria?.endDate) {
                  const diff = new Date(proj.convocatoria.endDate).getTime() - new Date().getTime();
                  daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                }

                return (
                  <div key={proj._id} className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
                    {proj.status === 'borrador' && <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-amber-500/10 rotate-45 pointer-events-none"></div>}

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <h4 className="font-black text-2xl text-slate-800 tracking-tight leading-none">{proj.title || 'Propuesta sin Título'}</h4>

                        {proj.status === 'borrador' && (
                          <span style={{ padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: '900', letterSpacing: '0.05em', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
                            Borrador
                          </span>
                        )}
                        {(proj.status === 'radicado' || proj.status === 'en_revision') && (
                          <span style={{ padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#dbeafe', color: '#2563eb', fontSize: '11px', fontWeight: '900', letterSpacing: '0.05em', border: '1px solid #bfdbfe', textTransform: 'uppercase' }}>
                            Radicado
                          </span>
                        )}
                        {proj.status === 'aprobado' && (
                          <span style={{ padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#d1fae5', color: '#059669', fontSize: '11px', fontWeight: '900', letterSpacing: '0.05em', border: '1px solid #a7f3d0', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Award size={12} /> Aprobado
                          </span>
                        )}
                        {proj.status === 'rechazado' && (
                          <span style={{ padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '900', letterSpacing: '0.05em', border: '1px solid #fecaca', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <X size={12} /> No Aprobado
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{proj.summary || 'Esta propuesta aún no tiene un resumen ejecutivo redactado.'}</p>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                          <Calendar size={14} className="text-slate-300" />
                          Creado el: <span className="text-slate-600 font-bold">{radDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                          <Activity size={14} className="text-slate-300" />
                          Convocatoria: <span className="text-slate-600 font-bold">{proj.convocatoria?.title}</span>
                        </div>

                        {daysLeft !== null && proj.status === 'borrador' && (
                          <div className={`flex items-center gap-2 text-xs font-black ${daysLeft < 5 ? 'text-red-500' : 'text-emerald-700'}`}>
                            <Clock size={14} className={daysLeft < 5 ? 'animate-pulse' : ''} />
                            {daysLeft > 0 ? `Cierra en ${daysLeft} día(s)` : 'Convocatoria Cerrada'}
                          </div>
                        )}
                      </div>

                      {(proj.status === 'aprobado' || proj.status === 'rechazado') && proj.resolutionComments && (
                        <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm ring-1 ring-slate-200/50">
                          <h5 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                            <CheckSquare size={16} className="text-emerald-600" />
                            Respuesta de Evaluación
                          </h5>
                          <p className="text-slate-600 italic">"{proj.resolutionComments}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col lg:flex-row gap-2 flex-shrink-0">
                      <button
                        className="flex-1 btn bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                        onClick={() => generatePDF(proj)}
                      >
                        <Download size={16} /> <span className="hidden sm:inline">PDF</span>
                      </button>

                      {proj.status === 'borrador' && (
                        <>
                          <button
                            className="flex-1 btn btn-primary px-5 py-2.5 rounded-xl font-black text-xs shadow-lg hover:shadow-emerald-200 shadow-emerald-500/10 flex items-center justify-center gap-2"
                            onClick={() => handleEditDraft(proj)}
                          >
                            <ArrowRight size={16} /> Editar
                          </button>
                          <button
                            className="btn bg-red-50 text-red-500 hover:bg-red-100 p-2.5 rounded-xl transition-all border border-red-100"
                            title="Eliminar Borrador"
                            onClick={() => handleDeleteProject(proj._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Application Wizard Modal (Estilo Minciencias Sidebar) */}
      {selectedConvo && createPortal(
        <div className="wizard-overlay">
          <div className="wizard-container">

            {/* Wizard Top Navbar */}
            <div className="wizard-header">
              <div className="font-semibold flex items-center gap-2">
                <FileText size={18} />
                Registro de Proyectos - {selectedConvo.title}
                {editingProjectId && <span className="ml-2 font-normal text-primary-200 text-xs">(Modo Edición)</span>}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleSaveData('borrador')} disabled={submitting} className="btn text-white hover:bg-white/10 transition-colors" title="Guardar Progreso sin enviar">
                  <Save size={18} className="mr-1" /> Guardar
                </button>
                <button onClick={() => setSelectedConvo(null)} className="btn bg-white text-primary-700 hover:bg-gray-100 px-3 py-1 rounded transition-colors" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <X size={16} className="mr-1" /> Salir
                </button>
              </div>
            </div>

            <div className="wizard-body md:flex-row flex-col">
              {/* Sidebar (Desktop) */}
              <div className="wizard-sidebar md:flex hidden flex-col">
                <nav className="wizard-nav py-4">
                  <button onClick={() => navigateToStep('general')} className={`wizard-nav-item w-full text-left ${formStep === 'general' ? 'active' : ''}`}>
                    Generalidades
                  </button>
                  <button
                    onClick={() => navigateToStep('personal')}
                    disabled={!isGeneralComplete()}
                    className={`wizard-nav-item w-full text-left ${formStep === 'personal' ? 'active' : ''} ${!isGeneralComplete() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Personal y Grupos
                  </button>
                  <button
                    onClick={() => navigateToStep('formulario')}
                    disabled={!isGeneralComplete()}
                    className={`wizard-nav-item w-full text-left ${formStep === 'formulario' ? 'active' : ''} ${!isGeneralComplete() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Formulario Específico
                  </button>
                  <button
                    onClick={() => navigateToStep('cronograma')}
                    disabled={!isGeneralComplete()}
                    className={`wizard-nav-item w-full text-left ${formStep === 'cronograma' ? 'active' : ''} ${!isGeneralComplete() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cronograma
                  </button>
                  <button
                    onClick={() => navigateToStep('validar')}
                    disabled={!isGeneralComplete()}
                    className={`wizard-nav-item validar w-full text-left ${formStep === 'validar' ? 'active' : ''} ${!isGeneralComplete() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CheckSquare size={16} className="inline mr-2" style={{ verticalAlign: '-3px' }} /> Validar y Enviar
                  </button>
                </nav>
              </div>

              {/* Mobile navigation (Hidden on Desktop) */}
              <div className="wizard-mobile-nav md:hidden">
                <button onClick={() => setFormStep('general')} className={`p-4 font-semibold ${formStep === 'general' ? 'border-b-2 text-primary-700' : 'text-secondary'}`} style={{ borderBottomColor: formStep === 'general' ? 'var(--primary-500)' : 'transparent', flex: 1 }}>General</button>
                <button onClick={() => isGeneralComplete() && setFormStep('personal')} disabled={!isGeneralComplete()} className={`p-4 font-semibold ${formStep === 'personal' ? 'border-b-2 text-primary-700' : 'text-secondary'} ${!isGeneralComplete() ? 'opacity-30' : ''}`} style={{ borderBottomColor: formStep === 'personal' ? 'var(--primary-500)' : 'transparent', flex: 1 }}>Participantes</button>
                <button onClick={() => isGeneralComplete() && setFormStep('formulario')} disabled={!isGeneralComplete()} className={`p-4 font-semibold ${formStep === 'formulario' ? 'border-b-2 text-primary-700' : 'text-secondary'} ${!isGeneralComplete() ? 'opacity-30' : ''}`} style={{ borderBottomColor: formStep === 'formulario' ? 'var(--primary-500)' : 'transparent', flex: 1 }}>Formulario</button>
                <button onClick={() => isGeneralComplete() && setFormStep('cronograma')} disabled={!isGeneralComplete()} className={`p-4 font-semibold ${formStep === 'cronograma' ? 'border-b-2 text-primary-700' : 'text-secondary'} ${!isGeneralComplete() ? 'opacity-30' : ''}`} style={{ borderBottomColor: formStep === 'cronograma' ? 'var(--primary-500)' : 'transparent', flex: 1 }}>Cronograma</button>
                <button onClick={() => isGeneralComplete() && setFormStep('validar')} disabled={!isGeneralComplete()} className={`p-4 font-semibold ${formStep === 'validar' ? 'border-b-2 text-green-700' : 'text-secondary'} ${!isGeneralComplete() ? 'opacity-30' : ''}`} style={{ borderBottomColor: formStep === 'validar' ? 'var(--success)' : 'transparent', flex: 1 }}>Validar</button>
              </div>

              {/* Right Content Area */}
              <div className="wizard-content">
                <div className="wizard-content-inner">

                  {/* Step: Información General */}
                  {formStep === 'general' && (
                    <div className="animate-fade-in">
                      <h3 className="wizard-title">Información General del Proyecto</h3>
                      <p className="text-secondary mb-8">Diligencie la información correspondiente al proyecto a registrar.</p>

                      <div className="space-y-6">
                        <div className="form-group mb-0">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Título Propuesto <span className="text-red-500">*</span></label>
                          <input type="text" className="form-input w-full p-2.5 bg-gray-50 focus:bg-white transition-colors" value={projectTitle} onChange={e => { setProjectTitle(e.target.value); setIsDirty(true); }} placeholder="Escriba el título de su investigación..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="form-group mb-0">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Investigador Principal</label>
                            <input disabled type="text" className="form-input w-full p-2.5 bg-gray-100 cursor-not-allowed" value={user?.name || ''} />
                          </div>
                          <div className="form-group mb-0">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                            <input disabled type="text" className="form-input w-full p-2.5 bg-gray-100 cursor-not-allowed" value={user?.email || ''} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="form-group mb-0">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo de Investigación <span className="text-red-500">*</span></label>
                            <select required className="form-select w-full p-2.5 bg-gray-50 focus:bg-white transition-colors" value={projectGroup} onChange={e => { setProjectGroup(e.target.value); setIsDirty(true); }}>
                              <option value="">-- Seleccione un grupo --</option>
                              {availableGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                            </select>
                          </div>
                          <div className="form-group mb-0">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Duración (Meses de Ejecución) <span className="text-red-500">*</span></label>
                            <input type="number" className="form-input w-full p-2.5 bg-gray-50 focus:bg-white transition-colors" value={executionMonths} onChange={e => { setExecutionMonths(Number(e.target.value)); setIsDirty(true); }} placeholder="Ej. 12" />
                          </div>
                        </div>

                        <div className="form-group mb-0">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Resumen Ejecutivo <span className="text-red-500">*</span></label>
                          <textarea className="form-textarea w-full p-2.5 bg-gray-50 focus:bg-white transition-colors" rows={5} value={projectSummary} onChange={e => { setProjectSummary(e.target.value); setIsDirty(true); }} placeholder="Breve sinopsis del proyecto..."></textarea>
                        </div>
                        <div className="flex flex-col gap-3 pt-4 border-t">
                          {isDirty && (
                            <p className="text-[11px] font-bold text-orange-600 bg-orange-50 p-2 rounded-lg flex items-center gap-2">
                              ⚠️ Tienes cambios sin guardar. Haz clic en "Guardar Borrador" para poder continuar.
                            </p>
                          )}
                          <div className="flex justify-between items-center">
                            <button className="btn btn-outline" onClick={() => handleSaveData('borrador')} disabled={submitting}>
                              <Save size={18} className="mr-2" /> Guardar Borrador
                            </button>
                            <button className={`btn ${isDirty ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                              onClick={() => !isDirty && navigateToStep('personal')}
                              disabled={isDirty}>
                              Continuar a Personal <ArrowRight size={18} className="ml-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step: Personal (Mock) */}
                  {formStep === 'personal' && (
                    <div className="animate-fade-in">
                      <h3 className="wizard-title">Generalidades Personas</h3>
                      <div className="bg-primary-50 border border-primary-100 text-primary-700 p-4 rounded mb-8 text-sm flex justify-between items-center">
                        <span>Recuerde que debe ingresar la dedicación, número de meses y función que tendrá la persona en el proyecto. Aquí traerá únicamente al personal requerido.</span>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-primary-900 uppercase">Cargado al Proyecto</p>
                          <p className="text-lg font-bold">${calculateTotalPersonnelCost().toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Listado de Personal Vinculado</span>
                          <button
                            className="btn btn-primary py-1.5 px-4 text-xs"
                            onClick={() => {
                              setCurrentMember({
                                user: '',
                                name: '',
                                identificationNumber: '',
                                role: 'Coinvestigador',
                                hoursPerMonth: 0,
                                hourlyRate: 0,
                                months: 0,
                                isContrapartida: false
                              });
                              setShowMemberModal(true);
                            }}
                          >
                            <Plus size={14} className="mr-1" /> Vincular Nueva Persona
                          </button>
                        </div>
                        <table className="w-full text-left bg-white text-sm">
                          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b">
                            <tr>
                              <th className="p-4">Persona</th>
                              <th className="p-4">Perfil</th>
                              <th className="p-4">Dedicación</th>
                              <th className="p-4">Costo Total</th>
                              <th className="p-4">Fuente</th>
                              <th className="p-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {teamMembers.map((m, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                  <div className="font-medium text-gray-900">{m.name || (availableUsers.find(u => u._id === m.user)?.name) || 'Usuario Externo'}</div>
                                  <div className="flex flex-col gap-0.5">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">ID: {m.identificationNumber || (availableUsers.find(u => u._id === m.user)?.identificationNumber) || 'N/A'}</div>
                                    <div className="text-[11px] text-primary-600 font-medium lowercase">{m.user ? availableUsers.find(u => u._id === m.user)?.email : 'Sin correo registrado'}</div>
                                  </div>
                                </td>
                                <td className="p-4 text-gray-600">{m.role}</td>
                                <td className="p-4 text-gray-600">
                                  {m.hoursPerMonth}h/mes x {m.months} meses
                                </td>
                                <td className="p-4 font-semibold text-gray-900">
                                  ${(m.hoursPerMonth * m.hourlyRate * m.months).toLocaleString()}
                                </td>
                                <td className="p-4">
                                  <span className={`badge ${m.isContrapartida ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {m.isContrapartida ? 'Contrapartida' : 'Financiado'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button className="text-primary-600 hover:text-primary-800 p-1" onClick={() => { setCurrentMember({ ...m, index: idx }); setShowMemberModal(true); }}><Edit2 size={16} /></button>
                                    <button className="text-red-500 hover:text-red-700 p-1" onClick={() => removeMember(idx)}><Trash2 size={16} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {teamMembers.length === 0 && (
                              <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">No hay personal vinculado aún. Haga clic en 'Vincular Nueva Persona'.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Participating Groups Section */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm mt-8">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Grupos de Investigación Participantes (Adicionales)</span>
                          <div className="flex gap-2">
                            <select
                              className="form-select text-xs py-1 h-8 bg-white border-primary-200"
                              onChange={(e) => {
                                if (e.target.value && !participatingGroups.includes(e.target.value)) {
                                  const next = [...participatingGroups, e.target.value];
                                  setParticipatingGroups(next);
                                  handleSaveData('borrador', true, undefined, next);
                                }
                                e.target.value = '';
                              }}
                            >
                              <option value="">+ Vincular Grupo Aliado</option>
                              {availableGroups
                                .filter(g => g._id !== projectGroup && !participatingGroups.includes(g._id))
                                .map(g => (
                                  <option key={g._id} value={g._id}>{g.name}</option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <div className="p-4 bg-white min-h-[60px] flex items-center justify-center">
                          {participatingGroups.length === 0 ? (
                            <p className="text-gray-400 italic text-sm">No hay otros grupos vinculados a esta propuesta.</p>
                          ) : (
                            <div className="flex flex-wrap gap-3 w-full">
                              {participatingGroups.map(gid => {
                                const g = availableGroups.find(x => x._id === gid);
                                return (
                                  <div key={gid} className="bg-success-50 text-success-700 px-4 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-3 border border-success-100 shadow-sm animate-fade-in">
                                    <Users size={14} />
                                    <span>{g?.name || 'Grupo Desconocido'} <span className="text-success-800 opacity-60 ml-2 font-normal">[{g?.category || 'Sin Cat.'}]</span></span>
                                    <button onClick={() => {
                                      const next = participatingGroups.filter(id => id !== gid);
                                      setParticipatingGroups(next);
                                      handleSaveData('borrador', true, undefined, next);
                                    }} className="hover:text-red-500 transition-colors ml-1"><X size={14} /></button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 pt-4 border-t">
                        {isDirty && (
                          <p className="text-[11px] font-bold text-orange-600 bg-orange-50 p-2 rounded-lg flex items-center gap-2">
                            ⚠️ Tienes cambios sin guardar en el Personal. Por favor Guarde antes de continuar.
                          </p>
                        )}
                        <div className="flex justify-between pt-4 gap-2">
                          <button className="btn btn-outline" onClick={() => navigateToStep('general')}>Volver</button>
                          <div className="flex gap-2">
                            <button className="btn btn-outline" onClick={() => handleSaveData('borrador')} disabled={submitting}>
                              <Save size={18} className="mr-2" /> Guardar Borrador
                            </button>
                            <button className={`btn ${isDirty ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                              onClick={() => !isDirty && navigateToStep('formulario')}
                              disabled={isDirty}>
                              Continuar al Formulario Específico
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step: Formulario Dinámico de la Convocatoria */}
                  {formStep === 'formulario' && (
                    <div className="animate-fade-in">
                      <h3 className="wizard-title">
                        Formulario Específico de la Convocatoria
                      </h3>
                      <p className="p-4 bg-gray-50 rounded text-secondary mb-8 border border-gray-200">
                        Los siguientes campos son de obligatorio cumplimiento según las bases publicadas por la División de Investigación.
                      </p>

                      <div className="space-y-6 bg-white">
                        {selectedConvo.dynamicFields && Array.isArray(selectedConvo.dynamicFields) ? (
                          selectedConvo.dynamicFields.map((field) => (
                            <div key={field.name} className="form-group border border-gray-100 p-6 rounded-xl hover:shadow-md transition-all bg-white mb-6">
                              <div className="flex justify-between items-start mb-3">
                                <label className="block text-sm font-bold text-primary-900 uppercase tracking-tight">
                                  {field.label} {field.required && <span className="text-red-500 ml-1" title="Obligatorio">*</span>}
                                </label>
                              </div>

                              {field.helpText && (
                                <div className="mb-4 p-3 bg-success-50/30 border-l-4 border-success-400 text-xs text-success-800 leading-relaxed rounded-r shadow-sm">
                                  <span className="font-bold flex items-center gap-1 mb-1"><CheckSquare size={12} /> AYUDA AL INVESTIGADOR:</span>
                                  {field.helpText}
                                </div>
                              )}

                              {field.type === 'textarea' ? (
                                <div className="relative">
                                  <textarea
                                    className="form-textarea w-full p-3 bg-gray-50 focus:bg-white transition-colors border-gray-200 focus:border-primary-500 rounded-lg text-sm"
                                    rows={field.label.toLowerCase().includes('resumen') ? 5 : 8}
                                    value={dynamicResponses[field.name] || ''}
                                    onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                                    placeholder={field.placeholder || "Ingrese la descripción solicitada..."}
                                  />
                                  <div className="flex justify-end mt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(dynamicResponses[field.name]?.length || 0) > (field.required ? 100 : 0) ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
                                      {dynamicResponses[field.name]?.length || 0} caracteres
                                    </span>
                                  </div>
                                </div>
                              ) : (field.type === 'table' || field.label.toLowerCase().includes('árbol') || field.label.toLowerCase().includes('arbol')) ? (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 overflow-hidden">
                                  <div className="overflow-x-auto min-h-[150px]">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-left text-xs uppercase text-gray-400 font-bold border-b">
                                          {(field.columns && field.columns.length > 0) ? field.columns.map((col, cIdx) => (
                                            <th key={cIdx} className={`pb-3 px-2 ${cIdx === 0 ? 'min-w-[150px]' : 'w-full'}`}>{col}</th>
                                          )) : (
                                            <>
                                              <th className="pb-3 px-2 min-w-[150px]">Componente</th>
                                              <th className="pb-3 px-2 w-full">Descripción / Detalle</th>
                                            </>
                                          )}
                                          <th className="pb-3 px-2 text-right">Acción</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {(Array.isArray(dynamicResponses[field.name]) ? dynamicResponses[field.name] : []).map((row: any, idx: number) => (
                                          <tr key={idx} className="group hover:bg-white/50 transition-colors">
                                            {(field.columns && field.columns.length > 0) ? (
                                              field.columns.map((col, cIdx) => (
                                                <td key={cIdx} className="py-2 px-2">
                                                  {cIdx === 0 && field.options && field.options.length > 0 ? (
                                                    <select
                                                      className="form-select text-xs p-1 h-9 bg-white border-gray-100"
                                                      value={row[col] || ''}
                                                      onChange={(e) => {
                                                        const next = [...dynamicResponses[field.name]];
                                                        next[idx][col] = e.target.value;
                                                        handleDynamicChange(field.name, next);
                                                      }}
                                                    >
                                                      <option value="">-- Seleccione --</option>
                                                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                  ) : (
                                                    <textarea
                                                      className="form-textarea w-full text-xs p-2 h-14 bg-white border-gray-100 focus:ring-1 focus:ring-primary-500"
                                                      value={row[col] || ''}
                                                      onChange={(e) => {
                                                        const next = [...dynamicResponses[field.name]];
                                                        next[idx][col] = e.target.value;
                                                        handleDynamicChange(field.name, next);
                                                      }}
                                                      placeholder="Escriba aquí..."
                                                    />
                                                  )}
                                                </td>
                                              ))
                                            ) : (
                                              <>
                                                <td className="py-2 px-2">
                                                  <select
                                                    className="form-select text-xs p-1 h-9"
                                                    value={row.type || ''}
                                                    onChange={(e) => {
                                                      const newType = e.target.value;
                                                      const next = [...dynamicResponses[field.name]];
                                                      const count = next.filter(r => r.type === newType).length;
                                                      const isArbol = (field.name.toLowerCase().includes('arbol') || field.label.toLowerCase().includes('árbol')) && !field.label.toLowerCase().includes('objetivo');
                                                      const isObjTree = field.label.toLowerCase().includes('objetivo') && field.type === 'table';

                                                      if (isArbol) {
                                                        if (newType === 'PROBLEMA' && count >= 1 && row.type !== 'PROBLEMA') {
                                                          alert('Solo se permite 1 Problema Central.');
                                                          return;
                                                        }
                                                        if (newType !== 'PROBLEMA' && count >= 3 && row.type !== newType) {
                                                          alert(`Máximo 3 ítems permitidos para ${newType.replace('_', ' ')}.`);
                                                          return;
                                                        }
                                                      }

                                                      if (isObjTree) {
                                                        if (newType === 'OBJETIVO_GENERAL' && count >= 1 && row.type !== 'OBJETIVO_GENERAL') {
                                                          alert('Solo se permite 1 Objetivo General.');
                                                          return;
                                                        }
                                                      }

                                                      next[idx].type = newType;
                                                      handleDynamicChange(field.name, next);
                                                    }}
                                                  >
                                                    {(field.label.toLowerCase().includes('objetivo') && field.type === 'table') ? (
                                                      <>
                                                        <option value="OBJETIVO_GENERAL">Objetivo General</option>
                                                        <option value="OBJETIVO_ESPECIFICO">Objetivo Específico</option>
                                                        <option value="FIN_DIRECTO">Fin Directo</option>
                                                        <option value="FIN_INDIRECTO">Fin Indirecto</option>
                                                        <option value="MEDIO_INDIRECTO">Medio Indirecto</option>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <option value="PROBLEMA">Problema Central</option>
                                                        <option value="CAUSA_DIRECTA">Causa Directa</option>
                                                        <option value="CAUSA_INDIRECTA">Causa Indirecta</option>
                                                        <option value="EFECTO_DIRECTO">Efecto Directo</option>
                                                        <option value="EFECTO_INDIRECTO">Efecto Indirecto</option>
                                                      </>
                                                    )}
                                                  </select>
                                                </td>
                                                <td className="py-2 px-2">
                                                  <textarea
                                                    className="form-textarea w-full text-xs p-2 h-14"
                                                    value={row.description || ''}
                                                    onChange={(e) => {
                                                      const next = [...dynamicResponses[field.name]];
                                                      next[idx].description = e.target.value;
                                                      handleDynamicChange(field.name, next);
                                                    }}
                                                    placeholder="Escriba aquí..."
                                                  />
                                                </td>
                                              </>
                                            )}
                                            <td className="py-2 px-2 text-right">
                                              <button
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                  const next = dynamicResponses[field.name].filter((_: any, i: number) => i !== idx);
                                                  handleDynamicChange(field.name, next);
                                                }}
                                              ><Trash2 size={16} /></button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                      className="btn btn-primary py-1.5 px-4 text-[11px] font-bold flex items-center gap-2"
                                      onClick={() => {
                                        const current = Array.isArray(dynamicResponses[field.name]) ? dynamicResponses[field.name] : [];
                                        const isArbol = (field.name.toLowerCase().includes('arbol') || field.label.toLowerCase().includes('árbol')) && !field.label.toLowerCase().includes('objetivo');
                                        const isObjTree = field.label.toLowerCase().includes('objetivo') && field.type === 'table';

                                        if (isArbol && current.length >= 13) {
                                          alert("Se ha alcanzado el límite máximo permitido para el esquema del Árbol de Problemas.");
                                          return;
                                        }

                                        const newRow: any = {};
                                        if (field.columns && field.columns.length > 0) {
                                          field.columns.forEach(col => newRow[col] = '');
                                        } else {
                                          const counts = current.reduce((acc: any, curr: any) => { acc[curr.type] = (acc[curr.type] || 0) + 1; return acc; }, {});
                                          let suggestedType = isObjTree ? 'OBJETIVO_GENERAL' : 'CAUSA_DIRECTA';

                                          if (isArbol) {
                                            if ((counts['CAUSA_DIRECTA'] || 0) >= 3) suggestedType = 'CAUSA_INDIRECTA';
                                            if ((counts['CAUSA_INDIRECTA'] || 0) >= 3) suggestedType = 'EFECTO_DIRECTO';
                                            if ((counts['EFECTO_DIRECTO'] || 0) >= 3) suggestedType = 'EFECTO_INDIRECTO';
                                            if ((counts['EFECTO_INDIRECTO'] || 0) >= 3 && !counts['PROBLEMA']) suggestedType = 'PROBLEMA';
                                          } else if (isObjTree) {
                                            if (!counts['OBJETIVO_GENERAL']) suggestedType = 'OBJETIVO_GENERAL';
                                            else if ((counts['OBJETIVO_ESPECIFICO'] || 0) < 3) suggestedType = 'OBJETIVO_ESPECIFICO';
                                            else if ((counts['FIN_DIRECTO'] || 0) < 3) suggestedType = 'FIN_DIRECTO';
                                            else if ((counts['FIN_INDIRECTO'] || 0) < 3) suggestedType = 'FIN_INDIRECTO';
                                            else suggestedType = 'MEDIO_INDIRECTO';
                                          }

                                          if ((isArbol || isObjTree) && (counts[suggestedType] || 0) >= (suggestedType === 'PROBLEMA' || suggestedType === 'OBJETIVO_GENERAL' ? 1 : 3)) {
                                            alert(`Todas las categorías del esquema están completas según el límite permitido (Máximo 3 ítems por categoría '${suggestedType}').`);
                                            return;
                                          }
                                          if (isObjTree && suggestedType === 'OBJETIVO_GENERAL' && counts['OBJETIVO_GENERAL'] >= 1) {
                                            suggestedType = 'OBJETIVO_ESPECIFICO';
                                          }

                                          newRow.type = suggestedType;
                                          newRow.description = '';
                                        }
                                        handleDynamicChange(field.name, [...current, newRow]);
                                      }}
                                    >
                                      <Plus size={14} /> Adicionar Fila a la Tabla
                                    </button>

                                    {(field.name.includes('arbol') || field.label.toLowerCase().includes('árbol')) && (
                                      <span className="text-[10px] text-gray-500 italic">
                                        * Formato oficial: Máx 1 Problema, 3 Causas Directas, 3 Indirectas, 3 Efectos Directos, 3 Indirectos.
                                      </span>
                                    )}
                                    {field.options && field.options.length > 0 && (Array.isArray(dynamicResponses[field.name]) ? dynamicResponses[field.name].length : 0) === 0 && (
                                      <button
                                        className="btn btn-outline py-1.5 px-4 text-[11px] font-bold border-dashed flex items-center gap-2"
                                        onClick={() => {
                                          const firstCol = field.columns?.[0] || 'type';
                                          const initialRows = field.options!.map(opt => {
                                            const row: any = {};
                                            if (field.columns && field.columns.length > 0) {
                                              field.columns.forEach(col => row[col] = '');
                                              row[firstCol] = opt;
                                            } else {
                                              row.type = opt;
                                              row.description = '';
                                            }
                                            return row;
                                          });
                                          handleDynamicChange(field.name, initialRows);
                                        }}
                                      >
                                        Cargar Estructura Sugerida
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-3 italic">Esquema tabular para captura estructurada de información.</p>
                                </div>
                              ) : field.type === 'select' && field.options ? (
                                <select
                                  className="form-select w-full p-3 bg-gray-50 focus:bg-white transition-colors border-gray-200 focus:border-primary-500 rounded-lg text-sm"
                                  value={dynamicResponses[field.name] || ''}
                                  onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                                >
                                  <option value="">{field.placeholder || "-- Seleccione una opción --"}</option>
                                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : field.type === 'number' ? (
                                <div className="relative">
                                  <span className="absolute left-3 top-3.5 text-gray-500 font-medium">$</span>
                                  <input
                                    type="number"
                                    className="form-input w-full p-3 pl-8 bg-gray-50 focus:bg-white transition-colors border-gray-200 focus:border-primary-500 rounded-lg text-sm"
                                    value={dynamicResponses[field.name] || ''}
                                    onChange={(e) => handleDynamicChange(field.name, Number(e.target.value))}
                                    placeholder={field.placeholder || "0"}
                                  />
                                </div>
                              ) : field.type === 'file' ? (
                                <div className="border-2 border-dashed border-gray-200 p-6 text-center rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group">
                                  <input
                                    type="file"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer"
                                    onChange={(e) => handleDynamicChange(field.name, e.target.files?.[0]?.name || 'documento.pdf')}
                                  />
                                  <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-wider">Formatos permitidos: PDF, DOCX (Máximo 3MB).</p>
                                </div>
                              ) : (
                                <input
                                  type={field.type === 'date' ? 'date' : 'text'}
                                  className="form-input w-full p-3 bg-gray-50 focus:bg-white transition-colors border-gray-200 focus:border-primary-500 rounded-lg text-sm"
                                  value={dynamicResponses[field.name] || ''}
                                  onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                                  placeholder={field.placeholder || "Escriba aquí..."}
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-400 py-10 italic">
                            No se han definido campos adicionales para esta convocatoria.
                          </div>
                        )}

                        {selectedConvo.dynamicFields && selectedConvo.dynamicFields.length === 0 && (
                          <div className="text-center text-gray-400 py-10 italic">
                            Esta convocatoria no tiene campos adicionales requeridos.
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 pt-4 border-t">
                        {isDirty && (
                          <p className="text-[11px] font-bold text-orange-600 bg-orange-50 p-2 rounded-lg flex items-center gap-2">
                            ⚠️ Tienes cambios sin guardar en el Formulario. Por favor Guarde antes de continuar.
                          </p>
                        )}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t">
                          <div className="flex gap-2">
                            <button className="btn btn-outline" onClick={() => navigateToStep('personal')}>Anterior</button>
                            <button className="btn btn-outline border-primary-300 text-primary-700 hover:bg-primary-50" onClick={handlePreviewPDF}>
                              <Download size={18} className="mr-2" /> Vista Previa PDF
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button className="btn btn-outline" onClick={() => handleSaveData('borrador')} disabled={submitting}>
                              <Save size={18} className="mr-2" /> Guardar Borrador
                            </button>
                            <button className={`btn shadow-md ${isDirty ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200' : 'btn-primary'}`}
                              onClick={() => !isDirty && (validateForm() && navigateToStep('cronograma'))}
                              disabled={isDirty}>
                              Pasar a Cronograma <ArrowRight size={18} className="ml-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step: Cronograma */}
                  {formStep === 'cronograma' && (
                    <div className="animate-fade-in space-y-6">
                      <div className="flex justify-between items-center bg-primary-50 p-6 rounded-xl border border-primary-100 mb-6">
                        <div>
                          <h3 className="wizard-title mb-1">Cronograma de Actividades</h3>
                          <p className="text-secondary text-xs">Vincule cada actividad a uno de los objetivos específicos registrados en el formulario.</p>
                        </div>
                        <Activity className="text-primary-600 opacity-20" size={56} />
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Objetivo Específico Relacionado</th>
                              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actividad / Tarea a Realizar</th>
                              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center w-28">Periodo (Meses)</th>
                              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right w-20"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(Array.isArray(dynamicResponses['cronograma']) ? dynamicResponses['cronograma'] : []).map((act: any, idx: number) => (
                              <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 align-top w-1/3">
                                  <select
                                    className="form-select w-full text-xs p-2 border-gray-200"
                                    value={act.objective || ''}
                                    onChange={e => {
                                      const next = [...(dynamicResponses['cronograma'] || [])];
                                      next[idx].objective = e.target.value;
                                      handleDynamicChange('cronograma', next);
                                    }}
                                  >
                                    <option value="">-- Seleccione Objetivo --</option>
                                    {(() => {
                                      const objTreeField = selectedConvo?.dynamicFields?.find(f => f.label.toLowerCase().includes('objetivo') && f.type === 'table');
                                      const treeRows = objTreeField ? (dynamicResponses[objTreeField.name] || []) : [];
                                      return treeRows.filter((r: any) => r.type === 'OBJETIVO_ESPECIFICO').map((r: any, i: number) => (
                                        <option key={i} value={r.description}>{r.description?.substring(0, 60)}...</option>
                                      ));
                                    })()}
                                  </select>
                                </td>
                                <td className="py-3 px-4 align-top">
                                  <textarea
                                    className="form-textarea w-full text-xs p-2 h-20 border-gray-200 focus:bg-white"
                                    value={act.description || ''}
                                    onChange={e => {
                                      const next = [...(dynamicResponses['cronograma'] || [])];
                                      next[idx].description = e.target.value;
                                      handleDynamicChange('cronograma', next);
                                    }}
                                    placeholder="Describa el producto o actividad..."
                                  />
                                </td>
                                <td className="py-3 px-4 bg-gray-50/30">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-gray-400 w-8">INI:</span>
                                      <input
                                        type="number"
                                        className="form-input w-16 text-xs p-1 text-center"
                                        value={act.startMonth || ''}
                                        onChange={e => {
                                          const next = [...(dynamicResponses['cronograma'] || [])];
                                          next[idx].startMonth = Number(e.target.value);
                                          handleDynamicChange('cronograma', next);
                                        }}
                                        min="1"
                                        max={executionMonths}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-gray-400 w-8">FIN:</span>
                                      <input
                                        type="number"
                                        className="form-input w-16 text-xs p-1 text-center"
                                        value={act.endMonth || ''}
                                        onChange={e => {
                                          const next = [...(dynamicResponses['cronograma'] || [])];
                                          next[idx].endMonth = Number(e.target.value);
                                          handleDynamicChange('cronograma', next);
                                        }}
                                        min="1"
                                        max={executionMonths}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right align-middle">
                                  <button
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Eliminar actividad"
                                    onClick={() => {
                                      const next = dynamicResponses['cronograma'].filter((_: any, i: number) => i !== idx);
                                      handleDynamicChange('cronograma', next);
                                    }}
                                  ><Trash2 size={18} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {(!dynamicResponses['cronograma'] || dynamicResponses['cronograma'].length === 0) && (
                          <div className="p-12 text-center">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Activity className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-400 text-sm italic">No hay actividades registradas en el cronograma.</p>
                            <button
                              className="mt-4 text-primary-600 font-bold text-xs uppercase tracking-wider hover:underline"
                              onClick={() => {
                                const current = Array.isArray(dynamicResponses['cronograma']) ? dynamicResponses['cronograma'] : [];
                                handleDynamicChange('cronograma', [...current, { objective: '', description: '', startMonth: 1, endMonth: 1 }]);
                              }}
                            >+ Adicionar Primera Actividad</button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <button
                          className="btn btn-primary py-2 px-8 flex items-center gap-2 shadow-lg"
                          onClick={() => {
                            const current = Array.isArray(dynamicResponses['cronograma']) ? dynamicResponses['cronograma'] : [];
                            handleDynamicChange('cronograma', [...current, { objective: '', description: '', startMonth: 1, endMonth: 1 }]);
                          }}
                        >
                          <Plus size={18} /> Nueva Actividad
                        </button>

                        <div className="flex items-center gap-2 text-[11px] font-medium text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                          <Calendar size={14} />
                          <span>Plazo máximo de ejecución: <strong>{executionMonths} meses</strong> (Mes 1 al Mes {executionMonths})</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-8 border-t mt-12">
                        <button className="btn btn-outline" onClick={() => navigateToStep('formulario')}>Retroceder a Formulario</button>
                        <div className="flex gap-3">
                          <button className="btn btn-outline bg-white" onClick={() => handleSaveData('borrador')} disabled={submitting}>
                            <Save size={18} className="mr-2" /> Guardar Borrador
                          </button>
                          <button className={`btn ${isDirty ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed' : 'btn-primary shadow-xl hover:scale-105 transition-all'}`}
                            onClick={() => !isDirty && (validateForm() && navigateToStep('validar'))}
                            disabled={isDirty}>
                            Revisar y Validar <ArrowRight size={18} className="ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step: Validar y Enviar */}
                  {formStep === 'validar' && (
                    <div className="animate-fade-in">
                      <h3 className="wizard-title">Validación del Proyecto</h3>

                      {validationErrors.length > 0 ? (
                        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8" style={{ backgroundColor: '#fef2f2', borderColor: '#f87171' }}>
                          <h4 className="font-semibold mb-4 text-red-500" style={{ fontSize: '1.15rem' }}>El proyecto no puede ser radicado. Por favor corrija los siguientes errores:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-red-700 text-sm">
                            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                          </ul>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-8 flex items-start gap-4" style={{ backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' }}>
                          <CheckCircle style={{ color: "var(--success)" }} size={28} />
                          <div>
                            <h4 className="font-semibold mb-1" style={{ color: "var(--success)", fontSize: '1.15rem' }}>El proyecto ha sido validado sin errores</h4>
                            <p className="text-secondary text-sm">Una vez haya verificado la información, acepte los términos y envíelo para que quede radicado en la División de Investigación.</p>
                          </div>
                        </div>
                      )}

                      <div className={`p-6 border rounded-lg text-sm mb-8 space-y-4 shadow-sm transition-all ${termsAccepted ? 'bg-success-50 border-success-200' : 'bg-gray-50 border-gray-200'}`}>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 mt-0.5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                            style={{ accentColor: "var(--primary-600)" }}
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                          />
                          <div className="flex flex-col">
                            <span className={`font-medium transition-colors ${termsAccepted ? 'text-success-800' : 'text-gray-700'}`} style={{ fontSize: '1rem' }}>
                              Acepto los <a href="#" className="underline font-bold" onClick={(e) => e.preventDefault()}>términos y condiciones</a> de la convocatoria.
                            </span>
                            <p className="text-secondary text-[13px] mt-1">Confirmo que la información suministrada es verídica y que el proyecto se ajusta a los requerimientos de la División de Investigación de la Universidad de Sucre.</p>
                          </div>
                        </label>
                      </div>

                      <div className="flex justify-center gap-4">
                        <button className="btn btn-outline px-6" onClick={() => navigateToStep('general')}>Retroceder y Editar</button>
                        <button
                          className={`btn px-8 shadow-lg transition-all duration-300 ${validationErrors.length > 0 || !termsAccepted ? 'bg-gray-300 text-gray-500 cursor-not-allowed scale-95 opacity-70' : 'btn-primary hover:scale-105'}`}
                          onClick={() => handleSaveData('radicado')}
                          disabled={validationErrors.length > 0 || !termsAccepted || submitting}
                        >
                          <Send size={18} className="mr-2" />
                          {submitting ? 'Radicando en sistema...' : 'Enviar y Radicar Proyecto Permanentemente'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Modal: Adicionar/Editar Persona */}
                  {showMemberModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in shadow-xl" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                          <h4 className="font-bold text-gray-800">{currentMember.index !== undefined ? 'Editar Personal' : 'Adicionar Personal al Proyecto'}</h4>
                          <button onClick={() => setShowMemberModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="form-group mb-0">
                            <label className="text-xs font-bold text-gray-500 uppercase">¿Está registrado en la plataforma?</label>
                            <select className="form-select w-full p-2 border rounded" value={currentMember.user || ''} onChange={e => {
                              const u = availableUsers.find(x => x._id === e.target.value);
                              setCurrentMember({
                                ...currentMember,
                                user: e.target.value,
                                name: u ? u.name : '',
                                identificationNumber: u ? u.identificationNumber || '' : ''
                              });
                            }}>
                              <option value="">-- No, es personal externo --</option>
                              {availableUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group mb-0">
                              <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                              <input type="text" className="form-input w-full p-2 border rounded" value={currentMember.name} onChange={e => setCurrentMember({ ...currentMember, name: e.target.value })} placeholder="Ej. Juan Alberto Perez Sarmiento" disabled={!!currentMember.user} />
                            </div>
                            <div className="form-group mb-0">
                              <label className="text-xs font-bold text-gray-500 uppercase">Número Identificación</label>
                              <input type="text" className="form-input w-full p-2 border rounded" value={currentMember.identificationNumber} onChange={e => setCurrentMember({ ...currentMember, identificationNumber: e.target.value })} placeholder="Ej. 1102..." disabled={!!currentMember.user} />
                            </div>
                          </div>
                          <div className="form-group mb-0">
                            <label className="text-xs font-bold text-gray-500 uppercase">Perfil / Rol en Proyecto</label>
                            <select className="form-select w-full p-2 border rounded" value={currentMember.role} onChange={e => setCurrentMember({ ...currentMember, role: e.target.value })}>
                              <option>Investigador Principal</option>
                              <option>Coinvestigador</option>
                              <option>Estudiante de Pregrado</option>
                              <option>Joven Investigador</option>
                              <option>Estudiante de Maestría</option>
                              <option>Estudiante de Especialización</option>
                              <option>Estudiante de Doctorado</option>
                              <option>Posdoctor</option>
                              <option>Técnico / Auxiliar</option>
                              <option>Otro</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="form-group mb-0">
                              <label className="text-xs font-bold text-gray-500 uppercase">Horas x Mes</label>
                              <input type="number" className="form-input w-full p-2 border rounded" value={currentMember.hoursPerMonth} onChange={e => setCurrentMember({ ...currentMember, hoursPerMonth: Number(e.target.value) })} />
                            </div>
                            <div className="form-group mb-0">
                              <label className="text-xs font-bold text-gray-500 uppercase">Valor Hora ($)</label>
                              <input type="number" className="form-input w-full p-2 border rounded" value={currentMember.hourlyRate} onChange={e => setCurrentMember({ ...currentMember, hourlyRate: Number(e.target.value) })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="form-group mb-0">
                              <label className="text-xs font-bold text-gray-500 uppercase">Número de Meses</label>
                              <input type="number" className="form-input w-full p-2 border rounded" value={currentMember.months} onChange={e => setCurrentMember({ ...currentMember, months: Number(e.target.value) })} />
                            </div>
                            <div className="form-group mb-0 pt-6">
                              <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                                <input type="checkbox" className="w-4 h-4" checked={currentMember.isContrapartida} onChange={e => setCurrentMember({ ...currentMember, isContrapartida: e.target.checked })} />
                                Es Contrapartida
                              </label>
                            </div>
                          </div>

                          <div className="bg-primary-50 p-4 rounded-lg flex justify-between items-center border border-primary-100">
                            <span className="text-xs text-primary-700 font-bold uppercase">Costo Total Calculado:</span>
                            <span className="text-xl font-bold text-primary-800">${(currentMember.hoursPerMonth * currentMember.hourlyRate * currentMember.months).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                          <button className="btn btn-outline" onClick={() => setShowMemberModal(false)}>Cancelar</button>
                          <button className="btn btn-primary" onClick={addOrUpdateMember}>Guardar Personal</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
