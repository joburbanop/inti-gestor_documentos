import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import styles from '../../styles/components/SearchFilterBar.module.css';

const SearchFilterBar = ({
    onSearch,
    onFiltersChange,
    placeholder = "Buscar...",
    filters = [],
    searchValue = "",
    loading = false,
    showAdvancedFilters = false,
    advancedFilters = [],
    onAdvancedFilterChange,
    className = ""
}) => {
    const [searchTerm, setSearchTerm] = useState(searchValue);
    const [activeFilters, setActiveFilters] = useState(filters);
    const [showFilters, setShowFilters] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
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
    const clearAllFilters = () => {
        setActiveFilters([]);
        onFiltersChange([]);
    };

    // Handle advanced filter change
    const handleAdvancedFilterChange = (filterKey, value) => {
        if (onAdvancedFilterChange) {
            onAdvancedFilterChange(filterKey, value);
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

    // Update local state when props change
    useEffect(() => {
        setSearchTerm(searchValue);
    }, [searchValue]);

    useEffect(() => {
        setActiveFilters(filters);
    }, [filters]);

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
                    className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
                    disabled={loading}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className={styles.filterButtonText}>
                        {showFilters ? 'Ocultar' : 'Filtros'}
                    </span>
                </button>
            </div>

            {/* Active Filters Chips */}
            {activeFilters.length > 0 && (
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
                    </div>
                    <button
                        onClick={clearAllFilters}
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
                                    <option value="">Todos</option>
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