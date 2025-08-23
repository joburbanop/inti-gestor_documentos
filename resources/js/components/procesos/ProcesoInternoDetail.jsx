import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFileCompatibilityInfo } from '../../utils/fileCompatibility';
import { renderIcon } from '../../utils/iconMapping';
import { EyeIcon, DownloadIcon } from '../icons/CrudIcons';
import adminStyles from '../../styles/components/Administracion.module.css';

const ProcesoInternoDetail = () => {
  const { id } = useParams();
  const { apiRequest } = useAuth();
  const [procesoInterno, setProcesoInterno] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar información del proceso interno y sus documentos
        const res = await apiRequest(`/procesos-internos/${id}/documentos`);
        if (!res?.success) throw new Error(res?.message || 'Error al cargar proceso interno');
        
        if (mounted) {
          setProcesoInterno(res.data.proceso_interno);
          setDocumentos(res.data.documentos || []);
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

  const handleViewDocument = async (documento) => {
    try {
      console.log('🔄 [ProcesoInternoDetail] Intentando ver documento:', documento.id);
      
      const response = await apiRequest(`/documents/${documento.id}/preview`);
      
      if (response.success && response.data) {
        const data = response.data;
        
        if (data.viewable) {
          // Abrir en nueva pestaña
          window.open(data.url, '_blank');
          console.log('✅ [ProcesoInternoDetail] Documento abierto en nueva pestaña');
        } else {
          // Descargar archivo
          const link = document.createElement('a');
          link.href = data.url;
          link.download = documento.nombre_archivo || documento.nombre_original || 'documento';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log('✅ [ProcesoInternoDetail] Descarga iniciada');
        }
      } else {
        console.error('❌ [ProcesoInternoDetail] Error en respuesta de vista previa:', response.message);
        alert('Error al abrir el documento: ' + (response.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ [ProcesoInternoDetail] Error al ver documento:', error);
      alert('Error al abrir el documento: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleDownloadDocument = async (documento) => {
    try {
      console.log('🔄 [ProcesoInternoDetail] Intentando descargar documento:', documento.id);
      
      const response = await apiRequest(`/documents/${documento.id}/download`, {
        method: 'POST'
      });
      
      if (response.success) {
        console.log('✅ [ProcesoInternoDetail] Descarga exitosa, creando enlace de descarga');
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = documento.nombre_archivo || documento.nombre_original || 'documento';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ [ProcesoInternoDetail] Descarga iniciada');
      } else {
        console.error('❌ [ProcesoInternoDetail] Error en respuesta de descarga:', response.message);
        alert('Error al descargar el documento: ' + (response.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ [ProcesoInternoDetail] Error al descargar documento:', error);
      alert('Error al descargar el documento: ' + (error.message || 'Error desconocido'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">Cargando proceso interno...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-red-600">{String(error)}</div>
        </div>
      </div>
    );
  }

  if (!procesoInterno) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-gray-500">Proceso interno no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link to="/procesos-internos" className="text-blue-600 hover:text-blue-800">
            ← Volver a Procesos Internos
          </Link>
        </div>

        <div className="space-y-6">
          {/* Header del proceso interno */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  {renderIcon(procesoInterno.icono || 'folder', "w-6 h-6")}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{procesoInterno.nombre}</h1>
                  {procesoInterno.descripcion && (
                    <p className="text-gray-600">{procesoInterno.descripcion}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de documentos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Documentos ({documentos.length})
              </h2>
            </div>

            {documentos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay documentos en este proceso interno
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentos.map((documento) => {
                  const fileInfo = getFileCompatibilityInfo(documento.tipo_archivo);
                  
                  return (
                    <div key={documento.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${fileInfo.bgColor}`}>
                            {renderIcon(fileInfo.icon, "w-5 h-5 text-white")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {documento.titulo}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {formatDate(documento.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewDocument(documento)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Ver documento"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(documento)}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="Descargar documento"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Tamaño: {Math.round(documento.tamaño_archivo / 1024)} KB</span>
                          <span>Descargas: {documento.contador_descargas}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {documento.tipo_archivo}
                          </span>
                          {fileInfo.viewable && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Visualizable
                            </span>
                          )}
                        </div>

                        {documento.confidencialidad && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Confidencialidad: {documento.confidencialidad}
                            </span>
                          </div>
                        )}

                        {documento.tipo_proceso && (
                          <div className="text-xs text-gray-500">
                            Tipo: {documento.tipo_proceso.titulo}
                          </div>
                        )}

                        {documento.proceso_general && (
                          <div className="text-xs text-gray-500">
                            Área: {documento.proceso_general.nombre}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcesoInternoDetail;
