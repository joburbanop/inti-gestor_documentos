import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FileUploadInfo = ({ className = '' }) => {
  const { apiRequest } = useAuth();
  const [fileLimits, setFileLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileLimits = async () => {
      try {
        const response = await apiRequest('/file-limits', {
          method: 'GET',
          ignoreAuthErrors: true
        });
        
        if (response && response.max_file_size) {
          setFileLimits(response);
        }
      } catch (error) {
        console.warn('No se pudieron obtener los límites de archivo:', error);
        // Valores por defecto
        setFileLimits({
          max_file_size: '50MB',
          allowed_extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip', 'rar']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFileLimits();
  }, [apiRequest]);

  if (loading) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        <div className="animate-pulse">Cargando información de archivos...</div>
      </div>
    );
  }

  if (!fileLimits) {
    return null;
  }

  return (
    <div className={`text-xs text-gray-500 bg-gray-50 p-2 rounded border ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">Límites de archivo:</span>
      </div>
      <div className="space-y-1">
        <div>• Tamaño máximo: <span className="font-semibold">{fileLimits.max_file_size}</span></div>
        <div>• Extensiones permitidas: <span className="font-semibold">{fileLimits.allowed_extensions?.join(', ')}</span></div>
      </div>
    </div>
  );
};

export default FileUploadInfo;
