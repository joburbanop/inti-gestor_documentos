import React, { useState, useEffect } from 'react';
import styles from '../../styles/components/Dashboard.module.css';
import { SearchIcon } from '../icons/DashboardIcons';

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