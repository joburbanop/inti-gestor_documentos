import React, { useState } from 'react';

const PaginationTest = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(2);
    const [total, setTotal] = useState(16);
    const [perPage] = useState(10);
    const [loading, setLoading] = useState(false);

    const goToPage = async (page) => {
        console.log('🔍 PaginationTest: Navegando a página', page);
        setLoading(true);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCurrentPage(page);
        setLoading(false);
        console.log('🔍 PaginationTest: Página actualizada a', page);
    };

    const goToNextPage = async () => {
        console.log('🔍 PaginationTest: goToNextPage - currentPage:', currentPage, 'lastPage:', lastPage);
        if (currentPage < lastPage) {
            console.log('🔍 PaginationTest: Navegando a página siguiente:', currentPage + 1);
            await goToPage(currentPage + 1);
        } else {
            console.log('🔍 PaginationTest: Ya estamos en la última página');
        }
    };

    const goToPrevPage = async () => {
        if (currentPage > 1) {
            await goToPage(currentPage - 1);
        }
    };

    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, total);

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Prueba de Paginación</h2>
            <p>Página {currentPage} de {lastPage}</p>
            <p>Mostrando {startItem}-{endItem} de {total} documentos</p>
            
            <div style={{ margin: '2rem 0' }}>
                <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1 || loading}
                    style={{
                        padding: '0.75rem 1.25rem',
                        margin: '0 0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        background: currentPage === 1 ? '#f3f4f6' : '#ffffff',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Anterior
                </button>
                
                <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1 || loading}
                    style={{
                        padding: '0.75rem',
                        margin: '0 0.25rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        background: currentPage === 1 ? '#1F448B' : '#ffffff',
                        color: currentPage === 1 ? '#ffffff' : '#374151',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    1
                </button>
                
                <button
                    onClick={() => goToPage(2)}
                    disabled={currentPage === 2 || loading}
                    style={{
                        padding: '0.75rem',
                        margin: '0 0.25rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        background: currentPage === 2 ? '#1F448B' : '#ffffff',
                        color: currentPage === 2 ? '#ffffff' : '#374151',
                        cursor: currentPage === 2 ? 'not-allowed' : 'pointer'
                    }}
                >
                    2
                </button>
                
                <button
                    onClick={goToNextPage}
                    disabled={currentPage === lastPage || loading}
                    style={{
                        padding: '0.75rem 1.25rem',
                        margin: '0 0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        background: currentPage === lastPage ? '#f3f4f6' : '#ffffff',
                        cursor: currentPage === lastPage ? 'not-allowed' : 'pointer'
                    }}
                >
                    Siguiente
                </button>
            </div>
            
            {loading && <p>🔄 Cargando...</p>}
            
            <div style={{ marginTop: '2rem' }}>
                <h3>Estado actual:</h3>
                <ul>
                    <li>Página actual: {currentPage}</li>
                    <li>Última página: {lastPage}</li>
                    <li>Total: {total}</li>
                    <li>Por página: {perPage}</li>
                    <li>Loading: {loading ? 'Sí' : 'No'}</li>
                </ul>
            </div>
        </div>
    );
};

export default PaginationTest;
