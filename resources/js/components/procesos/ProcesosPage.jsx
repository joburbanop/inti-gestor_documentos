import React from 'react'; import { useSearchParams, Navigate } from 'react-router-dom';
 import ProcesoTipoPage from './ProcesoTipoPage';
 const ProcesosPage = () => {
 const [searchParams] = useSearchParams();
 const tipo = searchParams.get('tipo');
 // Si no hay tipo especificado, redirigir a una página por defecto o mostrar todos
 if (!tipo) {
 return <Navigate to="/procesos?tipo=estrategico" replace />;
 }
 // Pasar el tipo como parámetro para que ProcesoTipoPage lo maneje
 return <ProcesoTipoPage tipo={tipo} />;
 };
 export default ProcesosPage;