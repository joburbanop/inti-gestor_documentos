import React from 'react';
import { 
    DirectionsIcon, 
    ProcessIcon, 
    FolderIcon, 
    AdminIcon, 
    MyDocumentsIcon, 
    StarIcon,
    ArrowRightIcon 
} from '../icons/DashboardIcons';

const QuickActionCard = React.memo(({ title, description, icon, hash, colorClass, onClick, styles = {} }) => (
    <button
        onClick={() => onClick ? onClick(hash) : (window.location.hash = hash)}
        className={styles.quickActionCard || ''}
    >
        <div className={styles.quickActionContent || ''}>
            <div className={`${styles.quickActionIcon || ''} ${styles[colorClass] || ''}`}>
                {icon}
            </div>
            <div className={styles.quickActionText || ''}>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            <div className="text-gray-300">
                <ArrowRightIcon className="w-6 h-6" />
            </div>
        </div>
    </button>
));

const QuickActionsSection = ({ 
    user, 
    showAdmin = true, 
    showDirections = true, 
    showProcesses = true, 
    showDocuments = true,
    customActions = [],
    onActionClick,
    isUserDashboard = false,
    title = "Acciones Rápidas",
    subtitle = "Accede rápidamente a las funciones principales",
    actionsConfig = [],
    styles = {},
    className = ""
}) => {
    // Configuración por defecto si no se proporciona actionsConfig
    const defaultActions = [
        ...(showDirections ? [{
            title: isUserDashboard ? "Explorar por Dirección" : "Gestionar Direcciones",
            description: isUserDashboard 
                ? "Encuentra todos los documentos organizados por dirección administrativa de la empresa"
                : "Organiza la estructura organizacional de la empresa. Define las direcciones administrativas que conforman el organigrama institucional.",
            icon: <DirectionsIcon className="w-8 h-8" />,
            hash: "direcciones",
            colorClass: "quickActionIconAzul"
        }] : []),
        ...(showProcesses ? [{
            title: isUserDashboard ? "Explorar por Proceso" : "Procesos de Apoyo",
            description: isUserDashboard 
                ? "Explora documentos específicos por proceso de apoyo dentro de cada dirección"
                : "Configura los procesos de apoyo dentro de cada dirección. Define los flujos de trabajo y procedimientos administrativos.",
            icon: <ProcessIcon className="w-8 h-8" />,
            hash: "procesos",
            colorClass: "quickActionIconVerde"
        }] : []),
        ...(showDocuments ? [{
            title: isUserDashboard ? "Todos los Documentos" : "Gestión Documental",
            description: isUserDashboard 
                ? "Accede a todos los documentos y formatos disponibles en el sistema organizados por dirección y proceso"
                : "Administra los documentos y formatos generados por las direcciones y procesos. Organiza, categoriza y facilita el acceso a la información institucional.",
            icon: <FolderIcon className="w-8 h-8" />,
            hash: "documentos",
            colorClass: "quickActionIconNaranja"
        }] : []),
        ...(showAdmin && user?.is_admin ? [{
            title: "Administración del Sistema",
            description: "Configuración general del sistema, gestión de usuarios, permisos y parámetros de la intranet documental.",
            icon: <AdminIcon className="w-8 h-8" />,
            hash: "administracion",
            colorClass: "quickActionIconMorado"
        }] : [])
    ];

    const finalActions = actionsConfig.length > 0 ? actionsConfig : [...defaultActions, ...customActions];

    return (
        <div className={`${styles.quickActionsSection || ''} ${className}`}>
            {(title || subtitle) && (
                <div className={styles.quickActionsHeader || ''}>
                    {title && <h2 className={styles.quickActionsTitle || ''}>{title}</h2>}
                    {subtitle && <p className={styles.quickActionsSubtitle || ''}>{subtitle}</p>}
                </div>
            )}
            
            <div className={styles.quickActionsGrid || ''}>
                {finalActions.map((action, index) => (
                    <QuickActionCard
                        key={index}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        hash={action.hash}
                        colorClass={action.colorClass}
                        onClick={onActionClick}
                        styles={styles}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuickActionsSection; 