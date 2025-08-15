import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/Dashboard.module.css';

// Iconos SVG para tipos de documento
const PdfIcon = ({ className = "" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        <path d="M7,12H9V14H7V12M7,16H9V18H7V16M11,12H17V14H11V12M11,16H15V18H11V16Z"/>
    </svg>
);

const ImageIcon = ({ className = "" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
    </svg>
);

const DocumentIcon = ({ className = "" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        <path d="M7,12H17V14H7V12M7,16H17V18H7V16Z"/>
    </svg>
);

const SpreadsheetIcon = ({ className = "" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        <path d="M7,12H9V14H7V12M7,16H9V18H7V16M11,12H17V14H11V12M11,16H15V18H11V16Z"/>
        <path d="M7,8H9V10H7V8M11,8H17V10H11V8Z"/>
    </svg>
);

const PresentationIcon = ({ className = "" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        <path d="M7,8H17V10H7V8Z"/>
        <path d="M7,12H17V14H7V12Z"/>
        <path d="M7,16H17V18H7V16Z"/>
        <path d="M9,6H15V8H9V6Z"/>
    </svg>
);

const ArchiveIcon = ({ className = "" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20,6H16V4A2,2 0 0,0 14,2H10A2,2 0 0,0 8,4V6H4A2,2 0 0,0 2,8V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V8A2,2 0 0,0 20,6M10,4H14V6H10V4M20,19H4V8H20V19Z"/>
        <path d="M7,10H17V12H7V10M7,14H17V16H7V14M7,18H17V20H7V18Z"/>
    </svg>
);

const VideoIcon = ({ className = "" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
    </svg>
);

const AudioIcon = ({ className = "" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,3V12.26C11.5,12.09 11,12 10.5,12C7.46,12 5,14.46 5,17.5C5,20.54 7.46,23 10.5,23C13.54,23 16,20.54 16,17.5V6H20V3H12Z"/>
        <path d="M12,5V15.5C11.5,15.3 11,15.2 10.5,15.2C8.57,15.2 7,16.77 7,18.7C7,20.63 8.57,22.2 10.5,22.2C12.43,22.2 14,20.63 14,18.7V7H17V5H12Z"/>
    </svg>
);

const ExtensionFilter = ({ 
    onFilterChange, 
    selectedExtensions = [], 
    selectedTypes = [],
    customStyles = null 
}) => {
    const { apiRequest } = useAuth();
    const [extensiones, setExtensiones] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState({});
    const [estadisticas, setEstadisticas] = useState({});
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    // Usar estilos personalizados si se proporcionan, sino usar los por defecto
    const currentStyles = customStyles || styles;

    const tiposDocumentoConfig = {
        'pdf': { 
            nombre: 'PDF', 
            icono: PdfIcon, 
            color: '#dc2626' 
        },
        'imagen': { 
            nombre: 'Imágenes', 
            icono: ImageIcon, 
            color: '#059669' 
        },
        'documento': { 
            nombre: 'Documentos', 
            icono: DocumentIcon, 
            color: '#2563eb' 
        },
        'hoja_calculo': { 
            nombre: 'Hojas de Cálculo', 
            icono: SpreadsheetIcon, 
            color: '#7c3aed' 
        },
        'presentacion': { 
            nombre: 'Presentaciones', 
            icono: PresentationIcon, 
            color: '#ea580c' 
        },
        'archivo_comprimido': { 
            nombre: 'Archivos Comprimidos', 
            icono: ArchiveIcon, 
            color: '#0891b2' 
        },
        'video': { 
            nombre: 'Videos', 
            icono: VideoIcon, 
            color: '#be185d' 
        },
        'audio': { 
            nombre: 'Audio', 
            icono: AudioIcon, 
            color: '#65a30d' 
        }
    };

    const cargarExtensiones = async () => {
        try {
            const response = await apiRequest('/api/documentos/extensiones-disponibles');
            
            if (response.success) {
                setExtensiones(response.data.extensiones);
                setTiposDocumento(response.data.tipos_documento);
            }
        } catch (error) {
            console.error('Error al cargar extensiones:', error);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/api/documentos/estadisticas-extensiones');
            
            if (response.success) {
                setEstadisticas(response.data);
                }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const recargarDatos = async () => {
        await cargarExtensiones();
        await cargarEstadisticas();
    };

    useEffect(() => {
        cargarExtensiones();
        cargarEstadisticas();
        
        // Recargar datos cada 30 segundos para mantener estadísticas actualizadas
        const interval = setInterval(() => {
            cargarEstadisticas();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const handleTipoChange = (tipo) => {
        const extensionesDelTipo = tiposDocumento[tipo] || [];
        const nuevasExtensiones = [...selectedExtensions];
        
        // Verificar si el tipo ya está seleccionado
        const tipoYaSeleccionado = selectedTypes.includes(tipo);
        
        if (tipoYaSeleccionado) {
            // Si ya está seleccionado, lo removemos
            const extensionesDelTipo = tiposDocumento[tipo] || [];
            const nuevasExtensiones = selectedExtensions.filter(ext => !extensionesDelTipo.includes(ext));
            const nuevosTipos = selectedTypes.filter(t => t !== tipo);
            
            onFilterChange({
                extensiones: nuevasExtensiones,
                tipos: nuevosTipos
            });
        } else {
            // Si no está seleccionado, lo agregamos
            const extensionesDelTipo = tiposDocumento[tipo] || [];
            const nuevasExtensiones = [...selectedExtensions];
            
            extensionesDelTipo.forEach(ext => {
                if (!nuevasExtensiones.includes(ext)) {
                    nuevasExtensiones.push(ext);
                }
            });

            onFilterChange({
                extensiones: nuevasExtensiones,
                tipos: [...selectedTypes, tipo]
            });
        }
    };

    const handleExtensionChange = (extension) => {
        const nuevasExtensiones = selectedExtensions.includes(extension)
            ? selectedExtensions.filter(ext => ext !== extension)
            : [...selectedExtensions, extension];

        onFilterChange({
            extensiones: nuevasExtensiones,
            tipos: selectedTypes
        });
    };

    const limpiarFiltros = () => {
        onFilterChange({
            extensiones: [],
            tipos: []
        });
    };

    const obtenerEstadistica = (extension) => {
        if (!estadisticas.extensiones_detalladas) return 0;
        const stat = estadisticas.extensiones_detalladas.find(s => s.extension === extension);
        return stat ? stat.total : 0;
    };

    const obtenerEstadisticaTipo = (tipo) => {
        if (!estadisticas.por_tipo_documento) return 0;
        return estadisticas.por_tipo_documento[tipo] || 0;
    };

    const extensionesPopulares = estadisticas.extensiones_populares || [];

    return (
        <div className={currentStyles.extensionFilterContainer}>
            <div className={currentStyles.extensionFilterHeader}>
                <div className={currentStyles.extensionFilterTitleSection}>
                    <h3>Filtrar por tipo de archivo</h3>
                    {!isExpanded && (
                        <span className={currentStyles.extensionFilterHint}>
                            Haz clic para expandir
                        </span>
                    )}
                </div>
                <div className={currentStyles.extensionFilterActions}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={currentStyles.toggleFilterBtn}
                        title={isExpanded ? "Contraer filtros" : "Expandir filtros"}
                    >
                        {isExpanded ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={recargarDatos}
                        className={currentStyles.refreshBtn}
                        title="Actualizar estadísticas"
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                    </button>
                    {loading && (
                        <span className={currentStyles.loadingIndicator}>
                            Actualizando...
                        </span>
                    )}

                    {(selectedExtensions.length > 0 || selectedTypes.length > 0) && (
                        <button
                            onClick={limpiarFiltros}
                            className={currentStyles.clearFiltersBtn}
                            title="Limpiar filtros"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <>
                    {/* Tipos de documento principales */}
                    <div className={currentStyles.tiposDocumentoGrid}>
                        {Object.entries(tiposDocumentoConfig).map(([tipo, config]) => {
                            const estaSeleccionado = selectedTypes.includes(tipo);
                            const total = obtenerEstadisticaTipo(tipo);
                            
                            return (
                                                        <button
                            key={tipo}
                            onClick={() => handleTipoChange(tipo)}
                            className={`${currentStyles.tipoDocumentoBtn} ${estaSeleccionado ? currentStyles.selected : ''}`}
                            style={{ borderColor: config.color }}
                            disabled={total === 0}
                        >
                            <span className={currentStyles.tipoIcono}>
                                <config.icono className="w-8 h-8" style={{ color: config.color }} />
                            </span>
                            <span className={currentStyles.tipoNombre}>{config.nombre}</span>
                            {estaSeleccionado && (
                                <span className={currentStyles.selectionIndicator}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                </span>
                            )}
                        </button>
                            );
                        })}
                    </div>

                    {/* Extensiones populares */}
                    {extensionesPopulares.length > 0 && (
                        <div className={currentStyles.extensionesPopulares}>
                            <div className={currentStyles.extensionesGrid}>
                                {extensionesPopulares.slice(0, 8).map((stat) => {
                                    const estaSeleccionado = selectedExtensions.includes(stat.extension);
                                    return (
                                                                        <button
                                    key={stat.extension}
                                    onClick={() => handleExtensionChange(stat.extension)}
                                    className={`${currentStyles.extensionBtn} ${estaSeleccionado ? currentStyles.selected : ''}`}
                                >
                                    <span className={currentStyles.extensionName}>.{stat.extension}</span>
                                    {estaSeleccionado && (
                                        <span className={currentStyles.selectionIndicator}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                        </span>
                                    )}
                                </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Indicador de filtros activos */}
            {(selectedExtensions.length > 0 || selectedTypes.length > 0) && (
                <div className={currentStyles.filtrosActivos}>
                    <span>Filtros activos:</span>
                    {selectedTypes.map(tipo => (
                        <span key={tipo} className={currentStyles.filtroActivo}>
                            {tiposDocumentoConfig[tipo]?.nombre || tipo}
                        </span>
                    ))}
                    {selectedExtensions.map(extension => (
                        <span key={extension} className={currentStyles.filtroActivo}>
                            .{extension}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExtensionFilter;
