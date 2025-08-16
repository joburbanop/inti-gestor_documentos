<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixLongLines extends Command
{
    protected $signature = 'fix:long-lines {--file=} {--max-length=120} {--dry-run}';
    protected $description = 'Identificar y corregir líneas muy largas en el código';

    private $maxLength;
    private $dryRun;
    private $filesFixed = 0;
    private $linesFixed = 0;

    public function handle()
    {
        $this->maxLength = (int) $this->option('max-length');
        $this->dryRun = $this->option('dry-run');
        $specificFile = $this->option('file');

        $this->info("🔍 Buscando líneas que excedan {$this->maxLength} caracteres...");
        $this->newLine();

        if ($specificFile) {
            $this->processFile($specificFile);
        } else {
            $this->processAllFiles();
        }

        $this->generateReport();
    }

    private function processAllFiles()
    {
        $directories = [
            'app/Http/Controllers/Api',
            'app/Services',
            'app/Models',
            'resources/js/components',
            'resources/js/services',
            'resources/js/hooks',
            'resources/js/utils',
            'routes'
        ];

        foreach ($directories as $dir) {
            if (is_dir($dir)) {
                $this->processDirectory($dir);
            }
        }
    }

    private function processDirectory($directory)
    {
        $this->info("📁 Procesando directorio: {$directory}");
        
        $files = $this->getFilesRecursively($directory);
        
        foreach ($files as $file) {
            $this->processFile($file);
        }
    }

    private function getFilesRecursively($directory)
    {
        $files = [];
        $items = scandir($directory);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            
            $path = $directory . '/' . $item;
            
            if (is_dir($path)) {
                $files = array_merge($files, $this->getFilesRecursively($path));
            } else {
                $extension = pathinfo($path, PATHINFO_EXTENSION);
                if (in_array($extension, ['php', 'js', 'jsx'])) {
                    $files[] = $path;
                }
            }
        }
        
        return $files;
    }

    private function processFile($filePath)
    {
        if (!file_exists($filePath)) {
            $this->warn("⚠️ Archivo no encontrado: {$filePath}");
            return;
        }

        $content = file_get_contents($filePath);
        $lines = explode("\n", $content);
        $modified = false;
        $longLines = [];

        foreach ($lines as $index => $line) {
            $lineNumber = $index + 1;
            $length = strlen($line);
            
            if ($length > $this->maxLength) {
                $longLines[] = [
                    'line' => $lineNumber,
                    'length' => $length,
                    'content' => $line
                ];
            }
        }

        if (empty($longLines)) {
            return;
        }

        $this->info("📄 Archivo: {$filePath} ({$this->getFileSize($filePath)})");
        $this->line("   Líneas largas encontradas: " . count($longLines));

        if ($this->dryRun) {
            $this->showLongLines($longLines);
            return;
        }

        $newContent = $this->fixLongLines($lines, $longLines);
        
        if ($newContent !== $content) {
            file_put_contents($filePath, $newContent);
            $this->filesFixed++;
            $this->linesFixed += count($longLines);
            $this->info("   ✅ Archivo corregido");
        }
    }

    private function showLongLines($longLines)
    {
        foreach ($longLines as $longLine) {
            $this->line("   Línea {$longLine['line']} ({$longLine['length']} chars):");
            $this->line("   " . substr($longLine['content'], 0, 80) . "...");
        }
    }

    private function fixLongLines($lines, $longLines)
    {
        $newLines = $lines;
        
        foreach ($longLines as $longLine) {
            $lineIndex = $longLine['line'] - 1;
            $originalLine = $newLines[$lineIndex];
            
            $fixedLine = $this->breakLongLine($originalLine);
            
            if ($fixedLine !== $originalLine) {
                $newLines[$lineIndex] = $fixedLine;
            }
        }
        
        return implode("\n", $newLines);
    }

    private function breakLongLine($line)
    {
        $trimmedLine = trim($line);
        $indentation = $this->getIndentation($line);
        
        // Si es un comentario, dividir de manera diferente
        if (str_starts_with($trimmedLine, '//') || str_starts_with($trimmedLine, '/*')) {
            return $this->breakCommentLine($line, $indentation);
        }
        
        // Si es una cadena de texto larga
        if (preg_match('/^.*[\'"][^\'"]*[\'"].*$/', $trimmedLine)) {
            return $this->breakStringLine($line, $indentation);
        }
        
        // Si es una llamada de función larga
        if (str_contains($trimmedLine, '(') && str_contains($trimmedLine, ')')) {
            return $this->breakFunctionCall($line, $indentation);
        }
        
        // Si es una asignación larga
        if (str_contains($trimmedLine, '=')) {
            return $this->breakAssignment($line, $indentation);
        }
        
        // Si es una cadena de métodos (method chaining)
        if (str_contains($trimmedLine, '->') || str_contains($trimmedLine, '.')) {
            return $this->breakMethodChain($line, $indentation);
        }
        
        // División genérica por espacios
        return $this->breakGenericLine($line, $indentation);
    }

    private function breakCommentLine($line, $indentation)
    {
        $trimmedLine = trim($line);
        $commentStart = '';
        
        if (str_starts_with($trimmedLine, '//')) {
            $commentStart = '// ';
            $content = substr($trimmedLine, 3);
        } elseif (str_starts_with($trimmedLine, '/*')) {
            $commentStart = '/* ';
            $content = substr($trimmedLine, 3);
        } else {
            return $line;
        }
        
        $words = explode(' ', $content);
        $lines = [];
        $currentLine = $commentStart;
        
        foreach ($words as $word) {
            if (strlen($currentLine . $word) > $this->maxLength - strlen($indentation)) {
                $lines[] = $indentation . $currentLine;
                $currentLine = $commentStart . $word;
            } else {
                $currentLine .= ($currentLine === $commentStart ? '' : ' ') . $word;
            }
        }
        
        if (!empty($currentLine)) {
            $lines[] = $indentation . $currentLine;
        }
        
        return implode("\n", $lines);
    }

    private function breakStringLine($line, $indentation)
    {
        // Buscar cadenas de texto y dividirlas
        $pattern = '/([\'"])([^\'"]*)\1/';
        $parts = preg_split($pattern, $line, -1, PREG_SPLIT_DELIM_CAPTURE);
        
        if (count($parts) < 3) {
            return $this->breakGenericLine($line, $indentation);
        }
        
        $result = '';
        $currentLine = $indentation;
        
        for ($i = 0; $i < count($parts); $i++) {
            $part = $parts[$i];
            
            if ($part === '"' || $part === "'") {
                $currentLine .= $part;
            } elseif (strlen($part) > 50) {
                // Dividir cadena larga
                $chunks = str_split($part, 50);
                $currentLine .= $chunks[0];
                
                for ($j = 1; $j < count($chunks); $j++) {
                    $result .= $currentLine . "\n";
                    $currentLine = $indentation . '    ' . $chunks[$j];
                }
            } else {
                $currentLine .= $part;
            }
            
            if (strlen($currentLine) > $this->maxLength) {
                $result .= $currentLine . "\n";
                $currentLine = $indentation;
            }
        }
        
        return $result . $currentLine;
    }

    private function breakFunctionCall($line, $indentation)
    {
        $trimmedLine = trim($line);
        
        // Encontrar la posición del paréntesis de apertura
        $openParenPos = strpos($trimmedLine, '(');
        $closeParenPos = strrpos($trimmedLine, ')');
        
        if ($openParenPos === false || $closeParenPos === false) {
            return $this->breakGenericLine($line, $indentation);
        }
        
        $functionName = substr($trimmedLine, 0, $openParenPos);
        $parameters = substr($trimmedLine, $openParenPos + 1, $closeParenPos - $openParenPos - 1);
        $afterClose = substr($trimmedLine, $closeParenPos + 1);
        
        $result = $indentation . $functionName . "(\n";
        
        // Dividir parámetros
        $params = explode(',', $parameters);
        $paramIndentation = $indentation . '    ';
        
        foreach ($params as $index => $param) {
            $param = trim($param);
            if (!empty($param)) {
                $result .= $paramIndentation . $param;
                if ($index < count($params) - 1) {
                    $result .= ',';
                }
                $result .= "\n";
            }
        }
        
        $result .= $indentation . ')' . $afterClose;
        
        return $result;
    }

    private function breakAssignment($line, $indentation)
    {
        $trimmedLine = trim($line);
        $equalPos = strpos($trimmedLine, '=');
        
        if ($equalPos === false) {
            return $this->breakGenericLine($line, $indentation);
        }
        
        $variable = trim(substr($trimmedLine, 0, $equalPos));
        $value = trim(substr($trimmedLine, $equalPos + 1));
        
        if (strlen($value) > $this->maxLength - strlen($indentation) - 10) {
            return $indentation . $variable . " =\n" . 
                   $indentation . "    " . $value;
        }
        
        return $line;
    }

    private function breakMethodChain($line, $indentation)
    {
        $trimmedLine = trim($line);
        
        // Dividir por -> o .
        $parts = preg_split('/(->|\.)/', $trimmedLine, -1, PREG_SPLIT_DELIM_CAPTURE);
        
        if (count($parts) < 3) {
            return $this->breakGenericLine($line, $indentation);
        }
        
        $result = $indentation . $parts[0];
        $methodIndentation = $indentation . '    ';
        
        for ($i = 1; $i < count($parts); $i += 2) {
            $operator = $parts[$i];
            $method = $parts[$i + 1] ?? '';
            
            $result .= "\n" . $methodIndentation . $operator . $method;
        }
        
        return $result;
    }

    private function breakGenericLine($line, $indentation)
    {
        $trimmedLine = trim($line);
        $words = explode(' ', $trimmedLine);
        $lines = [];
        $currentLine = '';
        
        foreach ($words as $word) {
            if (strlen($currentLine . $word) > $this->maxLength - strlen($indentation)) {
                if (!empty($currentLine)) {
                    $lines[] = $indentation . $currentLine;
                }
                $currentLine = $word;
            } else {
                $currentLine .= (empty($currentLine) ? '' : ' ') . $word;
            }
        }
        
        if (!empty($currentLine)) {
            $lines[] = $indentation . $currentLine;
        }
        
        return implode("\n", $lines);
    }

    private function getIndentation($line)
    {
        $indentation = '';
        for ($i = 0; $i < strlen($line); $i++) {
            if ($line[$i] === ' ' || $line[$i] === "\t") {
                $indentation .= $line[$i];
            } else {
                break;
            }
        }
        return $indentation;
    }

    private function getFileSize($filePath)
    {
        $size = filesize($filePath);
        if ($size < 1024) {
            return $size . ' B';
        } elseif ($size < 1024 * 1024) {
            return round($size / 1024, 1) . ' KB';
        } else {
            return round($size / (1024 * 1024), 1) . ' MB';
        }
    }

    private function generateReport()
    {
        $this->newLine();
        $this->info('📊 REPORTE DE CORRECCIÓN DE LÍNEAS LARGAS');
        $this->line('=' . str_repeat('=', 50));
        
        if ($this->dryRun) {
            $this->info('🔍 Modo de prueba - No se realizaron cambios');
        } else {
            $this->info("✅ Archivos corregidos: {$this->filesFixed}");
            $this->info("✅ Líneas corregidas: {$this->linesFixed}");
        }
        
        $this->newLine();
        $this->info('💡 Uso del comando:');
        $this->line('   php artisan fix:long-lines                    # Corregir todos los archivos');
        $this->line('   php artisan fix:long-lines --dry-run          # Solo mostrar líneas largas');
        $this->line('   php artisan fix:long-lines --file=path/to/file # Corregir archivo específico');
        $this->line('   php artisan fix:long-lines --max-length=100   # Cambiar longitud máxima');
    }
}
