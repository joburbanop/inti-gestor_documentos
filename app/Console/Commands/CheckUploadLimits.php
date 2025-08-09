<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckUploadLimits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'upload:check-limits';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar y configurar límites de subida de archivos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando límites de subida de archivos...');
        
        // Verificar límites actuales
        $uploadMaxFilesize = ini_get('upload_max_filesize');
        $postMaxSize = ini_get('post_max_size');
        $maxExecutionTime = ini_get('max_execution_time');
        $maxInputTime = ini_get('max_input_time');
        $memoryLimit = ini_get('memory_limit');
        
        $this->table(
            ['Configuración', 'Valor Actual', 'Recomendado', 'Estado'],
            [
                ['upload_max_filesize', $uploadMaxFilesize, '50M', $this->getStatus($uploadMaxFilesize, '50M')],
                ['post_max_size', $postMaxSize, '50M', $this->getStatus($postMaxSize, '50M')],
                ['max_execution_time', $maxExecutionTime, '300', $this->getStatus($maxExecutionTime, '300')],
                ['max_input_time', $maxInputTime, '300', $this->getStatus($maxInputTime, '300')],
                ['memory_limit', $memoryLimit, '256M', $this->getStatus($memoryLimit, '256M')],
            ]
        );
        
        // Intentar configurar límites dinámicamente
        $this->info('⚙️ Configurando límites dinámicamente...');
        
        if (function_exists('ini_set')) {
            ini_set('upload_max_filesize', '50M');
            ini_set('post_max_size', '50M');
            ini_set('max_execution_time', '300');
            ini_set('max_input_time', '300');
            ini_set('memory_limit', '256M');
            
            $this->info('✅ Límites configurados dinámicamente');
        } else {
            $this->error('❌ No se puede configurar límites dinámicamente');
        }
        
        // Verificar límites después de la configuración
        $this->info('🔍 Verificando límites después de la configuración...');
        
        $uploadMaxFilesizeAfter = ini_get('upload_max_filesize');
        $postMaxSizeAfter = ini_get('post_max_size');
        
        $this->table(
            ['Configuración', 'Valor Después', 'Estado'],
            [
                ['upload_max_filesize', $uploadMaxFilesizeAfter, $this->getStatus($uploadMaxFilesizeAfter, '50M')],
                ['post_max_size', $postMaxSizeAfter, $this->getStatus($postMaxSizeAfter, '50M')],
            ]
        );
        
        // Recomendaciones
        $this->info('📋 Recomendaciones:');
        $this->line('1. Reinicia el servidor web (Apache/Nginx)');
        $this->line('2. Reinicia PHP-FPM si lo usas');
        $this->line('3. Verifica la configuración en php.ini');
        $this->line('4. Si usas Nginx, configura client_max_body_size 50M');
        
        return 0;
    }
    
    private function getStatus($current, $recommended): string
    {
        $currentBytes = $this->convertToBytes($current);
        $recommendedBytes = $this->convertToBytes($recommended);
        
        if ($currentBytes >= $recommendedBytes) {
            return '✅ OK';
        } else {
            return '❌ BAJO';
        }
    }
    
    private function convertToBytes($value): int
    {
        $value = strtolower(trim($value));
        $last = strtolower($value[strlen($value)-1]);
        $value = (int) $value;
        
        switch($last) {
            case 'g':
                $value *= 1024;
            case 'm':
                $value *= 1024;
            case 'k':
                $value *= 1024;
        }
        
        return $value;
    }
}
