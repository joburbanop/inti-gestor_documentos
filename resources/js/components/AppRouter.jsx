import React from 'react'; import { Routes, Route, Navigate } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';
 import Dashboard from './Dashboard';
 import ProcesosPage from './procesos/ProcesosPage';
import ProcesoTipoPage from './procesos/ProcesoTipoPage';
import ProcesoTipoDetail from './procesos/ProcesoTipoDetail';
import ProcesosInternosPage from './procesos/ProcesosInternosPage';
 import Documentos from './Documentos';
 import DocumentoPreview from './documentos/DocumentoPreview';
 import Administracion from './Administracion';
 import ProtectedRoute from './common/ProtectedRoute';
 import { PERMISSIONS } from '../roles/permissions';
 import OrgStructure from './common/OrgStructure';
 import { INTILED_COLORS } from '../config/colors';
 const Home = () => {
 const { user } = useAuth();
 return <Dashboard />;
 };
 // Componente para Procesos de Apoyo (placeholder informativo)
 const ProcesosApoyoPage = () => {
 const supportProcesses = [
 {
 name: 'Gestión del Talento Humano',
 description: 'Gestión integral del capital humano de la organización',
 icon: '👥',
 color: 'blue',
 status: 'Activo'
 },
 {
 name: 'Gestión Financiera',
 description: 'Administración financiera y presupuestaria',
 icon: '💰',
 color: 'green',
 status: 'Activo'
 },
 {
 name: 'Contratación',
 description: 'Procesos de contratación y adquisiciones',
 icon: '📋',
 color: 'purple',
 status: 'En desarrollo'
 },
 {
 name: 'Gestión Documental',
 description: 'Control y gestión de documentos institucionales',
 icon: '📄',
 color: 'orange',
 status: 'Activo'
 },
 {
 name: 'Gestión de Tecnologías de la Información',
 description: 'Soporte tecnológico y sistemas informáticos',
 icon: '💻',
 color: 'indigo',
 status: 'Activo'
 },
 {
 name: 'Gestión Jurídica',
 description: 'Asesoría legal y cumplimiento normativo',
 icon: '⚖️',
 color: 'red',
 status: 'En desarrollo'
 },
 {
 name: 'Apoyo Logístico',
 description: 'Soporte logístico y operacional',
 icon: '📦',
 color: 'yellow',
 status: 'Activo'
 },
 {
 name: 'Control Interno Disciplinario',
 description: 'Control disciplinario y auditoría interna',
 icon: '🔍',
 color: 'pink',
 status: 'En desarrollo'
 },
 {
 name: 'Asuntos Internacionales',
 description: 'Relaciones internacionales y cooperación',
 icon: '🌍',
 color: 'teal',
 status: 'En desarrollo'
 }
 ];
 const getColorClasses = (color) => {
 const colorMap = {
 blue: 'bg-blue-50 border-blue-200 text-blue-900',
 green: 'bg-green-50 border-green-200 text-green-900',
 purple: 'bg-purple-50 border-purple-200 text-purple-900',
 orange: 'bg-orange-50 border-orange-200 text-orange-900',
 indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
 red: 'bg-red-50 border-red-200 text-red-900',
 yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
 pink: 'bg-pink-50 border-pink-200 text-pink-900',
 teal: 'bg-teal-50 border-teal-200 text-teal-900'
 };
 return colorMap[color] || 'bg-gray-50 border-gray-200 text-gray-900';
 };
 const getStatusColor = (status) => {
 return status === 'Activo' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';
 };
 return (
 <div className="min-h-screen bg-gray-50 pt-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="flex items-center mb-6">
 <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
 </svg>
 </div>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Procesos de Apoyo</h1>
 <p className="text-gray-600">Gestión de procesos que soportan las operaciones principales de la organización</p>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {supportProcesses.map((process, index) => (
 <div key={index} className={`rounded-lg p-6 border ${getColorClasses(process.color)}`}>
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center">
 <span className="text-2xl mr-3">{process.icon}</span>
 <h3 className="text-lg font-semibold">{process.name}</h3>
 </div>
 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
 {process.status}
 </span>
 </div>
 <p className="text-sm opacity-80 mb-4">
 {process.description}
 </p>
 <div className="flex items-center justify-between">
 <div className="flex items-center text-sm opacity-70">
 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="font-medium">Gestionar</span>
 </div>
 <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
 Ver detalles →
 </button>
 </div>
 </div>
 ))}
 </div>
 <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
 <div className="flex items-start">
 <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div>
 <h4 className="text-sm font-semibold text-blue-900 mb-1">¿Qué son los Procesos de Apoyo?</h4>
 <p className="text-sm text-blue-800">
 Los procesos de apoyo son actividades que proporcionan recursos y capacidades necesarias para que los procesos estratégicos y misionales puedan funcionar eficazmente.
 Incluyen gestión de recursos humanos, financieros, tecnológicos y administrativos.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 };
 // Componente para Procesos Misionales
 const ProcesosMisionalesPage = () => {
 return (
 <div className="min-h-screen bg-gray-50 pt-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="flex items-center mb-6">
 <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 </div>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Procesos Misionales</h1>
 <p className="text-gray-600">Gestión de procesos que ejecutan las funciones principales de la organización</p>
 </div>
 </div>
 <div className="text-center py-12">
 <div className="text-gray-400 mb-6">
 <svg className="mx-auto h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
 </svg>
 </div>
 <h3 className="text-2xl font-bold text-gray-900 mb-3">Procesos Misionales</h3>
 <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
 Esta sección gestiona los procesos misionales que ejecutan las funciones principales de la organización.
 </p>
 <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
 <h4 className="text-lg font-semibold text-purple-900 mb-2">Funcionalidad en Desarrollo</h4>
 <p className="text-purple-800">
 Los procesos misionales están siendo configurados. Pronto estarán disponibles todas las funcionalidades de gestión.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 };
 // Componente para Procesos Estratégicos
 const ProcesosEstrategicosPage = () => {
 return (
 <div className="min-h-screen bg-gray-50 pt-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="flex items-center mb-6">
 <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 </div>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Procesos Estratégicos</h1>
 <p className="text-gray-600">Gestión de procesos que definen la dirección estratégica de la organización</p>
 </div>
 </div>
 <div className="text-center py-12">
 <div className="text-gray-400 mb-6">
 <svg className="mx-auto h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 </div>
 <h3 className="text-2xl font-bold text-gray-900 mb-3">Procesos Estratégicos</h3>
 <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
 Esta sección gestiona los procesos estratégicos que definen la dirección y objetivos de la organización.
 </p>
 <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
 <h4 className="text-lg font-semibold text-blue-900 mb-2">Funcionalidad en Desarrollo</h4>
 <p className="text-blue-800">
 Los procesos estratégicos están siendo configurados. Pronto estarán disponibles todas las funcionalidades de gestión.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 };
 // Componente para Procesos de Evaluación
 const ProcesosEvaluacion = () => {
 return (
 <div className="min-h-screen bg-gray-50 pt-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="flex items-center mb-6">
 <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Procesos de Evaluación</h1>
 <p className="text-gray-600">Gestión de procesos de evaluación y mejora continua</p>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
 <h3 className="text-lg font-semibold text-blue-900 mb-3">Evaluación Independiente</h3>
 <p className="text-blue-700 mb-4">
 Procesos de evaluación externa e independiente para garantizar la transparencia y eficacia de las operaciones.
 </p>
 <div className="flex items-center text-blue-600">
 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="text-sm font-medium">En desarrollo</span>
 </div>
 </div>
 <div className="bg-green-50 rounded-lg p-6 border border-green-200">
 <h3 className="text-lg font-semibold text-green-900 mb-3">Mejora Continua</h3>
 <p className="text-green-700 mb-4">
 Sistema de mejora continua para optimizar procesos y aumentar la eficiencia organizacional.
 </p>
 <div className="flex items-center text-green-600">
 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="text-sm font-medium">En desarrollo</span>
 </div>
 </div>
 </div>
 <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
 <div className="flex items-start">
 <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
 </svg>
 <div>
 <h4 className="text-sm font-semibold text-yellow-900 mb-1">Funcionalidad en Desarrollo</h4>
 <p className="text-sm text-yellow-800">
 Esta sección está actualmente en desarrollo. Pronto estará disponible con todas las funcionalidades para gestionar los procesos de evaluación.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 };
 const AppRouter = () => {
 return (
 <Routes>
 <Route path="/" element={<Home />} />
 {/* Rutas de Direcciones eliminadas en nueva estructura */}
         <Route path="/procesos" element={<ProcesosPage />} />
        <Route path="/procesos/:tipo" element={<ProcesoTipoPage />} />
        <Route path="/procesos/:tipo/:id" element={<ProcesoTipoDetail />} />
        <Route path="/procesos-internos" element={<ProcesosInternosPage />} />
        <Route path="/apoyo" element={<ProcesosApoyoPage />} />
        <Route path="/evaluacion" element={<ProcesosEvaluacion />} />
 <Route path="/identidad" element={<OrgStructure />} />
 <Route path="/documentos" element={<Documentos />} />
 <Route path="/documentos/:id/preview" element={<DocumentoPreview />} />
 <Route path="/administracion" element={
 <ProtectedRoute permission={PERMISSIONS.MANAGE_USERS}>
 <Administracion />
 </ProtectedRoute>
 } />
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 );
 };
 export default AppRouter;