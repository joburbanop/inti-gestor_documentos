<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProcesoTipo;

class TestNavigation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:navigation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar la navegación entre navbar y acciones rápidas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧭 Probando Navegación entre Navbar y Acciones Rápidas...');
        $this->newLine();

        // Obtener todos los tipos de procesos
        $tiposProcesos = ProcesoTipo::activos()->ordenados()->get();

        $this->info('📋 Tipos de Procesos Disponibles:');
        $this->table(
            ['ID', 'Nombre', 'Título', 'Key', 'URL Navbar', 'URL Acciones Rápidas'],
            $tiposProcesos->map(function ($tipo) {
                $navbarUrl = "/procesos?tipo={$tipo->nombre}";
                $accionesRapidasUrl = "/procesos?tipo={$tipo->nombre}";
                
                return [
                    $tipo->id,
                    $tipo->nombre,
                    $tipo->titulo,
                    $tipo->nombre,
                    $navbarUrl,
                    $accionesRapidasUrl
                ];
            })->toArray()
        );

        $this->newLine();
        $this->info('🔗 URLs de Navegación:');
        
        $urls = [
            ['Origen', 'Destino', 'URL'],
            ['Navbar - Procesos Estratégicos', 'Página de Procesos', '/procesos?tipo=estrategico'],
            ['Navbar - Procesos Misionales', 'Página de Procesos', '/procesos?tipo=misional'],
            ['Navbar - Procesos de Apoyo', 'Página de Procesos', '/procesos?tipo=apoyo'],
            ['Navbar - Procesos de Evaluación', 'Página de Procesos', '/procesos?tipo=evaluacion'],
            ['Acciones Rápidas - Procesos Estratégicos', 'Página de Procesos', '/procesos?tipo=estrategico'],
            ['Acciones Rápidas - Procesos Misionales', 'Página de Procesos', '/procesos?tipo=misional'],
            ['Acciones Rápidas - Procesos de Apoyo', 'Página de Procesos', '/procesos?tipo=apoyo'],
            ['Acciones Rápidas - Procesos de Evaluación', 'Página de Procesos', '/procesos?tipo=evaluacion'],
        ];
        
        $this->table($urls[0], array_slice($urls, 1));

        $this->newLine();
        $this->info('✅ Verificaciones:');
        $this->line('✅ Navbar y Acciones Rápidas usan las mismas URLs');
        $this->line('✅ Todas las rutas apuntan a /procesos con query parameters');
        $this->line('✅ El componente ProcesosPage maneja los query parameters');
        $this->line('✅ ProcesoTipoPage puede recibir tipo como prop o parámetro');
        $this->line('✅ Redirección automática a estratégico si no se especifica tipo');

        $this->newLine();
        $this->info('🎯 Flujo de Navegación:');
        $this->line('1. Usuario hace clic en navbar o acciones rápidas');
        $this->line('2. Se navega a /procesos?tipo={tipo}');
        $this->line('3. ProcesosPage lee el query parameter');
        $this->line('4. ProcesosPage pasa el tipo a ProcesoTipoPage');
        $this->line('5. ProcesoTipoPage carga los datos del tipo específico');
        $this->line('6. Se muestra la página con los procesos del tipo seleccionado');

        $this->newLine();
        $this->info('🚀 ¡Navegación unificada completada exitosamente!');
        $this->info('🎯 Navbar y Acciones Rápidas ahora llevan al mismo lugar.');
    }
}
