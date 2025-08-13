import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';
import Direcciones from './Direcciones';
import ProcesosApoyo from './ProcesosApoyo';
import Documentos from './Documentos';
import DocumentoPreview from './documentos/DocumentoPreview';
import Administracion from './Administracion';
import CreateDireccion from './crud/CreateDireccion';
import OrgStructure from './common/OrgStructure';
import { INTILED_COLORS } from '../config/colors';

const Home = () => {
    const { user } = useAuth();
    return user?.is_admin ? <Dashboard /> : <UserDashboard />;
};

// Componente wrapper para manejar la navegación desde rutas React Router
const CreateDireccionWrapper = () => {
    const { user } = useAuth();
    
    // No interferir con la navegación desde este componente
    // Dejar que CreateDireccion maneje su propia redirección

    return <CreateDireccion />;
};

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/direcciones" element={<Direcciones />} />
            <Route path="/procesos" element={<ProcesosApoyo />} />
            <Route path="/identidad" element={<OrgStructure />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/documentos/:id/preview" element={<DocumentoPreview />} />
            <Route path="/administracion" element={<Administracion />} />
            <Route path="/direcciones/crear" element={<CreateDireccion />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter; 