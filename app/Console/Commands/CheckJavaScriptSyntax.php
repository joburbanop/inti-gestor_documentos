<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckJavaScriptSyntax extends Command
{
    protected $signature = 'check:javascript-syntax {--file=}';
    protected $description = 'Verificar errores de sintaxis en archivos JavaScript/JSX';

    private $errors = [];
    private $filesChecked = 0;

    public function handle()
    {
        $this->info('🔍 Verificando errores de sintaxis en archivos JavaScript/JSX...');
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
                $this->checkDirectory($dir);
            }
        }
    }

    private function checkDirectory($directory)
    {
        $this->info("📁 Verificando directorio: {$directory}");
        
        $files = $this->getJsFiles($directory);
        
        foreach ($files as $file) {
            $this->checkFile($file);
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

    private function checkFile($filePath)
    {
        $this->filesChecked++;
        
        // Leer el contenido del archivo
        $content = file_get_contents($filePath);
        
        // Verificar errores comunes de sintaxis
        $errors = $this->checkCommonErrors($content, $filePath);
        
        if (empty($errors)) {
            $this->line("✅ {$filePath}");
        } else {
            $this->errors[] = [
                'file' => $filePath,
                'errors' => $errors
            ];
            $this->error("❌ {$filePath}");
        }
    }

    private function checkCommonErrors($content, $filePath)
    {
        $errors = [];
        $lines = explode("\n", $content);
        
        foreach ($lines as $lineNumber => $line) {
            $lineNum = $lineNumber + 1;
            $trimmedLine = trim($line);
            
            // Verificar comillas no balanceadas
            if ($this->hasUnbalancedQuotes($trimmedLine)) {
                $errors[] = "Línea {$lineNum}: Comillas no balanceadas";
            }
            
            // Verificar paréntesis no balanceados
            if ($this->hasUnbalancedParentheses($trimmedLine)) {
                $errors[] = "Línea {$lineNum}: Paréntesis no balanceados";
            }
            
            // Verificar llaves no balanceadas
            if ($this->hasUnbalancedBraces($trimmedLine)) {
                $errors[] = "Línea {$lineNum}: Llaves no balanceadas";
            }
            
            // Verificar corchetes no balanceados
            if ($this->hasUnbalancedBrackets($trimmedLine)) {
                $errors[] = "Línea {$lineNum}: Corchetes no balanceados";
            }
            
            // Verificar líneas cortadas incorrectamente
            if ($this->hasBrokenLine($trimmedLine)) {
                $errors[] = "Línea {$lineNum}: Línea cortada incorrectamente";
            }
            
            // Verificar sintaxis de arrow functions
            if ($this->hasBrokenArrowFunction($trimmedLine)) {
                $errors[] = "Línea {$lineNum}: Arrow function mal formateada";
            }
            
            // Verificar sintaxis de objetos
            if ($this->hasBrokenObject($trimmedLine)) {
                $errors[] = "Línea {$lineNum}: Objeto mal formateado";
            }
        }
        
        return $errors;
    }

    private function hasUnbalancedQuotes($line)
    {
        $singleQuotes = substr_count($line, "'") - substr_count($line, "\\'");
        $doubleQuotes = substr_count($line, '"') - substr_count($line, '\\"');
        $backticks = substr_count($line, '`') - substr_count($line, '\\`');
        
        return ($singleQuotes % 2 !== 0) || ($doubleQuotes % 2 !== 0) || ($backticks % 2 !== 0);
    }

    private function hasUnbalancedParentheses($line)
    {
        $open = substr_count($line, '(');
        $close = substr_count($line, ')');
        return $open !== $close;
    }

    private function hasUnbalancedBraces($line)
    {
        $open = substr_count($line, '{');
        $close = substr_count($line, '}');
        return $open !== $close;
    }

    private function hasUnbalancedBrackets($line)
    {
        $open = substr_count($line, '[');
        $close = substr_count($line, ']');
        return $open !== $close;
    }

    private function hasBrokenLine($line)
    {
        // Verificar si una línea termina con operadores o caracteres que indican continuación
        $brokenPatterns = [
            '/,\s*$/',           // Coma al final
            '/\+\s*$/',          // Más al final
            '/-\s*$/',           // Menos al final
            '/\*\s*$/',          // Asterisco al final
            '/\/\s*$/',          // Slash al final
            '/=\s*$/',           // Igual al final
            '/=>\s*$/',          // Arrow function al final
            '/\.\s*$/',          // Punto al final
            '/\(\s*$/',          // Paréntesis abierto al final
            '/{\s*$/',           // Llave abierta al final
            '/\[\s*$/',          // Corchete abierto al final
        ];
        
        foreach ($brokenPatterns as $pattern) {
            if (preg_match($pattern, $line) && !$this->isComment($line)) {
                return true;
            }
        }
        
        return false;
    }

    private function hasBrokenArrowFunction($line)
    {
        // Verificar arrow functions mal formateadas
        $brokenArrowPatterns = [
            '/=>\s*$/',          // Arrow function al final sin cuerpo
            '/\(\s*=>\s*$/',     // Arrow function con paréntesis al final
            '/=>\s*{?\s*$/',     // Arrow function con llave al final
        ];
        
        foreach ($brokenArrowPatterns as $pattern) {
            if (preg_match($pattern, $line) && !$this->isComment($line)) {
                return true;
            }
        }
        
        return false;
    }

    private function hasBrokenObject($line)
    {
        // Verificar objetos mal formateados
        $brokenObjectPatterns = [
            '/{\s*[^}]*$/',      // Llave abierta sin cerrar
            '/\[\s*[^\]]*$/',    // Corchete abierto sin cerrar
            '/:\s*[^,}]*$/',     // Propiedad sin cerrar
            '/,\s*[^,}]*$/',     // Coma sin siguiente propiedad
        ];
        
        foreach ($brokenObjectPatterns as $pattern) {
            if (preg_match($pattern, $line) && !$this->isComment($line)) {
                return true;
            }
        }
        
        return false;
    }

    private function isComment($line)
    {
        $trimmed = trim($line);
        return strpos($trimmed, '//') === 0 || strpos($trimmed, '/*') === 0 || strpos($trimmed, '*') === 0;
    }

    private function generateReport()
    {
        $this->newLine();
        $this->info('📊 REPORTE DE VERIFICACIÓN DE SINTAXIS JAVASCRIPT');
        $this->line('=' . str_repeat('=', 60));
        $this->newLine();

        $this->info("📈 ESTADÍSTICAS:");
        $this->line("   Archivos verificados: {$this->filesChecked}");
        $this->line("   Errores encontrados: " . count($this->errors));
        $this->newLine();

        if (empty($this->errors)) {
            $this->info('🎉 ¡Excelente! No se encontraron errores de sintaxis.');
            $this->info('✅ Todos los archivos JavaScript/JSX están sintácticamente correctos.');
        } else {
            $this->error('❌ ERRORES DE SINTAXIS ENCONTRADOS:');
            $this->newLine();
            
            foreach ($this->errors as $error) {
                $this->error("📄 Archivo: {$error['file']}");
                foreach ($error['errors'] as $err) {
                    $this->line("   {$err}");
                }
                $this->newLine();
            }

            $this->error('🔧 ACCIONES RECOMENDADAS:');
            $this->line('   1. Corregir los errores de sintaxis mostrados arriba');
            $this->line('   2. Verificar que todas las comillas estén correctamente cerradas');
            $this->line('   3. Verificar que todos los paréntesis estén balanceados');
            $this->line('   4. Verificar que todas las llaves y corchetes estén balanceados');
            $this->line('   5. Verificar que las líneas no estén cortadas incorrectamente');
            $this->line('   6. Ejecutar nuevamente este comando después de las correcciones');
        }

        $this->newLine();
        $this->line('=' . str_repeat('=', 60));
    }
}
