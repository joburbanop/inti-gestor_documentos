import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTipoConfig } from '../../hooks/useTipoConfig';
import { getTipoConfig } from '../../utils/tipoConfig';

console.log('📄 [ProcesoTipoDetail.jsx] Importando componente ProcesoTipoDetail');

const ProcesoTipoDetail = () => {
  console.log('📄 [ProcesoTipoDetail.jsx] Renderizando ProcesoTipoDetail');
  
  const { tipo, id } = useParams();
  const { apiRequest } = useAuth();
  const { configs, loading: configLoading, error: configError } = useTipoConfig();
  const config = getTipoConfig(tipo, configs);

  console.log('🔍 [ProcesoTipoDetail.jsx] Tipo:', tipo, 'ID:', id, 'Configuración:', config);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 [ProcesoTipoDetail.jsx] useEffect - Cargando detalles del proceso:', id);
    
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest(`/procesos/${id}`);
        if (!res?.success) throw new Error(res?.message || 'Error al cargar proceso');
        if (mounted) {
          console.log('✅ [ProcesoTipoDetail.jsx] Proceso cargado:', res.data);
          setItem(res.data);
        }
      } catch (e) {
        if (mounted) {
          console.log('❌ [ProcesoTipoDetail.jsx] Error al cargar proceso:', e.message);
          setError(e.message || 'Error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiRequest, id]);

  console.log('🎨 [ProcesoTipoDetail.jsx] Renderizando JSX con configuración:', config.title);
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link to={`/procesos/${config.key}`} className="text-blue-600">← Volver a {config.title}</Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {configLoading ? (
            <div className="text-center py-12">Cargando configuración...</div>
          ) : configError ? (
            <div className="text-center py-12 text-red-600">Error cargando configuración: {configError}</div>
          ) : loading ? (
            <div className="text-center py-12">Cargando proceso...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{String(error)}</div>
          ) : !item ? (
            <div className="text-center py-12 text-gray-500">No encontrado</div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">{item.nombre}</h1>
              {item.codigo && <div className="text-gray-500">{item.codigo}</div>}
              {item.descripcion && <p className="text-gray-700 mt-4">{item.descripcion}</p>}
              {/* Slots futuros: documentos, KPIs, tabs, etc. */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcesoTipoDetail;
