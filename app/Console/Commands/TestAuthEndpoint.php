<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Http\Request;

class TestAuthEndpoint extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:auth-endpoint';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar endpoint de estadísticas de extensiones con autenticación';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Probando endpoint de estadísticas de extensiones...');
        
        // Crear usuario y token
        $user = User::where('email', 'victor@intiled.com')->first();
        if (!$user) {
            $this->error('❌ Usuario victor@intiled.com no encontrado');
            return;
        }
        
        $token = $user->createToken('test-token')->plainTextToken;
        $this->info("✅ Token creado: " . substr($token, 0, 20) . "...");
        
        // Simular request
        $request = Request::create('/api/documentos/estadisticas-extensiones', 'GET');
        $request->headers->set('Authorization', 'Bearer ' . $token);
        $request->headers->set('Accept', 'application/json');
        $request->headers->set('Content-Type', 'application/json');
        
        $this->info('📤 Headers enviados:');
        $this->line('   Authorization: Bearer ' . substr($token, 0, 20) . "...");
        $this->line('   Accept: application/json');
        $this->line('   Content-Type: application/json');
        
        // Ejecutar request
        $response = app()->handle($request);
        
        $this->info('📥 Respuesta recibida:');
        $this->line('   Status: ' . $response->getStatusCode());
        $this->line('   Content-Type: ' . $response->headers->get('Content-Type'));
        
        $content = $response->getContent();
        $this->line('   Content: ' . substr($content, 0, 200) . "...");
        
        if ($response->getStatusCode() === 200) {
            $this->info('✅ Endpoint funcionando correctamente');
        } else {
            $this->error('❌ Endpoint falló');
        }
        
        // Limpiar token
        $user->tokens()->delete();
    }
}
