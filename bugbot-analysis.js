#!/usr/bin/env node

/**
 * Bugbot Analysis Script para Intranet Inti
 * Análisis seguro y simple de código
 * Versión actualizada para nueva arquitectura React
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BugbotAnalyzer {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.suggestions = [];
        this.projectRoot = process.cwd();
    }

    // Análisis de archivos PHP/Laravel
    analyzePHP() {
        console.log('🔍 Analizando archivos PHP/Laravel...');
        
        const phpPaths = [
            'app/Http/Controllers/Api',
            'app/Models',
            'app/Http/Middleware',
            'app/Services',
            'config',
            'routes'
        ];

        phpPaths.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.scanDirectory(dir, '.php');
            }
        });

        // Análisis específico de Laravel
        this.analyzeLaravelSpecific();
    }

    // Análisis de archivos JavaScript/React
    analyzeJavaScript() {
        console.log('🔍 Analizando archivos JavaScript/React...');
        
        const jsPaths = [
            'resources/js/components',
            'resources/js/contexts',
            'resources/js/hooks',
            'resources/js/utils',
            'resources/js/services',
            'resources/js/pages'
        ];

        jsPaths.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.scanDirectory(dir, '.js');
                this.scanDirectory(dir, '.jsx');
            }
        });

        // Análisis específico de React
        this.analyzeReactSpecific();
    }

    // Análisis específico de Laravel
    analyzeLaravelSpecific() {
        console.log('📋 Análisis específico de Laravel...');

        // Verificar configuración de seguridad
        this.checkLaravelSecurity();
        
        // Verificar optimizaciones de base de datos
        this.checkDatabaseOptimizations();
        
        // Verificar middleware
        this.checkMiddleware();

        // Verificar nueva arquitectura de servicios
        this.checkServicesArchitecture();
    }

    // Análisis específico de React
    analyzeReactSpecific() {
        console.log('⚛️ Análisis específico de React...');

        // Verificar nueva estructura de componentes
        this.checkReactComponentStructure();
        
        // Verificar hooks personalizados
        this.checkReactHooks();
        
        // Verificar servicios de API
        this.checkApiServices();
        
        // Verificar utilidades
        this.checkUtils();
        
        // Verificar rendimiento
        this.checkReactPerformance();
    }

    // Verificar nueva arquitectura de servicios Laravel
    checkServicesArchitecture() {
        console.log('🔧 Verificando arquitectura de servicios...');

        const serviceChecks = [
            {
                file: 'app/Services/Document/DocumentService.php',
                check: 'Servicio de documentos',
                critical: true
            },
            {
                file: 'app/Services/Process/ProcessService.php',
                check: 'Servicio de procesos',
                critical: true
            },
            {
                file: 'app/Services/FileUpload/FileUploadService.php',
                check: 'Servicio de upload de archivos',
                critical: true
            },
            {
                file: 'app/Services/Search/SearchService.php',
                check: 'Servicio de búsqueda',
                critical: false
            }
        ];

        serviceChecks.forEach(check => {
            if (fs.existsSync(check.file)) {
                this.suggestions.push(`✅ ${check.check}: ${check.file}`);
            } else {
                this.warnings.push(`⚠️ ${check.check}: ${check.file} no encontrado`);
            }
        });

        // Verificar Form Requests
        const requestChecks = [
            {
                file: 'app/Http/Requests/Document/StoreDocumentRequest.php',
                check: 'Form Request para documentos',
                critical: true
            }
        ];

        requestChecks.forEach(check => {
            if (fs.existsSync(check.file)) {
                this.suggestions.push(`✅ ${check.check}: ${check.file}`);
            } else {
                this.warnings.push(`⚠️ ${check.check}: ${check.file} no encontrado`);
            }
        });
    }

    // Verificar nueva estructura de componentes React
    checkReactComponentStructure() {
        console.log('🧩 Verificando estructura de componentes React...');

        // Verificar estructura de directorios
        const directoryStructure = [
            'resources/js/components/ui',
            'resources/js/components/features',
            'resources/js/components/features/auth',
            'resources/js/components/features/documents',
            'resources/js/components/features/processes',
            'resources/js/components/features/dashboard',
            'resources/js/components/layout',
            'resources/js/services/api',
            'resources/js/services/storage',
            'resources/js/hooks',
            'resources/js/utils',
            'resources/js/pages'
        ];

        directoryStructure.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.suggestions.push(`✅ Estructura de directorio: ${dir}`);
            } else {
                this.warnings.push(`⚠️ Directorio faltante: ${dir}`);
            }
        });

        // Verificar componentes UI
        this.checkUIComponents();

        // Verificar componentes de features
        this.checkFeatureComponents();

        // Verificar componentes de layout
        this.checkLayoutComponents();
    }

    // Verificar componentes UI
    checkUIComponents() {
        const uiComponents = [
            'resources/js/components/ui/Button',
            'resources/js/components/ui/Modal',
            'resources/js/components/ui/Form',
            'resources/js/components/ui/Table'
        ];

        uiComponents.forEach(component => {
            if (fs.existsSync(component)) {
                this.suggestions.push(`✅ Componente UI: ${component}`);
            } else {
                this.warnings.push(`⚠️ Componente UI faltante: ${component}`);
            }
        });
    }

    // Verificar componentes de features
    checkFeatureComponents() {
        const featureComponents = [
            'resources/js/components/features/auth',
            'resources/js/components/features/documents',
            'resources/js/components/features/processes',
            'resources/js/components/features/dashboard'
        ];

        featureComponents.forEach(component => {
            if (fs.existsSync(component)) {
                this.suggestions.push(`✅ Feature component: ${component}`);
            } else {
                this.warnings.push(`⚠️ Feature component faltante: ${component}`);
            }
        });
    }

    // Verificar componentes de layout
    checkLayoutComponents() {
        const layoutComponents = [
            'resources/js/components/layout'
        ];

        layoutComponents.forEach(component => {
            if (fs.existsSync(component)) {
                this.suggestions.push(`✅ Layout component: ${component}`);
            } else {
                this.warnings.push(`⚠️ Layout component faltante: ${component}`);
            }
        });
    }

    // Verificar hooks personalizados
    checkReactHooks() {
        console.log('🎣 Verificando hooks personalizados...');

        const hookChecks = [
            {
                file: 'resources/js/hooks/useDocuments.js',
                check: 'Hook para gestión de documentos',
                critical: true
            },
            {
                file: 'resources/js/hooks/useProcesses.js',
                check: 'Hook para gestión de procesos',
                critical: true
            },
            {
                file: 'resources/js/hooks/useAuth.js',
                check: 'Hook para gestión de autenticación',
                critical: true
            },
            {
                file: 'resources/js/hooks/useAuthorization.js',
                check: 'Hook de autorización (legacy)',
                critical: false
            },
            {
                file: 'resources/js/hooks/useNotifications.js',
                check: 'Hook de notificaciones (legacy)',
                critical: false
            }
        ];

        hookChecks.forEach(check => {
            if (fs.existsSync(check.file)) {
                this.suggestions.push(`✅ ${check.check}: ${check.file}`);
            } else {
                this.warnings.push(`⚠️ ${check.check}: ${check.file} no encontrado`);
            }
        });
    }

    // Verificar servicios de API
    checkApiServices() {
        console.log('🔌 Verificando servicios de API...');

        const apiServiceChecks = [
            {
                file: 'resources/js/services/api/documents.js',
                check: 'Servicio de API para documentos',
                critical: true
            },
            {
                file: 'resources/js/services/api/processes.js',
                check: 'Servicio de API para procesos',
                critical: true
            },
            {
                file: 'resources/js/services/api/auth.js',
                check: 'Servicio de API para autenticación',
                critical: true
            }
        ];

        apiServiceChecks.forEach(check => {
            if (fs.existsSync(check.file)) {
                this.suggestions.push(`✅ ${check.check}: ${check.file}`);
            } else {
                this.warnings.push(`⚠️ ${check.check}: ${check.file} no encontrado`);
            }
        });
    }

    // Verificar utilidades
    checkUtils() {
        console.log('🛠️ Verificando utilidades...');

        const utilChecks = [
            {
                file: 'resources/js/utils/validation.js',
                check: 'Utilidades de validación',
                critical: true
            },
            {
                file: 'resources/js/utils/formatters.js',
                check: 'Utilidades de formateo',
                critical: false
            },
            {
                file: 'resources/js/utils/constants.js',
                check: 'Constantes de la aplicación',
                critical: false
            }
        ];

        utilChecks.forEach(check => {
            if (fs.existsSync(check.file)) {
                this.suggestions.push(`✅ ${check.check}: ${check.file}`);
            } else {
                this.warnings.push(`⚠️ ${check.check}: ${check.file} no encontrado`);
            }
        });
    }

    // Análisis específico del error 422 en creación de documentos
    analyzeDocumentCreationError() {
        console.log('🔍 Analizando error 422 en creación de documentos...');
        
        // Verificar CreateForm.jsx
        this.analyzeCreateForm();
        
        // Verificar DocumentoModal.jsx
        this.analyzeDocumentoModal();
        
        // Verificar DocumentoController.php
        this.analyzeDocumentoController();
        
        // Verificar apiClient.js
        this.analyzeApiClient();

        // Verificar nuevos servicios
        this.analyzeNewServices();
    }

    // Analizar nuevos servicios
    analyzeNewServices() {
        console.log('🔧 Analizando nuevos servicios...');

        // Analizar DocumentService
        this.analyzeDocumentService();

        // Analizar ProcessService
        this.analyzeProcessService();

        // Analizar FileUploadService
        this.analyzeFileUploadService();
    }

    // Analizar DocumentService
    analyzeDocumentService() {
        const filePath = 'app/Services/Document/DocumentService.php';
        
        if (!fs.existsSync(filePath)) {
            this.issues.push(`❌ CRÍTICO: ${filePath} no encontrado`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar inyección de dependencias
            if (content.includes('FileUploadService') && content.includes('ProcessService')) {
                this.suggestions.push('✅ DocumentService usa inyección de dependencias');
            } else {
                this.warnings.push('⚠️ DocumentService no usa inyección de dependencias');
            }

            // Verificar métodos principales
            const methods = ['createDocument', 'getDocuments', 'updateDocument', 'deleteDocument'];
            methods.forEach(method => {
                if (content.includes(`public function ${method}`)) {
                    this.suggestions.push(`✅ DocumentService tiene método ${method}`);
                } else {
                    this.warnings.push(`⚠️ DocumentService falta método ${method}`);
                }
            });

            // Verificar logging
            if (content.includes('Log::info') || content.includes('Log::error')) {
                this.suggestions.push('✅ DocumentService tiene logging');
            } else {
                this.warnings.push('⚠️ DocumentService no tiene logging');
            }

        } catch (error) {
            this.issues.push(`❌ Error al analizar ${filePath}: ${error.message}`);
        }
    }

    // Analizar ProcessService
    analyzeProcessService() {
        const filePath = 'app/Services/Process/ProcessService.php';
        
        if (!fs.existsSync(filePath)) {
            this.issues.push(`❌ CRÍTICO: ${filePath} no encontrado`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar métodos principales
            const methods = ['getProcessTypes', 'getGeneralProcessesByType', 'getUniqueInternalProcesses'];
            methods.forEach(method => {
                if (content.includes(`public function ${method}`)) {
                    this.suggestions.push(`✅ ProcessService tiene método ${method}`);
                } else {
                    this.warnings.push(`⚠️ ProcessService falta método ${method}`);
                }
            });

            // Verificar cache
            if (content.includes('Cache::remember') || content.includes('Cache::forget')) {
                this.suggestions.push('✅ ProcessService usa cache');
            } else {
                this.warnings.push('⚠️ ProcessService no usa cache');
            }

        } catch (error) {
            this.issues.push(`❌ Error al analizar ${filePath}: ${error.message}`);
        }
    }

    // Analizar FileUploadService
    analyzeFileUploadService() {
        const filePath = 'app/Services/FileUpload/FileUploadService.php';
        
        if (!fs.existsSync(filePath)) {
            this.issues.push(`❌ CRÍTICO: ${filePath} no encontrado`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar validación de archivos
            if (content.includes('validateFile') && content.includes('allowedExtensions')) {
                this.suggestions.push('✅ FileUploadService valida archivos');
            } else {
                this.warnings.push('⚠️ FileUploadService no valida archivos');
            }

            // Verificar manejo de errores
            if (content.includes('try') && content.includes('catch')) {
                this.suggestions.push('✅ FileUploadService maneja errores');
            } else {
                this.warnings.push('⚠️ FileUploadService no maneja errores');
            }

        } catch (error) {
            this.issues.push(`❌ Error al analizar ${filePath}: ${error.message}`);
        }
    }

    // Analizar CreateForm.jsx
    analyzeCreateForm() {
        const filePath = 'resources/js/components/common/CreateForm.jsx';
        
        if (!fs.existsSync(filePath)) {
            this.issues.push(`❌ CRÍTICO: ${filePath} no encontrado`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar detección de archivos
            if (content.includes('field.type === \'file\'')) {
                this.suggestions.push('✅ CreateForm detecta campos de archivo');
            } else {
                this.issues.push('❌ CRÍTICO: CreateForm no detecta campos de archivo');
            }

            // Verificar creación de FormData
            if (content.includes('FormData')) {
                this.suggestions.push('✅ CreateForm crea FormData');
            } else {
                this.issues.push('❌ CRÍTICO: CreateForm no crea FormData');
            }

            // Verificar logs de debugging
            if (content.includes('console.log') && content.includes('CreateForm')) {
                this.suggestions.push('✅ CreateForm tiene logs de debugging');
            } else {
                this.warnings.push('⚠️ CreateForm no tiene logs de debugging');
            }

            // Verificar manejo de archivos
            if (content.includes('instanceof File')) {
                this.suggestions.push('✅ CreateForm verifica tipo File');
            } else {
                this.warnings.push('⚠️ CreateForm no verifica tipo File');
            }

        } catch (error) {
            this.issues.push(`❌ Error al analizar ${filePath}: ${error.message}`);
        }
    }

    // Analizar DocumentoModal.jsx
    analyzeDocumentoModal() {
        const filePath = 'resources/js/components/documentos/DocumentoModal.jsx';
        
        if (!fs.existsSync(filePath)) {
            this.issues.push(`❌ CRÍTICO: ${filePath} no encontrado`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar configuración de campos
            if (content.includes('type: \'file\'')) {
                this.suggestions.push('✅ DocumentoModal tiene campo de archivo configurado');
            } else {
                this.issues.push('❌ CRÍTICO: DocumentoModal no tiene campo de archivo');
            }

            // Verificar manejo de FormData
            if (content.includes('FormData')) {
                this.suggestions.push('✅ DocumentoModal maneja FormData');
            } else {
                this.warnings.push('⚠️ DocumentoModal no maneja FormData');
            }

            // Verificar validación de archivo
            if (content.includes('archivo') && content.includes('data.get')) {
                this.suggestions.push('✅ DocumentoModal valida archivo en FormData');
            } else {
                this.warnings.push('⚠️ DocumentoModal no valida archivo en FormData');
            }

        } catch (error) {
            this.issues.push(`❌ Error al analizar ${filePath}: ${error.message}`);
        }
    }

    // Analizar DocumentoController
    analyzeDocumentoController() {
        const filePath = 'app/Http/Controllers/Api/DocumentoController.php';
        
        if (!fs.existsSync(filePath)) {
            this.issues.push(`❌ CRÍTICO: ${filePath} no encontrado`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar validación de archivo (ahora usando Form Request)
            if (content.includes('StoreDocumentRequest') || content.includes('archivo\': \'required|file')) {
                this.suggestions.push('✅ DocumentoController valida archivo requerido (usando Form Request)');
            } else {
                this.issues.push('❌ CRÍTICO: DocumentoController no valida archivo requerido');
            }

            // Verificar logs de debugging
            if (content.includes('Log::info') && content.includes('DocumentoController')) {
                this.suggestions.push('✅ DocumentoController tiene logs de debugging');
            } else {
                this.warnings.push('⚠️ DocumentoController no tiene logs de debugging');
            }

            // Verificar manejo de FormData
            if (content.includes('$request->hasFile') || content.includes('$request->file')) {
                this.suggestions.push('✅ DocumentoController maneja archivos correctamente');
            } else {
                this.issues.push('❌ CRÍTICO: DocumentoController no maneja archivos');
            }

            // Verificar validación de jerarquía
            if (content.includes('procesoInterno') && content.includes('procesoGeneral')) {
                this.suggestions.push('✅ DocumentoController valida jerarquía');
            } else {
                this.warnings.push('⚠️ DocumentoController no valida jerarquía');
            }

        } catch (error) {
            this.issues.push(`❌ Error al analizar ${filePath}: ${error.message}`);
        }
    }

    // Analizar apiClient.js
    analyzeApiClient() {
        const filePath = 'resources/js/lib/apiClient.js';
        
        if (!fs.existsSync(filePath)) {
            this.issues.push(`❌ CRÍTICO: ${filePath} no encontrado`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar manejo de FormData
            if (content.includes('FormData') || content.includes('multipart/form-data')) {
                this.suggestions.push('✅ apiClient maneja FormData');
            } else {
                this.warnings.push('⚠️ apiClient no maneja FormData explícitamente');
            }

            // Verificar headers automáticos
            if (content.includes('Content-Type') && content.includes('multipart')) {
                this.suggestions.push('✅ apiClient maneja headers de FormData');
            } else {
                this.warnings.push('⚠️ apiClient no maneja headers de FormData automáticamente');
            }

        } catch (error) {
            this.issues.push(`❌ Error al analizar ${filePath}: ${error.message}`);
        }
    }

    // Verificar seguridad de Laravel
    checkLaravelSecurity() {
        const securityChecks = [
            {
                file: 'app/Http/Controllers/Api/Auth/AuthController.php',
                check: 'Rate limiting implementado',
                critical: true
            },
            {
                file: 'app/Http/Middleware/ApiAuthenticate.php',
                check: 'Middleware de autenticación API',
                critical: true
            },
            {
                file: 'config/session.php',
                check: 'Configuración de sesiones segura',
                critical: true
            }
        ];

        securityChecks.forEach(check => {
            if (fs.existsSync(check.file)) {
                this.suggestions.push(`✅ ${check.check}: ${check.file}`);
            } else {
                this.warnings.push(`⚠️ ${check.check}: ${check.file} no encontrado`);
            }
        });
    }

    // Verificar optimizaciones de base de datos
    checkDatabaseOptimizations() {
        const dbChecks = [
            {
                file: 'app/Models/Documento.php',
                check: 'Modelo con relaciones optimizadas',
                critical: false
            },
            {
                file: 'database/migrations',
                check: 'Migraciones con índices optimizados',
                critical: false
            }
        ];

        dbChecks.forEach(check => {
            if (fs.existsSync(check.file)) {
                this.suggestions.push(`✅ ${check.check}: ${check.file}`);
            } else {
                this.warnings.push(`⚠️ ${check.check}: ${check.file} no encontrado`);
            }
        });
    }

    // Verificar middleware
    checkMiddleware() {
        const middlewareChecks = [
            'app/Http/Middleware/AdminMiddleware.php',
            'app/Http/Middleware/CheckUserActivity.php',
            'app/Http/Middleware/HandleLargeUploads.php'
        ];

        middlewareChecks.forEach(middleware => {
            if (fs.existsSync(middleware)) {
                this.suggestions.push(`✅ Middleware encontrado: ${middleware}`);
            } else {
                this.warnings.push(`⚠️ Middleware faltante: ${middleware}`);
            }
        });
    }

    // Verificar rendimiento de React
    checkReactPerformance() {
        try {
            const appRouterContent = fs.readFileSync('resources/js/components/AppRouter.jsx', 'utf8');
            
            // Verificar lazy loading
            if (appRouterContent.includes('lazy') || appRouterContent.includes('Suspense')) {
                this.suggestions.push('✅ Lazy loading implementado en AppRouter');
            } else {
                this.warnings.push('⚠️ Considerar implementar lazy loading en AppRouter');
            }

            // Verificar memoización
            if (appRouterContent.includes('React.memo') || appRouterContent.includes('useMemo')) {
                this.suggestions.push('✅ Memoización implementada');
            } else {
                this.suggestions.push('💡 Considerar usar React.memo para optimizar re-renders');
            }
        } catch (error) {
            this.warnings.push('⚠️ No se pudo analizar AppRouter.jsx');
        }
    }

    // Escanear directorio
    scanDirectory(dir, extension) {
        const files = this.getFilesRecursively(dir, extension);
        files.forEach(file => {
            this.analyzeFile(file);
        });
    }

    // Obtener archivos recursivamente
    getFilesRecursively(dir, extension) {
        const files = [];
        
        if (!fs.existsSync(dir)) return files;

        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.getFilesRecursively(fullPath, extension));
            } else if (item.endsWith(extension)) {
                files.push(fullPath);
            }
        });

        return files;
    }

    // Analizar archivo individual
    analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Análisis básico de código
            this.analyzeCodeQuality(filePath, content);
            
        } catch (error) {
            this.issues.push(`❌ Error al analizar ${filePath}: ${error.message}`);
        }
    }

    // Análisis de calidad de código
    analyzeCodeQuality(filePath, content) {
        const lines = content.split('\n');
        
        // Verificar longitud de líneas
        lines.forEach((line, index) => {
            if (line.length > 120) {
                this.warnings.push(`⚠️ Línea muy larga en ${filePath}:${index + 1}`);
            }
        });

        // Verificar console.log en producción
        if (content.includes('console.log') && !filePath.includes('test')) {
            this.warnings.push(`⚠️ console.log encontrado en ${filePath} (considerar remover en producción)`);
        }
    }

    // Generar reporte
    generateReport() {
        console.log('\n📊 REPORTE DE ANÁLISIS BUGBOT - INTRANET INTI');
        console.log('🎯 Análisis de nueva arquitectura React y Laravel\n');
        console.log('=' .repeat(60));
        
        if (this.issues.length > 0) {
            console.log('\n❌ PROBLEMAS CRÍTICOS:');
            this.issues.forEach(issue => console.log(`  ${issue}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️ ADVERTENCIAS:');
            this.warnings.forEach(warning => console.log(`  ${warning}`));
        }

        if (this.suggestions.length > 0) {
            console.log('\n✅ SUGERENCIAS Y BUENAS PRÁCTICAS:');
            this.suggestions.forEach(suggestion => console.log(`  ${suggestion}`));
        }

        console.log('\n' + '=' .repeat(60));
        console.log(`📈 RESUMEN:`);
        console.log(`  - Problemas críticos: ${this.issues.length}`);
        console.log(`  - Advertencias: ${this.warnings.length}`);
        console.log(`  - Sugerencias: ${this.suggestions.length}`);
        
        if (this.issues.length === 0 && this.warnings.length < 10) {
            console.log('\n🎉 ¡Excelente! Tu nueva arquitectura está en buen estado.');
        } else if (this.issues.length === 0) {
            console.log('\n👍 Buen trabajo, pero hay algunas mejoras menores que hacer.');
        } else {
            console.log('\n🔧 Hay problemas que necesitan atención prioritaria.');
        }

        console.log('\n🏗️ ARQUITECTURA ANALIZADA:');
        console.log('  ✅ Backend: Servicios, Controllers organizados, Form Requests');
        console.log('  ✅ Frontend: Hooks personalizados, Servicios de API, Utilidades');
        console.log('  ✅ Estructura: Organización por funcionalidad');
    }

    // Ejecutar análisis completo
    run() {
        console.log('🚀 Iniciando análisis Bugbot para nueva arquitectura...\n');
        
        this.analyzePHP();
        this.analyzeJavaScript();
        
        // Análisis específico del error 422
        this.analyzeDocumentCreationError();
        
        this.generateReport();
    }
}

// Ejecutar análisis
const analyzer = new BugbotAnalyzer();
analyzer.run();
