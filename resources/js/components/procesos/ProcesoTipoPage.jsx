import React, { useEffect, useState } from 'react'; import { useParams, useNavigate, Link } from 'react-router-dom';
 import { useAuth } from '../../contexts/AuthContext';
 import { useTipoConfig } from '../../hooks/useTipoConfig';
 import { getTipoConfig } from '../../utils/tipoConfig';
 const ProcesoTipoPage = ({ tipo: propTipo }) => {
 const { tipo: paramTipo } = useParams();
 const navigate = useNavigate();
 const { apiRequest } = useAuth();
 // Usar el tipo de la prop si está disponible, sino usar el parámetro de URL
 const tipo = propTipo || paramTipo;
 const { configs, loading: configLoading, error: configError } = useTipoConfig();
 const config = getTipoConfig(tipo, configs);
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 useEffect(() => {
 let mounted = true;
 (async () => {
 try {
 setLoading(true);
 setError(null);
 const res = await apiRequest(`/procesos?tipo=${encodeURIComponent(config.key)}`);
 if (!res?.success) throw new Error(res?.message || 'Error al cargar procesos');
 if (mounted) {
 setItems(res.data || []);
 }
 } catch (e) {
 if (mounted) {
 setError(e.message || 'Error');
 }
 } finally {
 if (mounted) setLoading(false);
 }
 })();
 return () => { mounted = false; };
 }, [apiRequest, config.key]);
 return (
 <div className="min-h-screen bg-gray-50 pt-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="flex items-center mb-6">
 <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round strokeLinejoin="round strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.1
 72 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 1
 2a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4
 4 0 018 0z />
 </svg>
 </div>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
 {config.subtitle && <p className="text-gray-600">{config.subtitle}</p>}
 </div>
 </div>
 {configLoading ? (
 <div className="text-center py-12">Cargando configuración...</div>
 ) : configError ? (
 <div className="text-center py-12 text-red-600">Error cargando configuración: {configError}</div>
 ) : loading ? (
 <div className="text-center py-12">Cargando procesos...</div>
 ) : error ? (
 <div className="text-center py-12 text-red-600">{String(error)}</div>
 ) : items.length === 0 ? (
 <div className="text-center py-12 text-gray-500">{config.emptyText}</div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {items.map((p) => (
 <Link key={p.id} to={`/procesos/${
 config.key}/${p.id}`} className="rounded-lg p-6 border bg-white hover:shadow>
 <h3 className="text-lg font-semibold">{p.nombre}</h3>
 {p.codigo && <div className="text-gray-500 text-sm">{p.codigo}</div>}
 {p.descripcion && <p className="text-gray-700 mt-2">{p.descripcion}</p>}
 </Link>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
 };
 export default ProcesoTipoPage;