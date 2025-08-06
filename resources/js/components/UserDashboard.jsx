import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userStyles from '../styles/components/UserDashboard.module.css';

// Componentes modulares
import HierarchicalFilters from './dashboard/HierarchicalFilters';

// Iconos SVG
import { PdfIcon, ExcelIcon, WordIcon, SearchIcon } from './icons/DashboardIcons';

const UserDashboard = () => {
    const { user, apiRequest } = useAuth();
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        await performSearch();
    };

    const performSearch = async () => {
        try {
            setSearchLoading(true);
            
            // Construir parámetros de búsqueda
            const params = new URLSearchParams();
            
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            
            if (filters.direccionId) {
                params.append('direccion_id', filters.direccionId);
            }
            
            if (filters.procesoId) {
                params.append('proceso_id', filters.procesoId);
            }
            
            if (filters.tipoArchivo) {
                params.append('tipo_archivo', filters.tipoArchivo);
            }
            
            if (filters.sortBy) {
                params.append('sort_by', filters.sortBy);
            }

            const response = await apiRequest(`/api/documentos/buscar?${params}`);
            if (response.success) {
                setSearchResults(response.data);
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        // Realizar búsqueda automática cuando cambien los filtros
        if (newFilters.direccionId || newFilters.procesoId || newFilters.tipoArchivo) {
            setTimeout(() => performSearch(), 500); // Pequeño delay para evitar muchas llamadas
        }
    };

    const handleDocumentClick = (document) => {
        // Para usuarios, solo pueden ver/descargar documentos
        if (document.url) {
            window.open(document.url, '_blank');
        } else {
            // Si no hay URL, mostrar información del documento
            alert(`Documento: ${document.titulo}\nDirección: ${document.direccion?.nombre}\nProceso: ${document.proceso_apoyo?.nombre}`);
        }
    };

    const getDocumentIcon = (fileType) => {
        switch (fileType?.toLowerCase()) {
            case 'pdf':
                return <PdfIcon className="w-6 h-6" />;
            case 'xlsx':
            case 'xls':
                return <ExcelIcon className="w-6 h-6" />;
            case 'doc':
            case 'docx':
                return <WordIcon className="w-6 h-6" />;
            default:
                return <WordIcon className="w-6 h-6" />;
        }
    };

    return (
        <div className={userStyles.userDashboardContainer}>
            {/* Header Simple */}
            <div className={userStyles.userHeader}>
                <h1 className={userStyles.userTitle}>Portal Documental</h1>
                <p className={userStyles.userSubtitle}>
                    Bienvenido, {user?.name}. Busca y encuentra los documentos que necesitas organizados por dirección y proceso.
                </p>
            </div>

            {/* Búsqueda de documentos - Sección principal */}
            <div className={userStyles.userSearchSection}>
                <div className={userStyles.searchHeader}>
                    <h2 className={userStyles.searchTitle}>Buscar Documentos</h2>
                    <p className={userStyles.searchSubtitle}>
                        Encuentra la información que necesitas usando los filtros jerárquicos
                    </p>
                </div>

                {/* Barra de búsqueda */}
                <form onSubmit={handleSearch} className={userStyles.searchForm}>
                    <div className={userStyles.searchInputContainer}>
                        <input
                            type="text"
                            placeholder="¿Qué documento buscas? Escribe el título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={userStyles.searchInput}
                        />
                        <button type="submit" className={userStyles.searchButton}>
                            <SearchIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>

                {/* Filtros Jerárquicos */}
                <HierarchicalFilters 
                    onFilterChange={handleFilterChange}
                    filters={filters}
                    styles={userStyles}
                />
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
                <div className={userStyles.userDocumentResults}>
                    <div className={userStyles.userDocumentResultsHeader}>
                        <h2 className={userStyles.userDocumentResultsTitle}>
                            Documentos Encontrados ({searchResults.length})
                        </h2>
                    </div>
                    <div className={userStyles.userDocumentResultsList}>
                        {searchResults.map((doc) => (
                            <div 
                                key={doc.id} 
                                className={userStyles.userDocumentItem}
                                onClick={() => handleDocumentClick(doc)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={`${userStyles.userDocumentIcon} ${userStyles[`userDocumentIcon${doc.tipo_archivo?.toUpperCase()}`] || userStyles.userDocumentIconDoc}`}>
                                    {getDocumentIcon(doc.tipo_archivo)}
                                </div>
                                <div className={userStyles.userDocumentInfo}>
                                    <div className={userStyles.userDocumentTitle}>{doc.titulo}</div>
                                    <div className={userStyles.userDocumentMeta}>
                                        <span className={userStyles.userDocumentDirection}>{doc.direccion?.nombre}</span>
                                        <span className={userStyles.userDocumentSeparator}>•</span>
                                        <span className={userStyles.userDocumentProcess}>{doc.proceso_apoyo?.nombre}</span>
                                    </div>
                                </div>
                                <div className={userStyles.userDocumentDate}>
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading state */}
            {searchLoading && (
                <div className={userStyles.userLoadingContainer}>
                    <div className={userStyles.userLoadingSpinner}></div>
                    <p className="text-gray-600 text-lg font-medium mt-4">
                        Buscando documentos...
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserDashboard; 