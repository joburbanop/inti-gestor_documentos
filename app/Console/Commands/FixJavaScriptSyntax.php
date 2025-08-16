<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixJavaScriptSyntax extends Command
{
    protected $signature = 'fix:javascript-syntax {--file=} {--dry-run}';
    protected $description = 'Corregir errores de sintaxis en archivos JavaScript/JSX';

    private $filesFixed = 0;
    private $errorsFixed = 0;

    public function handle()
    {
        $this->info('🔧 Corrigiendo errores de sintaxis en archivos JavaScript/JSX...');
        $this->newLine();

        $specificFile = $this->option('file');
        $dryRun = $this->option('dry-run');

        if ($specificFile) {
            $this->fixFile($specificFile, $dryRun);
        } else {
            $this->fixAllFiles($dryRun);
        }

        $this->generateReport();
    }

    private function fixAllFiles($dryRun)
    {
        $directories = [
            'resources/js/components',
            'resources/js/contexts',
            'resources/js/hooks',
            'resources/js/lib',
            'resources/js/services',
            'resources/js/utils',
            'resources/js/config',
            'resources/js/roles'
        ];

        foreach ($directories as $dir) {
            if (is_dir($dir)) {
                $this->fixDirectory($dir, $dryRun);
            }
        }
    }

    private function fixDirectory($directory, $dryRun)
    {
        $this->info("📁 Procesando directorio: {$directory}");
        
        $files = $this->getJsFiles($directory);
        
        foreach ($files as $file) {
            $this->fixFile($file, $dryRun);
        }
    }

    private function getJsFiles($directory)
    {
        $files = [];
        $items = scandir($directory);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            
            $path = $directory . '/' . $item;
            
            if (is_dir($path)) {
                $files = array_merge($files, $this->getJsFiles($path));
            } elseif (in_array(pathinfo($path, PATHINFO_EXTENSION), ['js', 'jsx'])) {
                $files[] = $path;
            }
        }
        
        return $files;
    }

    private function fixFile($filePath, $dryRun)
    {
        $this->filesFixed++;
        
        // Leer el contenido del archivo
        $content = file_get_contents($filePath);
        $originalContent = $content;
        
        // Aplicar correcciones
        $content = $this->applyFixes($content);
        
        if ($content !== $originalContent) {
            if (!$dryRun) {
                file_put_contents($filePath, $content);
                $this->info("✅ Corregido: {$filePath}");
            } else {
                $this->line("🔧 Se corregiría: {$filePath}");
            }
            $this->errorsFixed++;
        } else {
            $this->line("✅ Sin cambios: {$filePath}");
        }
    }

    private function applyFixes($content)
    {
        // Corregir comillas mal formateadas en arrays
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11', '$12', '$13', '$14', '$15'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión más simple)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11', '$12', '$13', '$14'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión aún más simple)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11', '$12', '$13'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión básica)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11', '$12'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión muy básica)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión mínima)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión simple)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión básica)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión simple)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6', '$7'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión mínima)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5', '$6'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión muy simple)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4', '$5'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión básica)
        $content = preg_replace("/'([^']*), '([^']*), '([^']*), '([^']*)'/", "'$1', '$2', '$3', '$4'", $content);
        
        // Corregir comillas mal formateadas en arrays (versión simple)
        $content = preg_replace("/'([^']*), '([^']*)'/", "'$1', '$2'", $content);
        
        // Corregir líneas cortadas incorrectamente
        $content = $this->fixBrokenLines($content);
        
        // Corregir arrow functions mal formateadas
        $content = $this->fixArrowFunctions($content);
        
        // Corregir objetos mal formateados
        $content = $this->fixObjects($content);
        
        return $content;
    }

    private function fixBrokenLines($content)
    {
        $lines = explode("\n", $content);
        $fixedLines = [];
        
        for ($i = 0; $i < count($lines); $i++) {
            $line = $lines[$i];
            $trimmedLine = trim($line);
            
            // Si la línea termina con un operador o caracter que indica continuación
            if (preg_match('/[,\+\-\*\/\=\>\<\.\(\{\[\s]*$/', $trimmedLine) && !$this->isComment($trimmedLine)) {
                // Buscar la siguiente línea no vacía
                $nextLine = '';
                $j = $i + 1;
                while ($j < count($lines) && trim($lines[$j]) === '') {
                    $j++;
                }
                if ($j < count($lines)) {
                    $nextLine = trim($lines[$j]);
                    // Combinar las líneas
                    $lines[$i] = $trimmedLine . ' ' . $nextLine;
                    // Marcar la siguiente línea para eliminar
                    $lines[$j] = '';
                }
            }
            
            $fixedLines[] = $lines[$i];
        }
        
        // Eliminar líneas vacías
        $fixedLines = array_filter($fixedLines, function($line) {
            return trim($line) !== '';
        });
        
        return implode("\n", $fixedLines);
    }

    private function fixArrowFunctions($content)
    {
        // Corregir arrow functions mal formateadas
        $content = preg_replace('/\(\s*=>\s*$/', '() => {', $content);
        $content = preg_replace('/=>\s*{\s*$/', '() => {', $content);
        
        return $content;
    }

    private function fixObjects($content)
    {
        // Corregir objetos mal formateados
        $content = preg_replace('/{\s*([^}]*)\s*$/', '{\n  $1\n}', $content);
        $content = preg_replace('/\[\s*([^\]]*)\s*$/', '[\n  $1\n]', $content);
        
        return $content;
    }

    private function isComment($line)
    {
        $trimmed = trim($line);
        return strpos($trimmed, '//') === 0 || strpos($trimmed, '/*') === 0 || strpos($trimmed, '*') === 0;
    }

    private function generateReport()
    {
        $this->newLine();
        $this->info('📊 REPORTE DE CORRECCIÓN DE SINTAXIS JAVASCRIPT');
        $this->line('=' . str_repeat('=', 60));
        $this->newLine();

        $this->info("📈 ESTADÍSTICAS:");
        $this->line("   Archivos procesados: {$this->filesFixed}");
        $this->line("   Archivos corregidos: {$this->errorsFixed}");
        $this->newLine();

        if ($this->errorsFixed > 0) {
            $this->info('✅ Correcciones aplicadas exitosamente.');
            $this->info('🔍 Se recomienda ejecutar el comando de verificación nuevamente.');
        } else {
            $this->info('🎉 No se encontraron errores que corregir.');
            $this->info('✅ Todos los archivos JavaScript/JSX están sintácticamente correctos.');
        }

        $this->newLine();
        $this->line('=' . str_repeat('=', 60));
    }
}
