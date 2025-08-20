import { formatText } from '../../utils/formatters.js';
import React, { useEffect, useState } from 'react';
import CreateForm from '../common/CreateForm';
import FileUploadInfo from '../common/FileUploadInfo';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/Documentos.module.css';
import {
 DocumentIcon,
 TagIcon,
 BuildingIcon,
 ProcessIcon,
 LockIcon,
 FileIcon
 } from '../icons/DashboardIcons';
 const CONF_OPTS = [
 { value: 'Publico', label: 'Público' },
 { value: 'Interno', label: 'Interno' }
 ];
 const DocumentoModal = ({ show, mode, formData, onClose, onSubmit, onChange, loading = false, errors = {} }) => {
 const { apiRequest } = useAuth();
 const [tiposProcesosOptions, setTiposProcesosOptions] = useState([]);
 const [procesosGeneralesOptions, setProcesosGeneralesOptions] = useState([]);
 const [procesosInternosOptions, setProcesosInternosOptions] = useState([]);
 const [localData, setLocalData] = useState(formData || {});
 const [loadingData, setLoadingData] = useState(false);
 // Cargar datos iniciales cuando se abre el modal
 useEffect(() => {
 if (!show) return;
 const cargarDatosIniciales = async () => {
 setLoadingData(true);
 try {
 // Cargar tipos de procesos y categorías en paralelo
 const [tiposRes, categoriasRes] = await Promise.all([
 apiRequest('/tipos-procesos'),
 apiRequest('/procesos-internos')
 ]);
 // Procesar tipos de procesos
 if (tiposRes.success) {
 const tipos = tiposRes.data.map(x => ({ value: x.id, label: formatText(x.nombre, { case: 'capitalize' }) }));
 console.log('✅ [DocumentoModal.jsx] Tipos de procesos cargados:', tipos.length);
 setTiposProcesosOptions(tipos);
 } else {
 console.error('❌ [DocumentoModal.jsx] Error cargando tipos de procesos:', tiposRes);
 setTiposProcesosOptions([]);
 }
  // Procesar procesos internos (antes "categorías")
  if (categoriasRes.success) {
  const procesosInternos = categoriasRes.data.map(x => ({
  value: x.id,
  label: formatText(x.nombre, { case: 'capitalize' }),
  descripcion: x.descripcion
  }));
  console.log('✅ [DocumentoModal.jsx] Procesos internos cargados:', procesosInternos.length);
  setProcesosInternosOptions(procesosInternos);
  } else {
  console.error('❌ [DocumentoModal.jsx] Error cargando procesos internos:', categoriasRes);
  setProcesosInternosOptions([]);
  }
 } catch (error) {
 console.error('💥 [DocumentoModal.jsx] Error general cargando datos:', error);
 } finally {
 setLoadingData(false);
 }
 };
 cargarDatosIniciales();
 }, [show, apiRequest]);
 const cargarProcesosGenerales = async (tipoProcesoId) => {
 try {
 console.log('🔄 [DocumentoModal.jsx] Cargando procesos generales para tipo ID:', tipoProcesoId);
 const res = await apiRequest(`/tipos-procesos/${tipoProcesoId}/procesos-generales`);
 if (res.success) {
 const procesos = (res.data || []).map(x => ({
 value: x.id,
 label: formatText(x.nombre, { case: 'capitalize' }),
 descripcion: x.descripcion
 }));
 console.log('✅ [DocumentoModal.jsx] Procesos generales cargados:', procesos.length);
 setProcesosGeneralesOptions(procesos);
 } else {
 console.error('❌ [DocumentoModal.jsx] Error cargando procesos generales:', res);
 setProcesosGeneralesOptions([]);
 }
 } catch (error) {
 console.error('💥 [DocumentoModal.jsx] Error cargando procesos generales:', error);
 setProcesosGeneralesOptions([]);
 }
 };

 const cargarProcesosInternos = async (procesoGeneralId) => {
 try {
 console.log('🔄 [DocumentoModal.jsx] Cargando procesos internos para proceso general ID:', procesoGeneralId);
 const res = await apiRequest(`/procesos-generales/${procesoGeneralId}/procesos-internos`);
 if (res.success) {
 const procesos = (res.data || []).map(x => ({
 value: x.id,
 label: formatText(x.nombre, { case: 'capitalize' }),
 descripcion: x.descripcion
 }));
 console.log('✅ [DocumentoModal.jsx] Procesos internos cargados:', procesos.length);
 setProcesosInternosOptions(procesos);
 } else {
 console.error('❌ [DocumentoModal.jsx] Error cargando procesos internos:', res);
 setProcesosInternosOptions([]);
 }
 } catch (error) {
 console.error('💥 [DocumentoModal.jsx] Error cargando procesos internos:', error);
 setProcesosInternosOptions([]);
 }
 };
 // Cargar procesos generales cuando cambia el tipo de proceso seleccionado
 useEffect(() => {
 if (!show) return;
 const tipoProcesoId = localData?.tipo_proceso_id;
 console.log('🔄 [DocumentoModal.jsx] Cambio en tipo_proceso_id:', tipoProcesoId);
 if (!tipoProcesoId) {
 setProcesosGeneralesOptions([]);
 setLocalData(prev => ({
 ...prev,
 proceso_general_id: ''
 }));
 return;
 }
 // Cargar procesos generales automáticamente
 cargarProcesosGenerales(tipoProcesoId);
 }, [localData?.tipo_proceso_id, show]);

 // Cargar procesos internos cuando cambia el proceso general seleccionado
 useEffect(() => {
 if (!show) return;
 const procesoGeneralId = localData?.proceso_general_id;
 console.log('🔄 [DocumentoModal.jsx] Cambio en proceso_general_id:', procesoGeneralId);
 if (!procesoGeneralId) {
 setProcesosInternosOptions([]);
 setLocalData(prev => ({
 ...prev,
 proceso_interno_id: ''
 }));
 return;
 }
 // Cargar procesos internos automáticamente
 cargarProcesosInternos(procesoGeneralId);
 }, [localData?.proceso_general_id, show]);
 if (!show) return null;
 const handleAddProcesoGeneral = async () => {
 const nombre = window.prompt('Escribe el nombre de la nueva área principal:');
 if (!nombre) return;
 const descripcion = window.prompt('Escribe la descripción del área principal (opcional):');
 const tipo = window.prompt('Escribe el tipo de área (estrategico/misional/apoyo/evaluacion):');
 try {
 const res = await apiRequest('/procesos-generales', {
 method: 'POST',
 body: JSON.stringify({
 nombre: nombre.trim(),
 descripcion: descripcion ? descripcion.trim() : null,
 tipo_proceso_id: null, // Se asignará automáticamente según el tipo
 icono: 'building'
 })
 });
 if (res.success) {
 const nuevoProcesoGeneral = {
 value: res.data.id,
 label: res.data.nombre,
 descripcion: res.data.descripcion
 };
 setProcesosGeneralesOptions(prev => [...prev, nuevoProcesoGeneral]);
 setLocalData(prev => ({
 ...prev,
 proceso_general_id: res.data.id,
 proceso_interno_id: ''
 }));
 alert('Área principal creada exitosamente');
 } else {
 alert(res.message || 'Error al crear el área principal');
 }
 } catch (e) {
 alert('Error al crear el área principal: ' + e.message);
 }
 };
 const handleAddProcesoInterno = async () => {
 const nombre = window.prompt('Escribe el nombre de la nueva carpeta:');
 if (!nombre) return;
 const descripcion = window.prompt('Escribe la descripción de la carpeta (opcional):');
 try {
 const res = await apiRequest('/procesos-internos', {
 method: 'POST',
 body: JSON.stringify({
 nombre: nombre.trim(),
 descripcion: descripcion ? descripcion.trim() : null,
 proceso_general_id: null, // No depende de un proceso específico
 icono: 'folder'
 })
 });
 if (res.success) {
 const nuevoProceso = {
 value: res.data.id,
 label: res.data.nombre,
 descripcion: res.data.descripcion
 };
 setProcesosInternosOptions(prev => [...prev, nuevoProceso]);
 setLocalData(prev => ({
 ...prev,
 proceso_interno_id: res.data.id
 }));
 alert('Carpeta creada exitosamente');
 } else {
 alert(res.message || 'Error al crear la carpeta');
 }
 } catch (e) {
 alert('Error al crear la carpeta: ' + e.message);
 }
 };
 const fields = [
 {
 title: 'Archivo y Título',
 icon: FileIcon,
 fields: [
 {
 name: 'archivo',
 label: 'Archivo',
 type: 'file',
 required: mode === 'create',
 accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar',
 helpText: mode === 'create' ? 'Selecciona el archivo a subir (PDF, Word, Excel, PowerPoint, imágenes, etc.)' : 'El archivo actual se mantendrá si no seleccionas uno nuevo'
 },
 {
 name: 'titulo',
 label: 'Título del Documento',
 type: 'text',
 required: true,
 maxLength: 255,
 placeholder: 'Ingresa un título descriptivo para el documento'
 },
 {
 name: 'descripcion',
 label: 'Descripción',
 type: 'textarea',
 required: false,
 maxLength: 500,
 placeholder: 'Describe brevemente el contenido y propósito del documento (opcional)',
 rows: 3
 }
 ]
 },
 {
 title: 'Clasificación Organizacional',
 icon: BuildingIcon,
 fields: [
 {
 name: 'tipo_proceso_id',
 label: 'Tipo de Proceso',
 type: 'select',
 required: true,
 options: tiposProcesosOptions,
 placeholder: loadingData ? 'Cargando tipos de procesos...' : 'Selecciona el tipo de proceso',
 disabled: loadingData,
 helpText: 'Define la categoría principal del documento (Ej: Estrategico, Misional, Apoyo, Evaluacion)'
 },
 {
 name: 'proceso_general_id',
 label: 'Proceso General (Área Principal)',
 type: 'select',
 required: true,
 options: procesosGeneralesOptions,
 placeholder: !localData?.tipo_proceso_id
 ? 'Primero selecciona un tipo de proceso'
 : (loadingData ? 'Cargando áreas principales...' : 'Selecciona el área principal de la organización'),
 disabled: !localData?.tipo_proceso_id || loadingData,
 hasAddButton: true,
 addButtonText: 'Agregar área principal',
 onAddClick: handleAddProcesoGeneral,
 helpText: 'Selecciona el área principal de la organización a la que pertenece este documento'
 },
 {
 name: 'proceso_interno_id',
  label: 'Proceso Interno',
 type: 'select',
 required: true,
 options: procesosInternosOptions,
 disabled: loadingData,
  placeholder: loadingData ? 'Cargando procesos internos...' : 'Selecciona el proceso interno',
 hasAddButton: true,
  addButtonText: 'Agregar proceso interno',
 onAddClick: handleAddProcesoInterno,
  helpText: 'Selecciona el proceso interno al que pertenece este documento'
 }
 ]
 },
 {
 title: 'Seguridad y Acceso',
 icon: LockIcon,
 fields: [
 {
 name: 'confidencialidad',
 label: 'Nivel de Confidencialidad',
 type: 'select',
 options: CONF_OPTS,
 placeholder: 'Define quién puede acceder al documento',
 helpText: 'Público: Todos los usuarios pueden acceder. Interno: Solo usuarios autorizados.'
 }
 ]
 }
 ];
 const onInternalSubmit = async (data) => {
   try {
     console.log('🔄 [DocumentoModal.jsx] Enviando datos:', data);
     console.log('🔄 [DocumentoModal.jsx] Modo:', mode);
     
     // Función para validar tamaño de archivo
     const validateFileSize = (file) => {
       const maxSize = 50 * 1024 * 1024; // 50MB en bytes
       if (file.size > maxSize) {
         const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
         throw new Error(`El archivo "${file.name}" es demasiado grande (${sizeInMB}MB). El tamaño máximo permitido es 50MB.`);
       }
     };
     
     // Verificar si es FormData o datos normales
     if (data instanceof FormData) {
       console.log('📁 [DocumentoModal.jsx] Recibido FormData con archivos');
       // Verificar que el archivo esté presente solo si es modo create
       if (mode === 'create') {
         const archivo = data.get('archivo');
         if (!archivo) {
           console.error('❌ [DocumentoModal.jsx] No hay archivo en FormData para creación');
           alert('Debes seleccionar un archivo');
           return;
         }
         console.log('✅ [DocumentoModal.jsx] Archivo encontrado para creación:', archivo.name);
         // Validar tamaño del archivo
         validateFileSize(archivo);
       } else {
         console.log('✅ [DocumentoModal.jsx] Modo edición - archivo opcional');
         // Si hay un archivo nuevo en edición, validarlo
         const archivo = data.get('archivo');
         if (archivo && archivo instanceof File) {
           validateFileSize(archivo);
         }
       }
     } else {
       console.log('📋 [DocumentoModal.jsx] Recibidos datos normales');
       // Verificar archivo solo si es modo create
       if (mode === 'create' && !data.archivo) {
         console.error('❌ [DocumentoModal.jsx] No hay archivo seleccionado para creación');
         alert('Debes seleccionar un archivo');
         return;
       }
       if (mode === 'create') {
         console.log('✅ [DocumentoModal.jsx] Archivo encontrado para creación:', data.archivo.name);
         // Validar tamaño del archivo
         validateFileSize(data.archivo);
       } else {
         console.log('✅ [DocumentoModal.jsx] Modo edición - archivo opcional');
         // Si hay un archivo nuevo en edición, validarlo
         if (data.archivo && data.archivo instanceof File) {
           validateFileSize(data.archivo);
         }
       }
     }
     
     if (onSubmit) await onSubmit(data);
   } catch (error) {
     console.error('💥 [DocumentoModal.jsx] Error general:', error);
     alert('Error al procesar el documento: ' + error.message);
   }
 };
 // Debug: Log del estado actual
 console.log('🔍 [DocumentoModal.jsx] Estado actual:', {
 tiposProcesosOptions: tiposProcesosOptions.length,
 procesosGeneralesOptions: procesosGeneralesOptions.length,
 procesosInternosOptions: procesosInternosOptions.length,
 localData,
 loadingData
 });
 return (
 <div className={styles.modalOverlay} onClick={onClose}>
 <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
 <div className={styles.modalHeader}>
 <h2 className={styles.modalTitle}>
 {mode === 'create' ? 'Nuevo Documento' : 'Editar Documento'}
 </h2>
 <button onClick={onClose} title="Cerrar" className={styles.closeButton}>
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 <div className={styles.modalBody}>
 {loadingData && (
 <div className={styles.loadingOverlay}>
 <div className={styles.spinner}></div>
 <p>Cargando datos de clasificación organizacional...</p>
 </div>
 )}
          <CreateForm
           entityType="documento"
           fields={fields}
           initialData={localData}
           onSubmit={onInternalSubmit}
           onCancel={onClose}
           onChange={setLocalData}
           loading={loading || loadingData}
           errors={errors}
           isModal={true}
         />
         <div className="mt-4">
           <FileUploadInfo />
         </div>
 </div>
 </div>
 </div>
 );
 };
 export default DocumentoModal;