import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTipoConfig } from '../../hooks/useTipoConfig';
import { getTipoConfig } from '../../utils/tipoConfig';
import { getFileCompatibilityInfo } from '../../utils/fileCompatibility';
import { renderIcon } from '../../utils/iconMapping';
import { EyeIcon, DownloadIcon } from '../icons/CrudIcons';
import adminStyles from '../../styles/components/Administracion.module.css';

const ProcesoTipoDetail = () => {
  const { tipo, id } = useParams();
  const { apiRequest } = useAuth();
  const { configs, loading: configLoading, error: configError } = useTipoConfig();
  const config = getTipoConfig(tipo, configs);
  const [item, setItem] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar información del proceso
        const res = await apiRequest(`/procesos-generales/${id}`);
        if (!res?.success) throw new Error(res?.message || 'Error al cargar proceso');
        
        // Cargar todos los documentos del proceso
        const docsRes = await apiRequest(`/procesos-generales/${id}/documentos`);
        if (!docsRes?.success) throw new Error(docsRes?.message || 'Error al cargar documentos');
        
        if (mounted) {
          setItem(res.data);
          setDocumentos(docsRes.data.documentos || []);
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
  }, [apiRequest, id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewDocument = (documento) => {
    window.open(`/documentos/${documento.id}/preview`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadDocument = async (documento) => {
    try {
      const response = await apiRequest(`/documents/${documento.id}/download`);
      if (response.success) {
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = documento.nombre_archivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error al descargar documento:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link to={`/procesos/${config.key}`} className="text-blue-600 hover:text-blue-800">
            ← Volver a {config.title}
          </Link>
        </div>

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
          <div className="space-y-6">
            {/* Información del Proceso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{item.nombre}</h1>
                {item.codigo && (
                  <div className="text-gray-500 text-lg mt-1">{item.codigo}</div>
                )}
                {item.descripcion && (
                  <p className="text-gray-700 mt-4 text-lg leading-relaxed">{item.descripcion}</p>
                )}
              </div>

              {/* Estadísticas */}
              <div className="mt-6">
                <div className="bg-green-50 p-4 rounded-lg inline-block">
                  <div className="text-2xl font-bold text-green-600">
                    {documentos.length}
                  </div>
                  <div className="text-green-800">Documentos</div>
                </div>
              </div>
            </div>

            {/* Documentos del Proceso */}
            {documentos && documentos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Documentos del Proceso ({documentos.length})</h2>
                  <Link 
                    to={`/documentos?proceso_general_id=${item.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver todos los documentos →
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {documentos.map((documento) => {
                    const extension = documento.nombre_archivo?.split('.').pop();
                    const compatibilityInfo = getFileCompatibilityInfo(extension, null);
                    
                    return (
                      <div key={documento.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="text-gray-600 flex-shrink-0">
                                <div className="w-8 h-8 flex items-center justify-center">
                                  {compatibilityInfo.icon}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{documento.titulo}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                  <span>{documento.nombre_archivo}</span>
                                  <span>•</span>
                                  <span>{formatDate(documento.created_at)}</span>
                                  {documento.proceso_interno && (
                                    <>
                                      <span>•</span>
                                      <span>{documento.proceso_interno.nombre}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              compatibilityInfo.isViewable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {compatibilityInfo.isViewable ? 'Visualizable' : 'Descarga requerida'}
                            </span>
                            
                            <div className={adminStyles.actionButtons}>
                              <button
                                onClick={() => handleViewDocument(documento)}
                                disabled={!compatibilityInfo.isViewable}
                                className={`${adminStyles.editButton} ${!compatibilityInfo.isViewable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={compatibilityInfo.isViewable ? "Ver documento" : compatibilityInfo.message}
                              >
                                <EyeIcon className="w-6 h-6" />
                              </button>
                              <button
                                onClick={() => handleDownloadDocument(documento)}
                                className={adminStyles.deleteButton}
                                title="Descargar documento"
                              >
                                <DownloadIcon className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mensaje si no hay documentos */}
            {(!documentos || documentos.length === 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4 text-gray-400">
                    <div className="w-16 h-16 flex items-center justify-center">
                      {getFileCompatibilityInfo('pdf', null).icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                  <p className="text-gray-500 mb-4">
                    Este proceso aún no tiene documentos asociados.
                  </p>
                  <Link 
                    to="/documentos"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Ir a Documentos
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcesoTipoDetail;