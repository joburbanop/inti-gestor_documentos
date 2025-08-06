import React from 'react';
import styles from '../../styles/components/Dashboard.module.css';
import { 
    DirectionsIcon, 
    ProcessIcon, 
    FolderIcon, 
    AdminIcon, 
    MyDocumentsIcon, 
    StarIcon,
    ArrowRightIcon 
} from '../icons/DashboardIcons';

const QuickActionCard = ({ title, description, icon, hash, colorClass, onClick }) => (
    <button
        onClick={() => onClick ? onClick(hash) : (window.location.hash = hash)}
        className={styles.quickActionCard}
    >
        <div className={styles.quickActionContent}>
            <div className={`${styles.quickActionIcon} ${styles[colorClass]}`}>
                {icon}
            </div>
            <div className={styles.quickActionText}>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            <div className="text-gray-300">
                <ArrowRightIcon className="w-6 h-6" />
            </div>
        </div>
    </button>
);

const QuickActionsSection = ({ 
    user, 
    showAdmin = true, 
    showDirections = true, 
    showProcesses = true, 
    showDocuments = true,
    customActions = [],
    onActionClick 
}) => {
    const defaultActions = [
        ...(showDirections ? [{
            title: "Gestionar Direcciones",
            description: "Administra las direcciones y departamentos de la organización",
            icon: <DirectionsIcon className="w-8 h-8" />,
            hash: "direcciones",
            colorClass: "quickActionIconAzul"
        }] : []),
        ...(showProcesses ? [{
            title: "Procesos de Apoyo",
            description: "Configura y gestiona los procesos de apoyo",
            icon: <ProcessIcon className="w-8 h-8" />,
            hash: "procesos",
            colorClass: "quickActionIconVerde"
        }] : []),
        ...(showDocuments ? [{
            title: "Documentos",
            description: "Accede y gestiona todos los documentos del sistema",
            icon: <FolderIcon className="w-8 h-8" />,
            hash: "documentos",
            colorClass: "quickActionIconNaranja"
        }] : []),
        ...(showAdmin && user?.is_admin ? [{
            title: "Administración",
            description: "Panel de administración del sistema",
            icon: <AdminIcon className="w-8 h-8" />,
            hash: "administracion",
            colorClass: "quickActionIconMorado"
        }] : [])
    ];

    const allActions = [...defaultActions, ...customActions];

    return (
        <div className={styles.quickActionsGrid}>
            {allActions.map((action, index) => (
                <QuickActionCard
                    key={index}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    hash={action.hash}
                    colorClass={action.colorClass}
                    onClick={onActionClick}
                />
            ))}
        </div>
    );
};

export default QuickActionsSection; 