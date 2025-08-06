import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/components/Dashboard.module.css';

// Componentes modulares
import StatsSection from './dashboard/StatsSection';
import QuickActionsSection from './dashboard/QuickActionsSection';
import DocumentSearchSection from './dashboard/DocumentSearchSection';

// Iconos SVG
import { MyDocumentsIcon, StarIcon, PdfIcon, ExcelIcon, WordIcon } from './icons/DashboardIcons';

const UserDashboard = () => {
    const { user, apiRequest } = useAuth();
    const [stats, setStats] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        const fetchUserDashboardData = async () => {
            try {
                setLoading(true);
                
                // Obtener estadísticas básicas para usuario
                const statsResponse = await apiRequest('/api/documentos/estadisticas');
                if (statsResponse.success) {
                    setStats(statsResponse.data);
                }
            } catch (error) {
                console.error('Error al cargar datos del dashboard de usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDashboardData();
    }, [apiRequest]);

    const handleSearch = async (searchTerm, filters) => {
        try {
            setSearchLoading(true);
            
            // Construir parámetros de búsqueda
            const params = new URLSearchParams({
                search: searchTerm,
                ...filters
            });

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

    const handleDocumentClick = (document) => {
        // Para usuarios, solo pueden ver/descargar documentos
        if (document.url) {
            window.open(document.url, '_blank');
        } else {
            // Si no hay URL, mostrar información del documento
            alert(`Documento: ${document.titulo}\nDirección: ${document.direccion?.nombre}\nProceso: ${document.proceso_apoyo?.nombre}`);
        }
    };

    const handleFilterChange = (filters) => {
        // Los filtros se aplican automáticamente en la búsqueda
        console.log('Filtros aplicados:', filters);
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

    if (loading) {
        return (
            <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p className="text-gray-600 text-lg font-medium mt-4">Cargando dashboard de usuario...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Panel de Usuario</h1>
                <p className={styles.subtitle}>
                    Bienvenido, {user?.name}. Aquí puedes buscar y consultar documentos.
                </p>
            </div>

            {/* Estadísticas básicas para usuario */}
            <StatsSection 
                stats={stats}
                showDownloads={false} // Usuarios no ven estadísticas de descargas
                showDirections={true}
            />

            {/* Búsqueda de documentos */}
            <DocumentSearchSection 
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                searchPlaceholder="Buscar documentos por título, dirección o proceso..."
                showFilters={true}
            />

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
                <div className={styles.recentDocumentsSection}>
                    <div className={styles.recentDocumentsHeader}>
                        <h2 className={styles.recentDocumentsTitle}>Resultados de Búsqueda</h2>
                    </div>
                    <div className={styles.recentDocumentsList}>
                        {searchResults.slice(0, 10).map((doc) => (
                            <div 
                                key={doc.id} 
                                className={styles.documentItem}
                                onClick={() => handleDocumentClick(doc)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={`${styles.documentIcon} ${styles[`documentIcon${doc.tipo_archivo?.toUpperCase()}`] || styles.documentIconDoc}`}>
                                    {getDocumentIcon(doc.tipo_archivo)}
                                </div>
                                <div className={styles.documentInfo}>
                                    <div className={styles.documentTitle}>{doc.titulo}</div>
                                    <div className={styles.documentMeta}>
                                        {doc.direccion?.nombre} • {doc.proceso_apoyo?.nombre}
                                    </div>
                                </div>
                                <div className={styles.documentDate}>
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Acciones rápidas para usuario */}
            <QuickActionsSection 
                user={user}
                showAdmin={false} // Usuarios no ven administración
                showDirections={false} // Usuarios no gestionan direcciones
                showProcesses={false} // Usuarios no gestionan procesos
                showDocuments={true} // Solo pueden acceder a documentos
                customActions={[
                    {
                        title: "Mis Documentos",
                        description: "Ver documentos que he consultado recientemente",
                        icon: <MyDocumentsIcon className="w-8 h-8" />,
                        hash: "mis-documentos",
                        colorClass: "quickActionIconAzul"
                    },
                    {
                        title: "Favoritos",
                        description: "Documentos marcados como favoritos",
                        icon: <StarIcon className="w-8 h-8" />,
                        hash: "favoritos",
                        colorClass: "quickActionIconNaranja"
                    }
                ]}
                onActionClick={(hash) => {
                    if (hash === 'documentos') {
                        // Redirigir a la vista de documentos
                        window.location.hash = 'documentos';
                    } else {
                        // Para otras acciones, mostrar mensaje
                        alert('Funcionalidad en desarrollo');
                    }
                }}
            />
        </div>
    );
};

export default UserDashboard; 