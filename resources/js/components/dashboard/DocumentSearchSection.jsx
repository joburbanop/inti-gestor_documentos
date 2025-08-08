import React, { useState, useEffect } from 'react';
import styles from '../../styles/components/Dashboard.module.css';

// Iconos modernos y legibles
const SearchIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FilterIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
    </svg>
);

const DocumentIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TypeIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0a4 4 0 004-4v-4a2 2 0 012-2h4a2 2 0 012 2v4a4 4 0 01-4 4h-4z" />
    </svg>
);

const DocumentSearchSection = ({ 
    onSearch, 
    onFilterChange, 
    filters = {},
    searchPlaceholder = "Buscar documentos...",
    showFilters = true 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localFilters, setLocalFilters] = useState(filters);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch && onSearch(searchTerm, localFilters);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange && onFilterChange(newFilters);
    };

    return (
        <div className={styles.documentSearchSection}>
            <div className={styles.searchHeader}>
                <h2 className={styles.searchTitle}>Buscar Documentos</h2>
                <p className={styles.searchSubtitle}>
                    Encuentra los documentos que necesitas de forma rápida y ordenada
                </p>
            </div>

            {/* Barra de búsqueda */}
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchInputContainer}>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <SearchIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Filtros */}
            {showFilters && (
                <div className={styles.filtersContainer}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Tipo de Archivo</label>
                        <select
                            value={localFilters.fileType || ''}
                            onChange={(e) => handleFilterChange('fileType', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">Todos los tipos</option>
                            <option value="pdf">PDF</option>
                            <option value="doc">DOC</option>
                            <option value="xlsx">XLSX</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Ordenar por</label>
                        <select
                            value={localFilters.sortBy || 'created_at'}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="created_at">Fecha de creación</option>
                            <option value="titulo">Título</option>
                            <option value="updated_at">Última modificación</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Orden</label>
                        <select
                            value={localFilters.sortOrder || 'desc'}
                            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="desc">Descendente</option>
                            <option value="asc">Ascendente</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentSearchSection; 