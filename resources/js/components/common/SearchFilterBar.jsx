import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon, FunnelIcon } from '@heroicons/react/24/outline';
import styles from '../../styles/components/SearchFilterBar.module.css';

const SearchFilterBar = ({
    onSearch,
    onFiltersChange,
    placeholder = "Buscar...",
    filters, // sin default [] para evitar referencia nueva en cada render
    searchValue = "",
    loading = false,
    showAdvancedFilters = false,
    advancedFilters = [],
    onAdvancedFilterChange,
    clearAllFilters,
    className = ""
}) => {
    const [searchTerm, setSearchTerm] = useState(searchValue);
    const [activeFilters, setActiveFilters] = useState(Array.isArray(filters) ? filters : []);
    const [showFilters, setShowFilters] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [activeMultiselectFilter, setActiveMultiselectFilter] = useState(null);
    const searchTimeoutRef = useRef(null);
    const searchInputRef = useRef(null);

    // Debounced search
    const debouncedSearch = useCallback((term) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            onSearch(term);
        }, 300);
    }, [onSearch]);

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Handle filter toggle
    const toggleFilter = (filterKey, filterValue) => {
        const newFilters = [...activeFilters];
        const existingIndex = newFilters.findIndex(f => f.key === filterKey && f.value === filterValue);
        
        if (existingIndex >= 0) {
            newFilters.splice(existingIndex, 1);
        } else {
            newFilters.push({ key: filterKey, value: filterValue, label: filterValue });
        }
        
        setActiveFilters(newFilters);
        onFiltersChange(newFilters);
    };

    // Remove filter chip
    const removeFilter = (filterKey, filterValue) => {
        const newFilters = activeFilters.filter(f => !(f.key === filterKey && f.value === filterValue));
        setActiveFilters(newFilters);
        onFiltersChange(newFilters);
    };

    // Clear all filters
    const handleClearAllFilters = () => {
        setActiveFilters([]);
        onFiltersChange([]);
        if (clearAllFilters) {
            clearAllFilters();
        }
    };

    // Handle advanced filter change
    const handleAdvancedFilterChange = (filterKey, value) => {
        console.log('🔍 SearchFilterBar: Cambio de filtro avanzado:', { filterKey, value });
        
        // Limpiar el filtro anterior si existe
        const newFilters = activeFilters.filter(f => f.key !== filterKey);
        
        // Agregar el nuevo filtro solo si tiene valor
        if (value && value !== '' && value !== null && value !== undefined) {
            let label = '';
            
            // Buscar la etiqueta en las opciones del filtro
            const filterConfig = advancedFilters.find(f => f.key === filterKey);
            if (filterConfig && filterConfig.options) {
                const option = filterConfig.options.find(opt => opt.value === value);
                label = option ? option.label : value;
            } else {
                label = value;
            }
            
            newFilters.push({ key: filterKey, value, label });
        }
        
        console.log('🔍 SearchFilterBar: Nuevos filtros:', newFilters);
        setActiveFilters(newFilters);
        onFiltersChange(newFilters);
        
        if (onAdvancedFilterChange) {
            onAdvancedFilterChange(filterKey, value);
        }
    };

    // Handle multiselect filter change
    const handleMultiselectChange = (filterKey, selectedValues) => {
        console.log('🔍 SearchFilterBar: Cambio de multiselect:', { filterKey, selectedValues });
        
        // Limpiar filtros anteriores de este tipo
        const newFilters = activeFilters.filter(f => f.key !== filterKey);
        
        // Agregar cada valor seleccionado como un filtro separado
        selectedValues.forEach(value => {
            const filterConfig = advancedFilters.find(f => f.key === filterKey);
            if (filterConfig && filterConfig.options) {
                const option = filterConfig.options.find(opt => opt.value === value);
                const label = option ? option.label : value;
                newFilters.push({ key: filterKey, value, label });
            }
        });
        
        setActiveFilters(newFilters);
        onFiltersChange(newFilters);
        
        if (onAdvancedFilterChange) {
            onAdvancedFilterChange(filterKey, selectedValues);
        }
    };



    // Focus search on Ctrl/Cmd + K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Update local state when props change (con guardas para evitar loops)
    useEffect(() => {
        if (searchValue !== undefined && searchTerm !== searchValue) {
            setSearchTerm(searchValue);
        }
    }, [searchValue]);

    // Cerrar dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMultiselectFilter && !event.target.closest(`.${styles.multiselectContainer}`)) {
                setActiveMultiselectFilter(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMultiselectFilter]);

    useEffect(() => {
        const incoming = Array.isArray(filters) ? filters : [];
        // Comparación superficial por longitud y pares clave-valor para evitar set innecesario
        const areEqual = () => {
            if (activeFilters.length !== incoming.length) return false;
            for (let i = 0; i < activeFilters.length; i += 1) {
                const a = activeFilters[i];
                const b = incoming[i];
                if (!a || !b || a.key !== b.key || a.value !== b.value) return false;
            }
            return true;
        };
        if (!areEqual()) {
            setActiveFilters(incoming);
        }
    }, [filters]);

    // Contar filtros activos
    const activeFiltersCount = useMemo(() => {
        let count = activeFilters.length;
        
        // Contar filtros avanzados
        advancedFilters?.forEach(filter => {
            if (filter.type === 'multiselect') {
                // Para multiselect, contar elementos seleccionados
                if (Array.isArray(filter.value) && filter.value.length > 0) {
                    count += filter.value.length;
                }
            } else {
                // Para otros tipos, verificar si tiene valor
                if (filter.value && filter.value !== '' && filter.value !== null && filter.value !== undefined) {
                    count += 1;
                }
            }
        });
        
        return count;
    }, [activeFilters, advancedFilters]);

    return (
        <div className={`${styles.searchFilterContainer} ${className}`}>
            {/* Main Search Bar */}
            <div className={styles.searchBarContainer}>
                <div className={`${styles.searchInputWrapper} ${isSearchFocused ? styles.focused : ''}`}>
                    <MagnifyingGlassIcon className={styles.searchIcon} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        placeholder={placeholder}
                        className={styles.searchInput}
                        disabled={loading}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                onSearch('');
                            }}
                            className={styles.clearButton}
                            disabled={loading}
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                    {loading && (
                        <div className={styles.loadingSpinner}>
                            <div className={styles.spinner}></div>
                        </div>
                    )}
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`${styles.filterToggle} ${showFilters ? styles.active : ''} ${activeFiltersCount > 0 ? styles.hasFilters : ''}`}
                    disabled={loading}
                >
                    <FunnelIcon className="w-5 h-5" />
                    <span className={styles.filterButtonText}>
                        {showFilters ? 'Ocultar' : 'Filtros'}
                    </span>
                    {activeFiltersCount > 0 && (
                        <span className={styles.filterCount}>
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Active Filters Chips */}
            {(activeFilters.length > 0 || activeFiltersCount > 0) && (
                <div className={styles.activeFiltersContainer}>
                    <div className={styles.activeFilters}>
                        {activeFilters.map((filter, index) => (
                            <div key={`${filter.key}-${filter.value}-${index}`} className={styles.filterChip}>
                                <span className={styles.filterChipLabel}>
                                    {filter.label || filter.value}
                                </span>
                                <button
                                    onClick={() => removeFilter(filter.key, filter.value)}
                                    className={styles.filterChipRemove}
                                    disabled={loading}
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {advancedFilters.filter(f => f.value && f.value !== '').map((filter) => (
                            <div key={`advanced-${filter.key}`} className={styles.filterChip}>
                                <span className={styles.filterChipLabel}>
                                    {filter.label}: {filter.value}
                                </span>
                                <button
                                    onClick={() => handleAdvancedFilterChange(filter.key, '')}
                                    className={styles.filterChipRemove}
                                    disabled={loading}
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleClearAllFilters}
                        className={styles.clearAllButton}
                        disabled={loading}
                    >
                        Limpiar todo
                    </button>
                </div>
            )}

            {/* Advanced Filters - Inline */}
            {showFilters && showAdvancedFilters && (
                <div className={styles.inlineFilters}>
                    {advancedFilters.map((filter) => (
                        <div key={filter.key} className={styles.inlineFilterItem}>
                            <label className={styles.inlineFilterLabel}>
                                {filter.label}
                            </label>
                            {filter.type === 'select' && (
                                <select
                                    value={filter.value || ''}
                                    onChange={(e) => handleAdvancedFilterChange(filter.key, e.target.value)}
                                    className={styles.inlineFilterSelect}
                                    disabled={loading}
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
                                    value={filter.value || ''}
                                    onChange={(e) => handleAdvancedFilterChange(filter.key, e.target.value)}
                                    className={styles.inlineFilterInput}
                                    placeholder={filter.placeholder || ''}
                                    disabled={loading}
                                />
                            )}
                            {filter.type === 'number' && (
                                <input
                                    type="number"
                                    value={(filter.value ?? '')}
                                    onChange={(e) => handleAdvancedFilterChange(filter.key, e.target.value === '' ? '' : Number(e.target.value))}
                                    className={styles.inlineFilterInput}
                                    placeholder={filter.placeholder || ''}
                                    disabled={loading}
                                />
                            )}
                            {filter.type === 'date' && (
                                <input
                                    type="date"
                                    value={filter.value || ''}
                                    onChange={(e) => handleAdvancedFilterChange(filter.key, e.target.value)}
                                    className={styles.inlineFilterInput}
                                    disabled={loading}
                                />
                            )}
                            {filter.type === 'multiselect' && (
                                <div className={styles.multiselectContainer}>
                                    <div className={styles.multiselectWrapper}>
                                        <div className={styles.multiselectDisplay}>
                                            {filter.value && filter.value.length > 0 ? (
                                                filter.value.map((value, index) => (
                                                    <span key={index} className={styles.multiselectTag}>
                                                        {value}
                                                        <button
                                                            onClick={() => {
                                                                const newValues = filter.value.filter((_, i) => i !== index);
                                                                handleMultiselectChange(filter.key, newValues);
                                                            }}
                                                            className={styles.multiselectTagRemove}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={styles.multiselectPlaceholder}>
                                                    Seleccionar etiquetas...
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setActiveMultiselectFilter(filter.key)}
                                            className={styles.multiselectDropdownButton}
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    {activeMultiselectFilter === filter.key && (
                                        <div className={styles.multiselectDropdown}>
                                            {filter.options.map((option) => (
                                                <label key={option.value} className={styles.multiselectOption}>
                                                    <input
                                                        type="checkbox"
                                                        checked={filter.value && filter.value.includes(option.value)}
                                                        onChange={(e) => {
                                                            const currentValues = filter.value || [];
                                                            const newValues = e.target.checked
                                                                ? [...currentValues, option.value]
                                                                : currentValues.filter(v => v !== option.value);
                                                            handleMultiselectChange(filter.key, newValues);
                                                        }}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Keyboard Shortcut Hint */}
            <div className={styles.keyboardHint}>
                <kbd className={styles.kbd}>⌘</kbd>
                <span>+</span>
                <kbd className={styles.kbd}>K</kbd>
                <span>para buscar</span>
            </div>


        </div>
    );
};

export default SearchFilterBar; 