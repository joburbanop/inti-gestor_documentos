<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestFrontendStructure extends Command
{
    protected $signature = 'test:frontend-structure';
    protected $description = 'Verificar que la nueva estructura del frontend esté funcionando correctamente';

    public function handle()
    {
        $this->info('🏗️  Verificando nueva estructura del frontend...');
        $this->newLine();

        // 1. Verificar estructura de directorios
        $this->info('📁 1. Verificando estructura de directorios...');
        $this->checkDirectoryStructure();

        // 2. Verificar servicios de API
        $this->info('🔧 2. Verificando servicios de API...');
        $this->checkApiServices();

        // 3. Verificar hooks personalizados
        $this->info('🎣 3. Verificando hooks personalizados...');
        $this->checkHooks();

        // 4. Verificar utilidades
        $this->info('🛠️  4. Verificando utilidades...');
        $this->checkUtils();

        // 5. Verificar componentes existentes
        $this->info('🧩 5. Verificando componentes existentes...');
        $this->checkExistingComponents();

        $this->newLine();
        $this->info('✅ Verificación de estructura del frontend completada');
    }

    private function checkDirectoryStructure()
    {
        $directories = [
            'resources/js/components/ui',
            'resources/js/components/ui/Button',
            'resources/js/components/ui/Modal',
            'resources/js/components/ui/Form',
            'resources/js/components/ui/Table',
            'resources/js/components/features',
            'resources/js/components/features/auth',
            'resources/js/components/features/documents',
            'resources/js/components/features/processes',
            'resources/js/components/features/dashboard',
            'resources/js/components/layout',
            'resources/js/hooks',
            'resources/js/services',
            'resources/js/services/api',
            'resources/js/services/storage',
            'resources/js/utils',
            'resources/js/pages'
        ];

        foreach ($directories as $dir) {
            if (is_dir($dir)) {
                $this->line("  ✅ {$dir}");
            } else {
                $this->error("  ❌ {$dir} - No existe");
            }
        }
    }

    private function checkApiServices()
    {
        $services = [
            'resources/js/services/api/documents.js',
            'resources/js/services/api/processes.js',
            'resources/js/services/api/auth.js'
        ];

        foreach ($services as $service) {
            if (file_exists($service)) {
                $size = filesize($service);
                $this->line("  ✅ {$service} ({$size} bytes)");
            } else {
                $this->error("  ❌ {$service} - No existe");
            }
        }
    }

    private function checkHooks()
    {
        $hooks = [
            'resources/js/hooks/useDocuments.js',
            'resources/js/hooks/useProcesses.js',
            'resources/js/hooks/useAuth.js'
        ];

        foreach ($hooks as $hook) {
            if (file_exists($hook)) {
                $size = filesize($hook);
                $this->line("  ✅ {$hook} ({$size} bytes)");
            } else {
                $this->error("  ❌ {$hook} - No existe");
            }
        }
    }

    private function checkUtils()
    {
        $utils = [
            'resources/js/utils/validation.js',
            'resources/js/utils/formatters.js',
            'resources/js/utils/constants.js'
        ];

        foreach ($utils as $util) {
            if (file_exists($util)) {
                $size = filesize($util);
                $this->line("  ✅ {$util} ({$size} bytes)");
            } else {
                $this->error("  ❌ {$util} - No existe");
            }
        }
    }

    private function checkExistingComponents()
    {
        $components = [
            'resources/js/components/Documentos.jsx',
            'resources/js/components/Dashboard.jsx',
            'resources/js/components/Login.jsx',
            'resources/js/components/Layout.jsx',
            'resources/js/components/Navbar.jsx',
            'resources/js/components/documentos/DocumentoModal.jsx',
            'resources/js/components/documentos/DocumentCard.jsx',
            'resources/js/components/common/CreateForm.jsx',
            'resources/js/components/common/ProtectedRoute.jsx',
            'resources/js/lib/apiClient.js'
        ];

        foreach ($components as $component) {
            if (file_exists($component)) {
                $size = filesize($component);
                $this->line("  ✅ {$component} ({$size} bytes)");
            } else {
                $this->error("  ❌ {$component} - No existe");
            }
        }
    }
}
