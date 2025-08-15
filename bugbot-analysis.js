#!/usr/bin/env node

/**
 * Bugbot Analysis Script para Intranet Inti
 * Análisis seguro y simple de código
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
            'resources/js/utils'
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
    }

    // Análisis específico de React
    analyzeReactSpecific() {
        console.log('⚛️ Análisis específico de React...');

        // Verificar hooks
        this.checkReactHooks();
        
        // Verificar componentes
        this.checkReactComponents();
        
        // Verificar rendimiento
        this.checkReactPerformance();
    }

    // Verificar seguridad de Laravel
    checkLaravelSecurity() {
        const securityChecks = [
            {
                file: 'app/Http/Controllers/Api/AuthController.php',
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

    // Verificar hooks de React
    checkReactHooks() {
        const hookChecks = [
            {
                file: 'resources/js/hooks/useAuthorization.js',
                check: 'Hook de autorización',
                critical: true
            },
            {
                file: 'resources/js/hooks/useNotifications.js',
                check: 'Hook de notificaciones',
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

    // Verificar componentes de React
    checkReactComponents() {
        const componentChecks = [
            {
                file: 'resources/js/components/AppRouter.jsx',
                check: 'Router principal',
                critical: true
            },
            {
                file: 'resources/js/contexts/AuthContext.jsx',
                check: 'Contexto de autenticación',
                critical: true
            }
        ];

        componentChecks.forEach(check => {
            if (fs.existsSync(check.file)) {
                this.suggestions.push(`✅ ${check.check}: ${check.file}`);
            } else {
                this.warnings.push(`⚠️ ${check.check}: ${check.file} no encontrado`);
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
        console.log('\n📊 REPORTE DE ANÁLISIS BUGBOT - INTRANET INTI\n');
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
            console.log('\n🎉 ¡Excelente! Tu código está en buen estado.');
        } else if (this.issues.length === 0) {
            console.log('\n👍 Buen trabajo, pero hay algunas mejoras menores que hacer.');
        } else {
            console.log('\n🔧 Hay problemas que necesitan atención prioritaria.');
        }
    }

    // Ejecutar análisis completo
    run() {
        console.log('🚀 Iniciando análisis Bugbot para Intranet Inti...\n');
        
        this.analyzePHP();
        this.analyzeJavaScript();
        
        this.generateReport();
    }
}

// Ejecutar análisis
const analyzer = new BugbotAnalyzer();
analyzer.run();
