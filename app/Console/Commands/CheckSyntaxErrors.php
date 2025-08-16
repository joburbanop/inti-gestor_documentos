<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckSyntaxErrors extends Command
{
    protected $signature = 'check:syntax-errors {--file=}';
    protected $description = 'Verificar errores de sintaxis en archivos PHP';

    private $errors = [];
    private $filesChecked = 0;

    public function handle()
    {
        $this->info('🔍 Verificando errores de sintaxis en archivos PHP...');
        $this->newLine();

        $specificFile = $this->option('file');

        if ($specificFile) {
            $this->checkFile($specificFile);
        } else {
            $this->checkAllFiles();
        }

        $this->generateReport();
    }

    private function checkAllFiles()
    {
        $directories = [
            'app/Http/Controllers',
            'app/Services',
            'app/Models',
            'app/Http/Middleware',
            'app/Http/Requests',
            'config',
            'routes',
            'database/migrations',
            'database/seeders'
        ];

        foreach ($directories as $dir) {
            if (is_dir($dir)) {
                $this->checkDirectory($dir);
            }
        }
    }

    private function checkDirectory($directory)
    {
        $this->info("📁 Verificando directorio: {$directory}");
        
        $files = $this->getPhpFiles($directory);
        
        foreach ($files as $file) {
            $this->checkFile($file);
        }
    }

    private function getPhpFiles($directory)
    {
        $files = [];
        $items = scandir($directory);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            
            $path = $directory . '/' . $item;
            
            if (is_dir($path)) {
                $files = array_merge($files, $this->getPhpFiles($path));
            } elseif (pathinfo($path, PATHINFO_EXTENSION) === 'php') {
                $files[] = $path;
            }
        }
        
        return $files;
    }

    private function checkFile($filePath)
    {
        $this->filesChecked++;
        
        $output = [];
        $returnCode = 0;
        
        exec("php -l {$filePath} 2>&1", $output, $returnCode);
        
        if ($returnCode !== 0) {
            $this->errors[] = [
                'file' => $filePath,
                'output' => implode("\n", $output)
            ];
            $this->error("❌ {$filePath}");
        } else {
            $this->line("✅ {$filePath}");
        }
    }

    private function generateReport()
    {
        $this->newLine();
        $this->info('📊 REPORTE DE VERIFICACIÓN DE SINTAXIS');
        $this->line('=' . str_repeat('=', 50));
        $this->newLine();

        $this->info("📈 ESTADÍSTICAS:");
        $this->line("   Archivos verificados: {$this->filesChecked}");
        $this->line("   Errores encontrados: " . count($this->errors));
        $this->newLine();

        if (empty($this->errors)) {
            $this->info('🎉 ¡Excelente! No se encontraron errores de sintaxis.');
            $this->info('✅ Todos los archivos PHP están sintácticamente correctos.');
        } else {
            $this->error('❌ ERRORES DE SINTAXIS ENCONTRADOS:');
            $this->newLine();
            
            foreach ($this->errors as $error) {
                $this->error("📄 Archivo: {$error['file']}");
                $this->line("   {$error['output']}");
                $this->newLine();
            }

            $this->error('🔧 ACCIONES RECOMENDADAS:');
            $this->line('   1. Corregir los errores de sintaxis mostrados arriba');
            $this->line('   2. Verificar que todas las comillas estén correctamente cerradas');
            $this->line('   3. Verificar que todos los paréntesis estén balanceados');
            $this->line('   4. Verificar que todas las llaves estén balanceadas');
            $this->line('   5. Ejecutar nuevamente este comando después de las correcciones');
        }

        $this->newLine();
        $this->line('=' . str_repeat('=', 50));
    }
}
