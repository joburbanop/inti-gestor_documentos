import React, { useState } from 'react';

const AdvancedSearchFilters = ({ 
    filters = {}, 
    advancedFilters = [], 
    onFilterChange, 
    onClearAll,
    styles = {}
}) => {
    const [activeFilters, setActiveFilters] = useState([]);

    const handleFilterChange = (filterKey, value) => {
        // Actualizar filtros activos
        const newActiveFilters = [...activeFilters];
        const existingIndex = newActiveFilters.findIndex(f => f.key === filterKey);
        
        if (value && value !== '') {
            if (existingIndex >= 0) {
                newActiveFilters[existingIndex] = { key: filterKey, value, label: getFilterLabel(filterKey, value) };
            } else {
                newActiveFilters.push({ key: filterKey, value, label: getFilterLabel(filterKey, value) });
            }
        } else {
            if (existingIndex >= 0) {
                newActiveFilters.splice(existingIndex, 1);
            }
        }
        
        setActiveFilters(newActiveFilters);
        onFilterChange(filterKey, value);
    };

    const getFilterLabel = (key, value) => {
        const filter = advancedFilters.find(f => f.key === key);
        if (filter?.type === 'select') {
            const option = filter.options?.find(opt => opt.value === value);
            return option?.label || value;
        }
        return value;
    };

    const removeFilter = (filterKey) => {
        handleFilterChange(filterKey, '');
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
        onClearAll();
    };

    return (
        <div className={styles.advancedFiltersContainer || ''}>
            {/* Filtros activos */}
            {activeFilters.length > 0 && (
                <div className={styles.activeFiltersSection || ''}>
                    <div className={styles.activeFiltersHeader || ''}>
                        <h4 className={styles.activeFiltersTitle || ''}>Filtros Activos</h4>
                        <button
                            onClick={clearAllFilters}
                            className={styles.clearAllFiltersButton || ''}
                        >
                            Limpiar todo
                        </button>
                    </div>
                    <div className={styles.activeFiltersList || ''}>
                        {activeFilters.map((filter) => (
                            <div key={filter.key} className={styles.activeFilterChip || ''}>
                                <span className={styles.activeFilterLabel || ''}>
                                    {filter.label}
                                </span>
                                <button
                                    onClick={() => removeFilter(filter.key)}
                                    className={styles.activeFilterRemove || ''}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid de filtros avanzados */}
            <div className={styles.advancedFiltersGrid || ''}>
                {advancedFilters.map((filter) => (
                    <div key={filter.key} className={styles.advancedFilterItem || ''}>
                        <label className={styles.advancedFilterLabel || ''}>
                            {filter.label}
                        </label>
                        
                        {filter.type === 'select' && (
                            <select
                                value={filters[filter.key] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                className={styles.advancedFilterSelect || ''}
                            >
                                {filter.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        
                        {filter.type === 'text' && (
                            <input
                                type="text"
                                value={filters[filter.key] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                placeholder={filter.placeholder || ''}
                                className={styles.advancedFilterInput || ''}
                            />
                        )}
                        
                        {filter.type === 'date' && (
                            <input
                                type="date"
                                value={filters[filter.key] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                className={styles.advancedFilterInput || ''}
                            />
                        )}
                        
                        {filter.type === 'number' && (
                            <input
                                type="number"
                                value={filters[filter.key] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                placeholder={filter.placeholder || ''}
                                className={styles.advancedFilterInput || ''}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Información de ayuda */}
            <div className={styles.advancedFiltersHelp || ''}>
                <div className={styles.helpIcon || ''}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className={styles.helpContent || ''}>
                    <p className={styles.helpText || ''}>
                        <strong>Consejo:</strong> Combina múltiples filtros para encontrar exactamente lo que buscas. 
                        Por ejemplo: "Proyecto Tumaco" + "Factura" + "PDF" + "Este mes".
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedSearchFilters;
