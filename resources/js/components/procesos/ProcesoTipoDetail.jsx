import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getTipoConfig } from './tipoConfig';

const ProcesoTipoDetail = () => {
  const { tipo, id } = useParams();
  const { apiRequest } = useAuth();
  const config = getTipoConfig(tipo);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest(`/procesos/${id}`);
        if (!res?.success) throw new Error(res?.message || 'Error al cargar proceso');
        if (mounted) setItem(res.data);
      } catch (e) {
        if (mounted) setError(e.message || 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiRequest, id]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link to={`/procesos/${config.key}`} className="text-blue-600">← Volver a {config.title}</Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="text-center py-12">Cargando…</div>
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
