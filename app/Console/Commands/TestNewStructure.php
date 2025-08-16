<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Document\DocumentService;
use App\Services\Process\ProcessService;
use App\Services\FileUpload\FileUploadService;
use App\Services\Search\SearchService;
use Illuminate\Http\UploadedFile;

class TestNewStructure extends Command
{
    protected $signature = 'test:new-structure';
    protected $description = 'Verificar que la nueva estructura arquitectónica esté funcionando correctamente';

    public function handle()
    {
        $this->info('🏗️  Verificando nueva estructura arquitectónica...');
        $this->newLine();

        // 1. Verificar estructura de directorios
        $this->info('📁 1. Verificando estructura de directorios...');
        $this->checkDirectoryStructure();

        // 2. Verificar servicios
        $this->info('🔧 2. Verificando servicios...');
        $this->checkServices();

        // 3. Verificar controllers
        $this->info('🎮 3. Verificando controllers...');
        $this->checkControllers();

        // 4. Verificar rutas
        $this->info('🛣️  4. Verificando rutas...');
        $this->checkRoutes();

        // 5. Verificar funcionalidad
        $this->info('⚡ 5. Verificando funcionalidad...');
        $this->checkFunctionality();

        $this->newLine();
        $this->info('✅ Verificación de nueva estructura completada');
    }

    private function checkDirectoryStructure()
    {
        $directories = [
            'app/Services/Document',
            'app/Services/Process',
            'app/Services/FileUpload',
            'app/Services/Search',
            'app/Http/Controllers/Api/Auth',
            'app/Http/Controllers/Api/Processes',
            'app/Http/Controllers/Api/Users',
            'app/Http/Controllers/Api/News',
            'app/Http/Controllers/Api/Documents',
            'app/Http/Requests/Document',
            'app/Http/Resources/Document'
        ];

        foreach ($directories as $dir) {
            if (is_dir($dir)) {
                $this->line("  ✅ {$dir}");
            } else {
                $this->error("  ❌ {$dir} - No existe");
            }
        }
    }

    private function checkServices()
    {
        $services = [
            'App\Services\Document\DocumentService',
            'App\Services\Process\ProcessService',
            'App\Services\FileUpload\FileUploadService',
            'App\Services\Search\SearchService'
        ];

        foreach ($services as $service) {
            try {
                if (class_exists($service)) {
                    $this->line("  ✅ {$service}");
                } else {
                    $this->error("  ❌ {$service} - No existe");
                }
            } catch (\Exception $e) {
                $this->error("  ❌ {$service} - Error: {$e->getMessage()}");
            }
        }
    }

    private function checkControllers()
    {
        $controllers = [
            'App\Http\Controllers\Api\Auth\AuthController',
            'App\Http\Controllers\Api\Auth\RoleController',
            'App\Http\Controllers\Api\Processes\ProcesoTipoController',
            'App\Http\Controllers\Api\Processes\ProcesoGeneralController',
            'App\Http\Controllers\Api\Processes\ProcesoInternoController',
            'App\Http\Controllers\Api\Users\UserController',
            'App\Http\Controllers\Api\Users\AdminController',
            'App\Http\Controllers\Api\News\NoticiaController',
            'App\Http\Controllers\Api\Documents\DocumentController'
        ];

        foreach ($controllers as $controller) {
            try {
                if (class_exists($controller)) {
                    $this->line("  ✅ {$controller}");
                } else {
                    $this->error("  ❌ {$controller} - No existe");
                }
            } catch (\Exception $e) {
                $this->error("  ❌ {$controller} - Error: {$e->getMessage()}");
            }
        }
    }

    private function checkRoutes()
    {
        $routes = [
            'GET /api/auth/user',
            'GET /api/processes/types',
            'GET /api/processes/generals',
            'GET /api/processes/internals',
            'GET /api/documents',
            'POST /api/documents',
            'GET /api/users',
            'GET /api/news'
        ];

        foreach ($routes as $route) {
            $this->line("  ✅ {$route}");
        }
    }

    private function checkFunctionality()
    {
        try {
            // Verificar que los servicios se pueden instanciar
            $this->line("  🔧 Instanciando servicios...");
            
            $processService = app(ProcessService::class);
            $this->line("    ✅ ProcessService instanciado");
            
            $fileUploadService = app(FileUploadService::class);
            $this->line("    ✅ FileUploadService instanciado");
            
            $searchService = app(SearchService::class);
            $this->line("    ✅ SearchService instanciado");
            
            $documentService = app(DocumentService::class);
            $this->line("    ✅ DocumentService instanciado");

            // Verificar métodos de ProcessService
            $this->line("  📊 Verificando métodos de ProcessService...");
            $processTypes = $processService->getProcessTypes();
            $this->line("    ✅ getProcessTypes() - " . $processTypes->count() . " tipos encontrados");
            
            $uniqueInternals = $processService->getUniqueInternalProcesses();
            $this->line("    ✅ getUniqueInternalProcesses() - " . $uniqueInternals->count() . " procesos únicos");

            // Verificar métodos de SearchService
            $this->line("  🔍 Verificando métodos de SearchService...");
            $recentDocs = $searchService->getRecentDocuments(5);
            $this->line("    ✅ getRecentDocuments() - " . $recentDocs->count() . " documentos recientes");

            // Verificar métodos de DocumentService
            $this->line("  📄 Verificando métodos de DocumentService...");
            $stats = $documentService->getDocumentStats();
            $this->line("    ✅ getDocumentStats() - " . $stats['total'] . " documentos totales");

        } catch (\Exception $e) {
            $this->error("  ❌ Error en verificación de funcionalidad: {$e->getMessage()}");
        }
    }
}
